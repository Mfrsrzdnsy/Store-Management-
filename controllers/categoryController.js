const { Category } = require('../models');

exports.list = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('categories/index', { title: 'Manajemen Kategori', categories });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.showAddForm = (req, res) => {
    res.render('categories/add', { title: 'Tambah Kategori' });
};

exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        await Category.create({ name, description });
        res.redirect('/categories');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.delete = async (req, res) => {
    try {
        await Category.destroy({ where: { id: req.params.id } });
        res.redirect('/categories');
    } catch (err) {
        res.status(500).send(err.message);
    }
};
