const express = require('express');
const router = express.Router();
const { Product, Transaction, Category } = require('../models');

router.get('/', async (req, res) => {
    try {
        const productCount = await Product.count();
        const categoryCount = await Category.count();
        const transactionCount = await Transaction.count();
        
        res.render('index', { 
            title: 'Dashboard',
            productCount,
            categoryCount,
            transactionCount
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;