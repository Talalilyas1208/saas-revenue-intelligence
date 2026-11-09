import sequelize from '../config/database.js';
import User from './User.js';
import Organization from './Organization.js';
import Transaction from './Transaction.js';
import Customer from './Customer.js';

// Associations
User.hasMany(Organization, { foreignKey: 'userId', as: 'organizations' });
Organization.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Organization.hasMany(Transaction, { foreignKey: 'organizationId', as: 'transactions' });
Transaction.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Customer, { foreignKey: 'organizationId', as: 'customers' });
Customer.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

export {
  sequelize,
  User,
  Organization,
  Transaction,
  Customer
};
