const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.list);
router.get('/add', categoryController.showAddForm);
router.post('/add', categoryController.create);
router.get('/delete/:id', categoryController.delete);

module.exports = router;
