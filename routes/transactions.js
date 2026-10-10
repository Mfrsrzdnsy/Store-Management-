const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.index); // History
router.get('/pos', transactionController.pos); // Point of Sale Interface
router.post('/checkout', transactionController.checkout); // API to handle checkout
router.get('/:id', transactionController.detail); // Detail receipt

module.exports = router;
