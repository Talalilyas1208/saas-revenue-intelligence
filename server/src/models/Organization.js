import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stripeAccountId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'usd'
  },
  planTier: {
    type: DataTypes.ENUM('free', 'pro', 'enterprise'),
    defaultValue: 'pro'
  }
}, {
  timestamps: true,
  indexes: [
    { name: 'idx_organizations_user_id', fields: ['userId'] }
  ]
});

export default Organization;
