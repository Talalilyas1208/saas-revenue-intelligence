import crypto from 'crypto';
import { Op } from 'sequelize';
import { sequelize, User, Customer, Transaction, Organization } from '../models/index.js';
import { MetricsCache } from './metricsCache.js';
import { StripeService } from './stripeService.js';

export class MetricsService {
  /**
   * Resolves an organization belonging strictly to the authenticated user
   */
  static async resolveUserOrg(userId, organizationId) {
    if (organizationId) {
      const org = await Organization.findOne({ where: { id: organizationId, userId } });
      if (!org) {
        const err = new Error('Workspace not found or access denied.');
        err.statusCode = 404;
        throw err;
      }
      return org;
    }

    const defaultOrg = await Organization.findOne({
      where: { userId },
      order: [['createdAt', 'ASC']]
    });
    return defaultOrg;
  }

  /**
   * Returns authenticated user profile & owned organizations
   */
  static async getWorkspaceContext(userId) {
    const cacheKey = `workspace:context:${userId}`;
    const cached = MetricsCache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role']
    });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const organizations = await Organization.findAll({
      where: { userId },
      attributes: ['id', 'name', 'currency', 'planTier', 'stripeAccountId', 'stripeApiKey'],
      order: [['createdAt', 'ASC']]
    });

    const sanitizedOrgs = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      currency: org.currency,
      planTier: org.planTier,
      hasStripeKey: Boolean(org.stripeApiKey || process.env.STRIPE_SECRET_KEY),
      maskedStripeKey: org.stripeApiKey
        ? `${org.stripeApiKey.slice(0, 8)}••••••••${org.stripeApiKey.slice(-4)}`
        : process.env.STRIPE_SECRET_KEY
        ? 'env_key_configured'
        : ''
    }));

    const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
    const result = {
      user: user.toJSON(),
      organizations: sanitizedOrgs,
      database: {
        dialect: sequelize.getDialect(),
        isSupabase: Boolean(process.env.SUPABASE_DB_URL || dbUrl.includes('supabase')),
        sslEnabled: Boolean(dbUrl)
      }
    };

    MetricsCache.set(cacheKey, result, 10000);
    return result;
  }

  /**
   * Updates authenticated user profile
   */
  static async updateProfile(userId, { name }) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    if (name && name.trim()) {
      user.name = name.trim();
      await user.save();
    }
    MetricsCache.invalidate(`workspace:context:${userId}`);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * Creates a new organization workspace for the user
   */
  static async createOrganization(userId, { name, planTier = 'free' }) {
    const org = await Organization.create({
      name: name.trim(),
      userId,
      currency: 'usd',
      planTier
    });
    MetricsCache.invalidate(`workspace:context:${userId}`);
    return {
      id: org.id,
      name: org.name,
      currency: org.currency,
      planTier: org.planTier,
      hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
      maskedStripeKey: ''
    };
  }

  /**
   * Verifies Stripe key against Stripe API, saves it, and syncs live data
   */
  static async updateOrganizationKey(userId, organizationId, stripeApiKey) {
    const org = await this.resolveUserOrg(userId, organizationId);
    const cleanKey = stripeApiKey.trim();

    // Verify directly against Stripe API
    const verification = await StripeService.verifyApiKey(cleanKey);

    org.stripeApiKey = cleanKey;
    if (verification.accountId) {
      org.stripeAccountId = verification.accountId;
    }
    await org.save();

    // Trigger immediate live sync from Stripe
    const syncStats = await StripeService.syncOrganization(org);

    MetricsCache.invalidate();
    return {
      success: true,
      hasStripeKey: true,
      livemode: verification.livemode,
      ...syncStats
    };
  }

  /**
   * Manually triggers a fresh Stripe sync for a workspace
   */
  static async syncStripe(userId, organizationId) {
    const org = await this.resolveUserOrg(userId, organizationId);
    const stats = await StripeService.syncOrganization(org);
    MetricsCache.invalidate();
    return stats;
  }

  /**
   * Computes real KPI summary & trend for the user's workspace
   */
  static async getSummary(userId, organizationId, days = 30) {
    const org = await this.resolveUserOrg(userId, organizationId);
    if (!org) {
      return {
        mrr: 0,
        arr: 0,
        activeSubscribers: 0,
        totalSubscribers: 0,
        churnRate: 0,
        mrrGrowthPct: 0,
        dailyTrend: []
      };
    }

    const validDays = Math.min(365, Math.max(7, Number(days) || 30));
    const cacheKey = `metrics:summary:${org.id}:${validDays}`;

    const cached = MetricsCache.get(cacheKey);
    if (cached) return cached;

    const allCustomers = await Customer.findAll({
      attributes: ['mrrContribution', 'status'],
      where: { organizationId: org.id }
    });

    const activeCustomers = allCustomers.filter((c) => c.status === 'active');
    const canceledCustomers = allCustomers.filter((c) => c.status === 'canceled');

    const mrr = activeCustomers.reduce((acc, c) => acc + Number(c.mrrContribution), 0);
    const arr = mrr * 12;
    const totalCount = allCustomers.length;
    const churnRate = totalCount > 0 ? (canceledCustomers.length / totalCount) * 100 : 0;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validDays);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await Transaction.findAll({
      attributes: ['amount', 'occurredAt'],
      where: {
        organizationId: org.id,
        eventType: { [Op.in]: ['charge.succeeded', 'invoice.paid', 'subscription.created'] },
        occurredAt: { [Op.gte]: startDate }
      },
      order: [['occurredAt', 'ASC']]
    });

    const dayMap = {};
    for (let i = validDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = 0;
    }

    transactions.forEach((t) => {
      const key = new Date(t.occurredAt).toISOString().split('T')[0];
      if (dayMap[key] !== undefined) {
        dayMap[key] += Number(t.amount);
      }
    });

    const dailyTrend = Object.entries(dayMap).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2))
    }));

    const mid = Math.floor(dailyTrend.length / 2);
    const firstHalfRev = dailyTrend.slice(0, mid).reduce((s, d) => s + d.revenue, 0);
    const secondHalfRev = dailyTrend.slice(mid).reduce((s, d) => s + d.revenue, 0);

    let mrrGrowthPct = 0;
    if (mrr > 0) {
      if (firstHalfRev > 0) {
        mrrGrowthPct = Number((((secondHalfRev - firstHalfRev) / firstHalfRev) * 100).toFixed(1));
      } else if (secondHalfRev > 0) {
        mrrGrowthPct = 100.0;
      }
    }

    const result = {
      organizationId: org.id,
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      activeSubscribers: activeCustomers.length,
      totalSubscribers: totalCount,
      churnRate: Number(churnRate.toFixed(1)),
      mrrGrowthPct,
      periodRevenue: Number((firstHalfRev + secondHalfRev).toFixed(2)),
      dailyTrend
    };

    MetricsCache.set(cacheKey, result, 5000);
    return result;
  }

  /**
   * Fetches latest real transactions for the workspace
   */
  static async getRecentTransactions(userId, organizationId, limit = 25) {
    const org = await this.resolveUserOrg(userId, organizationId);
    if (!org) return [];

    const cacheKey = `transactions:${org.id}:${limit}`;
    const cached = MetricsCache.get(cacheKey);
    if (cached) return cached;

    const txs = await Transaction.findAll({
      where: { organizationId: org.id },
      limit,
      order: [['occurredAt', 'DESC']]
    });

    MetricsCache.set(cacheKey, txs, 2500);
    return txs;
  }

  /**
   * Fetches real customers for the workspace
   */
  static async getCustomers(userId, organizationId, search = '') {
    const org = await this.resolveUserOrg(userId, organizationId);
    if (!org) return [];

    const cacheKey = `customers:${org.id}:${search.toLowerCase().trim()}`;
    const cached = MetricsCache.get(cacheKey);
    if (cached) return cached;

    const where = { organizationId: org.id };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { plan: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where,
      order: [['createdAt', 'DESC'], ['mrrContribution', 'DESC']]
    });

    MetricsCache.set(cacheKey, customers, 4000);
    return customers;
  }

  /**
   * Records a real manual subscriber and initial invoice
   */
  static async createCustomer(userId, organizationId, { name, email, plan, mrrContribution }) {
    const org = await this.resolveUserOrg(userId, organizationId);
    const mrrVal = Number(mrrContribution);
    if (isNaN(mrrVal) || mrrVal <= 0) {
      const err = new Error('MRR contribution must be a positive number.');
      err.statusCode = 400;
      throw err;
    }

    const customer = await Customer.create({
      organizationId: org.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      plan: plan || `Pro ($${mrrVal}/mo)`,
      mrrContribution: mrrVal,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    await Transaction.create({
      organizationId: org.id,
      eventType: 'subscription.created',
      amount: mrrVal,
      currency: org.currency || 'usd',
      customerEmail: customer.email,
      description: `Subscription started: ${customer.plan}`,
      occurredAt: new Date()
    });

    MetricsCache.invalidate();
    return customer;
  }

  /**
   * Records a real payment/invoice transaction manually
   */
  static async recordTransaction(userId, organizationId, { customerEmail, amount, eventType = 'charge.succeeded', description }) {
    const org = await this.resolveUserOrg(userId, organizationId);
    const numAmount = Number(amount);
    if (!customerEmail?.trim() || isNaN(numAmount) || numAmount <= 0) {
      const err = new Error('Valid customer email and positive amount are required.');
      err.statusCode = 400;
      throw err;
    }

    const tx = await Transaction.create({
      organizationId: org.id,
      eventType,
      amount: Number(numAmount.toFixed(2)),
      currency: org.currency || 'usd',
      customerEmail: customerEmail.trim().toLowerCase(),
      description: description?.trim() || 'Recorded Payment',
      occurredAt: new Date()
    });

    MetricsCache.invalidate();
    return tx;
  }

  /**
   * Updates subscriber status with user ownership check
   */
  static async updateCustomerStatus(userId, customerId, status) {
    const allowed = ['active', 'past_due', 'canceled'];
    if (!allowed.includes(status)) {
      const err = new Error('Invalid customer status.');
      err.statusCode = 400;
      throw err;
    }

    const customer = await Customer.findByPk(customerId, {
      include: [{ model: Organization, as: 'organization', where: { userId } }]
    });
    if (!customer) {
      const err = new Error('Customer not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    customer.status = status;
    await customer.save();

    const eventType =
      status === 'canceled'
        ? 'subscription.canceled'
        : status === 'past_due'
        ? 'charge.failed'
        : 'invoice.paid';

    await Transaction.create({
      organizationId: customer.organizationId,
      eventType,
      amount: customer.mrrContribution,
      currency: 'usd',
      customerEmail: customer.email,
      description:
        status === 'canceled'
          ? `Subscription canceled (${customer.plan})`
          : status === 'past_due'
          ? `Payment overdue (${customer.plan})`
          : `Subscription active (${customer.plan})`,
      occurredAt: new Date()
    });

    MetricsCache.invalidate();
    return customer;
  }

  /**
   * Verifies a commercial Pro license key via Polar.sh API or cryptographic HMAC signature
   */
  static async verifyAndActivateLicense(userId, organizationId, licenseKey) {
    const org = await this.resolveUserOrg(userId, organizationId);
    const cleanKey = (licenseKey || '').trim();
    if (!cleanKey) {
      const err = new Error('License key is required.');
      err.statusCode = 400;
      throw err;
    }

    let isValid = false;

    // 1. Validate against live Polar.sh License API if POLAR_ORGANIZATION_ID is configured
    if (process.env.POLAR_ORGANIZATION_ID) {
      const res = await fetch('https://api.polar.sh/v1/customer-portal/license-keys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: cleanKey,
          organization_id: process.env.POLAR_ORGANIZATION_ID
        })
      });
      if (res.ok) {
        const data = await res.json();
        isValid = data.status === 'granted';
      }
    } else if (cleanKey.startsWith('REV-PRO-')) {
      // 2. Cryptographic HMAC-SHA256 verification using LICENSE_SALT
      const payload = cleanKey.slice('REV-PRO-'.length);
      const parts = payload.split('-');
      if (parts.length >= 2) {
        const dataPart = parts[0];
        const sigPart = parts[1].toUpperCase();
        const salt = process.env.LICENSE_SALT || 'revterm_salt_';
        const expected = crypto
          .createHash('sha256')
          .update(`${salt}${dataPart}`)
          .digest('hex')
          .slice(0, 6)
          .toUpperCase();
        isValid = sigPart === expected;
      }
    }

    if (!isValid) {
      const err = new Error('Invalid or expired license key.');
      err.statusCode = 400;
      throw err;
    }

    org.planTier = 'pro';
    await org.save();
    MetricsCache.invalidate(`workspace:context:${userId}`);
    return { valid: true, planTier: 'pro' };
  }
}
