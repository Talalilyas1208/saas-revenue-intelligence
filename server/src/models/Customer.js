import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plan: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mrrContribution: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('active', 'past_due', 'canceled'),
    defaultValue: 'active'
  },
  joinedDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { name: 'idx_customers_status', fields: ['status'] },
    { name: 'idx_customers_email', fields: ['email'] },
    { name: 'idx_customers_mrr', fields: ['mrrContribution'] },
    { name: 'idx_customers_org_id', fields: ['organizationId'] },
    { name: 'idx_customers_org_status', fields: ['organizationId', 'status'] }
  ]
});

export default Customer;
