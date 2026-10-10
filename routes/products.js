const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.list);
router.get('/add', productController.showAddForm);
router.post('/add', productController.create);
router.get('/delete/:id', productController.delete);

module.exports = router;