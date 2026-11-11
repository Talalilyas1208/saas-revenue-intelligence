import Stripe from 'stripe';
import { Organization, Customer, Transaction } from '../models/index.js';
import { MetricsCache } from './metricsCache.js';

export class StripeService {
  /**
   * Verifies a Stripe API key directly against Stripe's API
   */
  static async verifyApiKey(apiKey) {
    const stripe = new Stripe(apiKey);
    // balance.retrieve works for both standard secret keys and restricted read-only keys
    const balance = await stripe.balance.retrieve();
    let accountId = null;
    try {
      const account = await stripe.accounts.retrieve();
      accountId = account.id;
    } catch {
      // Restricted keys without account read permission still succeed on balance.retrieve
      accountId = balance?.livemode ? 'acct_live_restricted' : 'acct_test_restricted';
    }
    return {
      valid: true,
      livemode: Boolean(balance?.livemode),
      accountId
    };
  }

  /**
   * Syncs real customers, subscriptions, and charges from Stripe into Sequelize
   */
  static async syncOrganization(organization) {
    const apiKey = organization.stripeApiKey || process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      const err = new Error('No Stripe API key configured for this workspace.');
      err.statusCode = 400;
      throw err;
    }

    const stripe = new Stripe(apiKey);
    let customersSynced = 0;
    let transactionsSynced = 0;

    // 1. Sync real subscriptions & customers
    const subscriptions = await stripe.subscriptions.list({
      status: 'all',
      expand: ['data.customer'],
      limit: 100
    });

    for (const sub of subscriptions.data) {
      const custObj = typeof sub.customer === 'object' ? sub.customer : null;
      const email = custObj?.email || `customer_${sub.customer}@stripe.local`;
      const name = custObj?.name || email.split('@')[0];

      // Calculate normalized monthly MRR
      let monthlyMrr = 0;
      let planLabel = 'Subscription';
      const item = sub.items?.data?.[0];
      if (item?.price) {
        const unitAmt = (item.price.unit_amount || 0) / 100;
        const qty = item.quantity || 1;
        const interval = item.price.recurring?.interval || 'month';
        const intervalCount = item.price.recurring?.interval_count || 1;

        if (interval === 'year') {
          monthlyMrr = (unitAmt * qty) / (12 * intervalCount);
        } else if (interval === 'week') {
          monthlyMrr = ((unitAmt * qty) * 4.33) / intervalCount;
        } else if (interval === 'day') {
          monthlyMrr = ((unitAmt * qty) * 30) / intervalCount;
        } else {
          monthlyMrr = (unitAmt * qty) / intervalCount;
        }
        planLabel = item.price.nickname || `${item.price.product ? 'Plan' : 'Tier'} ($${unitAmt}/${interval})`;
      }

      let mappedStatus = 'active';
      if (['past_due', 'unpaid', 'incomplete'].includes(sub.status)) {
        mappedStatus = 'past_due';
      } else if (['canceled', 'incomplete_expired'].includes(sub.status)) {
        mappedStatus = 'canceled';
      }

      const [record, created] = await Customer.findOrCreate({
        where: { organizationId: organization.id, email },
        defaults: {
          organizationId: organization.id,
          name,
          email,
          plan: planLabel,
          mrrContribution: Number(monthlyMrr.toFixed(2)),
          status: mappedStatus,
          joinedDate: new Date(sub.created * 1000).toISOString().split('T')[0]
        }
      });

      if (!created) {
        record.name = name;
        record.plan = planLabel;
        record.mrrContribution = Number(monthlyMrr.toFixed(2));
        record.status = mappedStatus;
        await record.save();
      }
      customersSynced++;
    }

    // 2. Sync real charges
    const charges = await stripe.charges.list({ limit: 100 });
    for (const ch of charges.data) {
      const existing = await Transaction.findOne({
        where: { organizationId: organization.id, stripeChargeId: ch.id }
      });
      if (existing) continue;

      const email = ch.billing_details?.email || ch.receipt_email || 'stripe-customer@unknown.com';
      const eventType = ch.status === 'succeeded' ? 'charge.succeeded' : 'charge.failed';

      await Transaction.create({
        organizationId: organization.id,
        stripeChargeId: ch.id,
        eventType,
        amount: Number(((ch.amount || 0) / 100).toFixed(2)),
        currency: (ch.currency || 'usd').toLowerCase(),
        customerEmail: email,
        description: ch.description || (ch.paid ? 'Stripe Charge' : ch.failure_message || 'Charge Failed'),
        occurredAt: new Date(ch.created * 1000)
      });
      transactionsSynced++;
    }

    MetricsCache.invalidate();
    return { customersSynced, transactionsSynced };
  }

  /**
   * Processes verified live Stripe webhook events
   */
  static async handleWebhook(rawBody, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    let event;
    if (webhookSecret && signature) {
      const stripe = new Stripe(stripeKey || 'sk_placeholder');
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else if (process.env.NODE_ENV !== 'production') {
      // In local dev without STRIPE_WEBHOOK_SECRET, parse signed JSON safely
      event = JSON.parse(rawBody.toString('utf8'));
    } else {
      const err = new Error('STRIPE_WEBHOOK_SECRET must be configured in production.');
      err.statusCode = 400;
      throw err;
    }

    // Match organization by Stripe account ID or fallback to primary org
    const org =
      (event.account && (await Organization.findOne({ where: { stripeAccountId: event.account } }))) ||
      (await Organization.findOne({ order: [['createdAt', 'ASC']] }));

    if (!org) {
      return { received: true, ignored: 'No workspace configured' };
    }

    const obj = event.data?.object || {};
    const email = obj.billing_details?.email || obj.customer_email || obj.receipt_email || 'stripe-webhook@customer.com';

    switch (event.type) {
      case 'charge.succeeded':
      case 'charge.failed': {
        const exists = await Transaction.findOne({
          where: { organizationId: org.id, stripeChargeId: obj.id }
        });
        if (!exists) {
          await Transaction.create({
            organizationId: org.id,
            stripeChargeId: obj.id,
            eventType: event.type,
            amount: Number(((obj.amount || 0) / 100).toFixed(2)),
            currency: (obj.currency || 'usd').toLowerCase(),
            customerEmail: email,
            description: obj.description || event.type,
            occurredAt: new Date((obj.created || Date.now() / 1000) * 1000)
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        await Transaction.create({
          organizationId: org.id,
          stripeChargeId: obj.charge || obj.id,
          eventType: 'invoice.paid',
          amount: Number(((obj.amount_paid || 0) / 100).toFixed(2)),
          currency: (obj.currency || 'usd').toLowerCase(),
          customerEmail: email,
          description: obj.subscription ? 'Subscription Invoice Paid' : 'Invoice Paid',
          occurredAt: new Date((obj.created || Date.now() / 1000) * 1000)
        });
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await this.syncOrganization(org);
        break;
      }
      default:
        break;
    }

    MetricsCache.invalidate();
    return { received: true, eventType: event.type };
  }
}
