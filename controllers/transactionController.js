const { Transaction, TransactionItem, Product, Category, sequelize } = require('../models');

// Halaman Riwayat Transaksi
exports.index = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.render('transactions/index', { title: 'Riwayat Transaksi', transactions });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Halaman Point of Sale (Kasir)
exports.pos = async (req, res) => {
    try {
        // Ambil semua produk yang stoknya lebih dari 0
        const products = await Product.findAll({
            where: {
                stock: {
                    [require('sequelize').Op.gt]: 0
                }
            },
            include: Category
        });
        res.render('transactions/pos', { title: 'Point of Sale', products });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Detail Transaksi
exports.detail = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, {
            include: [{
                model: TransactionItem,
                include: [Product]
            }]
        });
        if (!transaction) return res.status(404).send('Transaksi tidak ditemukan');
        res.render('transactions/detail', { title: 'Detail Transaksi', transaction });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Proses Checkout (API)
exports.checkout = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, paymentMethod, notes } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Keranjang belanja kosong!' });
        }

        let totalAmount = 0;
        
        // 1. Validasi Stok & Hitung Total
        for (let item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
            if (product.stock < item.quantity) {
                throw new Error(`Stok produk ${product.name} tidak mencukupi. Tersisa: ${product.stock}`);
            }
            totalAmount += parseFloat(product.price) * item.quantity;
        }

        // 2. Buat Transaksi Utama
        const transaction = await Transaction.create({
            totalAmount,
            paymentMethod: paymentMethod || 'Cash',
            notes
        }, { transaction: t });

        // 3. Masukkan TransactionItems & Kurangi Stok
        for (let item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            const subtotal = parseFloat(product.price) * item.quantity;

            await TransactionItem.create({
                TransactionId: transaction.id,
                ProductId: product.id,
                quantity: item.quantity,
                priceAtTime: product.price,
                subtotal: subtotal
            }, { transaction: t });

            // Kurangi stok
            await product.decrement('stock', { by: item.quantity, transaction: t });
        }

        // 4. Commit transaksi DB
        await t.commit();

        res.json({ success: true, message: 'Transaksi berhasil disimpan!', transactionId: transaction.id });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
};
