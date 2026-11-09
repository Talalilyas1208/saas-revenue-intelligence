import { User, Organization, Customer, Transaction } from '../models/index.js';

export async function seedDatabase() {
  const customerCount = await Customer.count();
  if (customerCount > 0) {
    return; // Already seeded
  }

  console.log('[Seed] Database is empty. Seeding realistic metrics, customers, and transactions...');

  // 1. Create default user & organization
  const user = await User.create({
    name: 'Alex Founder',
    email: 'founder@revterm.io',
    passwordHash: '$2a$10$demoHashedPasswordPlaceholder',
    role: 'admin'
  });

  const org = await Organization.create({
    name: 'SaaSify Inc',
    userId: user.id,
    currency: 'usd',
    planTier: 'pro'
  });

  // 2. Create customers
  const customersData = [
    { name: 'Acme Corp', email: 'billing@acme.com', plan: 'Enterprise ($299/mo)', mrrContribution: 299.00, status: 'active', joinedDate: '2026-01-15' },
    { name: 'HyperScale Labs', email: 'finance@hyperscale.io', plan: 'Team Tier ($99/mo)', mrrContribution: 99.00, status: 'active', joinedDate: '2026-02-10' },
    { name: 'Veloce Design', email: 'ops@veloce.design', plan: 'Pro Monthly ($49/mo)', mrrContribution: 49.00, status: 'active', joinedDate: '2026-03-01' },
    { name: 'DevForge AI', email: 'founders@devforge.ai', plan: 'Team Tier ($99/mo)', mrrContribution: 99.00, status: 'active', joinedDate: '2026-04-12' },
    { name: 'Alex Mercer', email: 'alex@mercer.dev', plan: 'Pro Annual ($290/yr)', mrrContribution: 24.16, status: 'active', joinedDate: '2026-05-01' },
    { name: 'CloudPeak Studio', email: 'team@cloudpeak.cc', plan: 'Pro Monthly ($49/mo)', mrrContribution: 49.00, status: 'past_due', joinedDate: '2026-06-20' },
    { name: 'LegacyApp Co', email: 'admin@legacyapp.org', plan: 'Starter ($19/mo)', mrrContribution: 19.00, status: 'canceled', joinedDate: '2026-07-04' }
  ];

  for (const c of customersData) {
    await Customer.create({ ...c, organizationId: org.id });
  }

  // 3. Create 30 days of transactions
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const txDate = new Date();
    txDate.setDate(now.getDate() - i);
    txDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    // Daily transactions
    const count = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const amounts = [19.00, 49.00, 99.00, 290.00];
      const amt = amounts[Math.floor(Math.random() * amounts.length)];
      await Transaction.create({
        organizationId: org.id,
        eventType: 'charge.succeeded',
        amount: amt,
        currency: 'usd',
        customerEmail: `user_${i}_${j}@company.com`,
        description: `Subscription charge for ${amt === 290 ? 'Pro Annual' : 'Monthly Tier'}`,
        occurredAt: txDate
      });
    }
  }

  console.log('[Seed] Seeding completed successfully!');
}
