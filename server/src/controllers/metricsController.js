import { MetricsService } from '../services/metricsService.js';

export class MetricsController {
  static async getSummary(req, res) {
    const summary = await MetricsService.getSummary();
    res.json({ success: true, data: summary });
  }

  static async getTransactions(req, res) {
    const limit = parseInt(req.query.limit, 10) || 20;
    const transactions = await MetricsService.getRecentTransactions(limit);
    res.json({ success: true, data: transactions });
  }

  static async getCustomers(req, res) {
    const search = req.query.search || '';
    const customers = await MetricsService.getCustomers(search);
    res.json({ success: true, data: customers });
  }

  static async simulateTransaction(req, res) {
    const eventTypes = [
      { type: 'charge.succeeded', amount: 49.00, desc: 'Pro Plan Monthly' },
      { type: 'charge.succeeded', amount: 290.00, desc: 'Pro Plan Annual' },
      { type: 'subscription.created', amount: 99.00, desc: 'Team Tier Monthly' },
      { type: 'charge.failed', amount: 49.00, desc: 'Card Expired' }
    ];

    const pick = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomUser = `founder${Math.floor(Math.random() * 900 + 100)}@startup.sh`;

    const tx = await MetricsService.recordTransaction({
      eventType: pick.type,
      amount: pick.amount,
      customerEmail: randomUser,
      description: pick.desc,
      occurredAt: new Date()
    });

    res.status(201).json({ success: true, data: tx });
  }
}
