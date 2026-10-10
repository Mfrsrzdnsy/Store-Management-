const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionItem = sequelize.define('TransactionItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    priceAtTime: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = TransactionItem;