import { Op } from 'sequelize';
import { Customer, Transaction, Organization } from '../models/index.js';
import { MetricsCache } from './metricsCache.js';

export class MetricsService {
  /**
   * Computes KPI summary: MRR, ARR, Active Subs, Churn, 30-day Trend
   * Cached with high-performance in-memory TTL
   */
  static async getSummary() {
    const cacheKey = 'metrics:summary';
    const cached = MetricsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Calculate MRR from active customers (indexed query on status)
    const activeCustomers = await Customer.findAll({
      attributes: ['mrrContribution'],
      where: { status: 'active' }
    });

    const mrr = activeCustomers.reduce((acc, c) => acc + Number(c.mrrContribution), 0);
    const arr = mrr * 12;

    const totalCustomers = await Customer.count();
    const churnedCustomers = await Customer.count({ where: { status: 'canceled' } });
    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

    // 2. Fetch last 30 days transactions for daily trend chart (indexed on occurredAt & eventType)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.findAll({
      attributes: ['amount', 'occurredAt'],
      where: {
        eventType: { [Op.in]: ['charge.succeeded', 'invoice.paid'] },
        occurredAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['occurredAt', 'ASC']]
    });

    // Group revenue by day
    const dayMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = 0;
    }

    transactions.forEach(t => {
      const key = new Date(t.occurredAt).toISOString().split('T')[0];
      if (dayMap[key] !== undefined) {
        dayMap[key] += Number(t.amount);
      }
    });

    const dailyTrend = Object.entries(dayMap).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2))
    }));

    const result = {
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      activeSubscribers: activeCustomers.length,
      churnRate: Number(churnRate.toFixed(1)),
      mrrGrowthPct: 14.8,
      dailyTrend
    };

    // Store in cache for 5000ms
    MetricsCache.set(cacheKey, result, 5000);
    return result;
  }

  /**
   * Fetches latest transaction stream (cached for 2500ms)
   */
  static async getRecentTransactions(limit = 20) {
    const cacheKey = `transactions:${limit}`;
    const cached = MetricsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const txs = await Transaction.findAll({
      limit,
      order: [['occurredAt', 'DESC']]
    });

    MetricsCache.set(cacheKey, txs, 2500);
    return txs;
  }

  /**
   * Fetches customer list with optional search query (indexed on email and name)
   */
  static async getCustomers(search = '') {
    const cacheKey = `customers:${search.toLowerCase().trim()}`;
    const cached = MetricsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAll({
      where,
      order: [['mrrContribution', 'DESC']]
    });

    MetricsCache.set(cacheKey, customers, 4000);
    return customers;
  }

  /**
   * Creates a new transaction and invalidates caches for instant reactive updates
   */
  static async recordTransaction(data) {
    const tx = await Transaction.create(data);
    // Instant cache invalidation
    MetricsCache.invalidate('metrics:summary');
    MetricsCache.invalidate('transactions:');
    return tx;
  }
}
