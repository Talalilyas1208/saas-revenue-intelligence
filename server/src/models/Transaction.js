import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  stripeChargeId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventType: {
    type: DataTypes.ENUM(
      'charge.succeeded',
      'charge.failed',
      'subscription.created',
      'subscription.canceled',
      'invoice.paid'
    ),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'usd'
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  occurredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { name: 'idx_transactions_occurred_at', fields: ['occurredAt'] },
    { name: 'idx_transactions_event_type', fields: ['eventType'] },
    { name: 'idx_transactions_org_id', fields: ['organizationId'] },
    { name: 'idx_transactions_org_occurred', fields: ['organizationId', 'occurredAt'] },
    { name: 'idx_transactions_customer_email', fields: ['customerEmail'] }
  ]
});

export default Transaction;
