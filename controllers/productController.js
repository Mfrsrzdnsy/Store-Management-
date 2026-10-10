const { Product, Category } = require('../models');

exports.list = async (req, res) => {
    try {
        const products = await Product.findAll({ include: Category });
        res.render('products/index', { title: 'Manajemen Produk', products });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.showAddForm = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('products/add', { title: 'Tambah Produk', categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, sku, price, stock, CategoryId, description } = req.body;
        await Product.create({
            name, sku, price, stock, CategoryId: CategoryId || null, description
        });
        res.redirect('/products');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await Product.destroy({ where: { id: req.params.id } });
        res.redirect('/products');
    } catch (err) {
        res.status(500).send(err.message);
    }
};