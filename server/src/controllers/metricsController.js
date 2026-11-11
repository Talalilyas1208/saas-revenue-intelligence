import { MetricsService } from '../services/metricsService.js';

export class MetricsController {
  static async getContext(req, res) {
    const context = await MetricsService.getWorkspaceContext(req.user.id);
    res.json({ success: true, data: context });
  }

  static async updateProfile(req, res) {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Display name is required' });
    }
    const user = await MetricsService.updateProfile(req.user.id, { name });
    res.json({ success: true, data: user });
  }

  static async createOrganization(req, res) {
    const { name, planTier } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Workspace name is required' });
    }
    const org = await MetricsService.createOrganization(req.user.id, { name, planTier });
    res.status(201).json({ success: true, data: org });
  }

  static async updateOrganizationKey(req, res) {
    const { id } = req.params;
    const { stripeApiKey } = req.body;
    if (!stripeApiKey || !stripeApiKey.trim()) {
      return res.status(400).json({ success: false, error: 'Stripe API key is required' });
    }
    const result = await MetricsService.updateOrganizationKey(req.user.id, id, stripeApiKey);
    res.json({ success: true, data: result });
  }

  static async syncStripe(req, res) {
    const { id } = req.params;
    const result = await MetricsService.syncStripe(req.user.id, id);
    res.json({ success: true, data: result });
  }

  static async getSummary(req, res) {
    res.setHeader('Cache-Control', 'private, max-age=3, stale-while-revalidate=10');
    const { organizationId, days } = req.query;
    const summary = await MetricsService.getSummary(req.user.id, organizationId, days);
    res.json({ success: true, data: summary });
  }

  static async getTransactions(req, res) {
    res.setHeader('Cache-Control', 'private, max-age=2, stale-while-revalidate=5');
    const limit = parseInt(req.query.limit, 10) || 25;
    const { organizationId } = req.query;
    const transactions = await MetricsService.getRecentTransactions(req.user.id, organizationId, limit);
    res.json({ success: true, data: transactions });
  }

  static async recordTransaction(req, res) {
    const { organizationId, customerEmail, amount, eventType, description } = req.body;
    const tx = await MetricsService.recordTransaction(req.user.id, organizationId, {
      customerEmail,
      amount,
      eventType,
      description
    });
    res.status(201).json({ success: true, data: tx });
  }

  static async getCustomers(req, res) {
    res.setHeader('Cache-Control', 'private, max-age=4, stale-while-revalidate=10');
    const { organizationId, search = '' } = req.query;
    const customers = await MetricsService.getCustomers(req.user.id, organizationId, search);
    res.json({ success: true, data: customers });
  }

  static async createCustomer(req, res) {
    const { organizationId, name, email, plan, mrrContribution } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }
    const customer = await MetricsService.createCustomer(req.user.id, organizationId, {
      name,
      email,
      plan,
      mrrContribution
    });
    res.status(201).json({ success: true, data: customer });
  }

  static async updateCustomerStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const customer = await MetricsService.updateCustomerStatus(req.user.id, id, status);
    res.json({ success: true, data: customer });
  }

  static async verifyLicense(req, res) {
    const { organizationId, licenseKey } = req.body;
    const result = await MetricsService.verifyAndActivateLicense(req.user.id, organizationId, licenseKey);
    res.json({ success: true, data: result });
  }
}
