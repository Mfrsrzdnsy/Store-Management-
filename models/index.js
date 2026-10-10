const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');
const User = require('./User')(sequelize);

// Define Relationships
Category.hasMany(Product);
Product.belongsTo(Category);

Transaction.hasMany(TransactionItem);
TransactionItem.belongsTo(Transaction);

Product.hasMany(TransactionItem);
TransactionItem.belongsTo(Product);

module.exports = {
    sequelize,
    Category,
    Product,
    Transaction,
    TransactionItem,
    User
};