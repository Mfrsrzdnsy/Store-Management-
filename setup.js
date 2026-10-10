const fs = require('fs');

const files = {
    'index.js': `const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./models');

const app = express();

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/products', require('./routes/products'));

// Sync Database and Start Server
db.sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced successfully');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(\`Server is running at http://localhost:\${PORT}\`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});`,

    'config/database.js': `const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'store.sqlite'),
    logging: false
});

module.exports = sequelize;`,

    'models/index.js': `const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');

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
    TransactionItem
};`,

    'models/Category.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
});

module.exports = Category;`,

    'models/Product.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        unique: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT
    }
});

module.exports = Product;`,

    'models/Transaction.js': `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'cash'
    },
    notes: {
        type: DataTypes.TEXT
    }
});

module.exports = Transaction;`,

    'models/TransactionItem.js': `const { DataTypes } = require('sequelize');
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

module.exports = TransactionItem;`,

    'routes/index.js': `const express = require('express');
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

module.exports = router;`,

    'routes/products.js': `const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.list);
router.get('/add', productController.showAddForm);
router.post('/add', productController.create);
router.get('/delete/:id', productController.delete);

module.exports = router;`,

    'controllers/productController.js': `const { Product, Category } = require('../models');

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
};`,

    'views/layout.ejs': `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %> - Store Management</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        .sidebar {
            min-height: 100vh;
            background-color: #343a40;
        }
        .sidebar a {
            color: #fff;
            text-decoration: none;
            padding: 10px 15px;
            display: block;
        }
        .sidebar a:hover {
            background-color: #495057;
        }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-2 sidebar p-0">
                <div class="p-3 text-white text-center border-bottom border-secondary">
                    <h4>Store App</h4>
                </div>
                <div class="mt-3">
                    <a href="/"><i class="bi bi-speedometer2 me-2"></i> Dashboard</a>
                    <a href="/categories"><i class="bi bi-tags me-2"></i> Kategori</a>
                    <a href="/products"><i class="bi bi-box-seam me-2"></i> Produk</a>
                    <a href="/transactions"><i class="bi bi-cart-check me-2"></i> Transaksi</a>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="col-md-10 bg-light p-0" style="min-height: 100vh;">
                <nav class="navbar navbar-light bg-white border-bottom px-4 shadow-sm">
                    <span class="navbar-brand mb-0 h1"><%= title %></span>
                </nav>
                <div class="p-4">
                    <%- body %>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`,

    'views/index.ejs': `<div class="row">
    <div class="col-md-4 mb-4">
        <div class="card text-white bg-primary shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Total Produk</h5>
                <h2 class="mb-0"><%= productCount %></h2>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-white stretched-link" href="/products">Lihat Detail</a>
                <div class="small text-white"><i class="bi bi-arrow-right"></i></div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-4">
        <div class="card text-white bg-success shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title">Total Kategori</h5>
                <h2 class="mb-0"><%= categoryCount %></h2>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-white stretched-link" href="/categories">Lihat Detail</a>
                <div class="small text-white"><i class="bi bi-arrow-right"></i></div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-4">
        <div class="card text-white bg-warning shadow-sm h-100">
            <div class="card-body">
                <h5 class="card-title text-dark">Total Transaksi</h5>
                <h2 class="mb-0 text-dark"><%= transactionCount %></h2>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-dark stretched-link" href="/transactions">Lihat Detail</a>
                <div class="small text-dark"><i class="bi bi-arrow-right"></i></div>
            </div>
        </div>
    </div>
</div>`,

    'views/products/index.ejs': `<div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 class="mb-0">Daftar Produk</h5>
        <a href="/products/add" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Tambah Produk</a>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>SKU</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <% if (products && products.length > 0) { %>
                        <% products.forEach(product => { %>
                            <tr>
                                <td><%= product.sku || '-' %></td>
                                <td><%= product.name %></td>
                                <td><%= product.Category ? product.Category.name : '-' %></td>
                                <td>Rp <%= parseFloat(product.price).toLocaleString('id-ID') %></td>
                                <td>
                                    <% if (product.stock <= 5) { %>
                                        <span class="badge bg-danger"><%= product.stock %></span>
                                    <% } else { %>
                                        <span class="badge bg-success"><%= product.stock %></span>
                                    <% } %>
                                </td>
                                <td>
                                    <a href="#" class="btn btn-sm btn-info text-white"><i class="bi bi-pencil"></i></a>
                                    <a href="/products/delete/<%= product.id %>" class="btn btn-sm btn-danger" onclick="return confirm('Yakin ingin menghapus produk ini?');"><i class="bi bi-trash"></i></a>
                                </td>
                            </tr>
                        <% }) %>
                    <% } else { %>
                        <tr>
                            <td colspan="6" class="text-center py-4">Belum ada data produk.</td>
                        </tr>
                    <% } %>
                </tbody>
            </table>
        </div>
    </div>
</div>`,

    'views/products/add.ejs': `<div class="card shadow-sm mx-auto" style="max-width: 600px;">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Tambah Produk Baru</h5>
    </div>
    <div class="card-body">
        <form action="/products/add" method="POST">
            <div class="mb-3">
                <label for="name" class="form-label">Nama Produk <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="name" name="name" required>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="sku" class="form-label">SKU / Kode Barang</label>
                    <input type="text" class="form-control" id="sku" name="sku">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="CategoryId" class="form-label">Kategori</label>
                    <select class="form-select" id="CategoryId" name="CategoryId">
                        <option value="">-- Pilih Kategori --</option>
                        <% categories.forEach(category => { %>
                            <option value="<%= category.id %>"><%= category.name %></option>
                        <% }) %>
                    </select>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="price" class="form-label">Harga <span class="text-danger">*</span></label>
                    <div class="input-group">
                        <span class="input-group-text">Rp</span>
                        <input type="number" class="form-control" id="price" name="price" required min="0">
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="stock" class="form-label">Stok Awal <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="stock" name="stock" required min="0" value="0">
                </div>
            </div>
            
            <div class="mb-4">
                <label for="description" class="form-label">Deskripsi</label>
                <textarea class="form-control" id="description" name="description" rows="3"></textarea>
            </div>
            
            <div class="d-flex justify-content-end gap-2">
                <a href="/products" class="btn btn-secondary">Batal</a>
                <button type="submit" class="btn btn-primary"><i class="bi bi-save me-1"></i> Simpan Produk</button>
            </div>
        </form>
    </div>
</div>`
};

for (const [filepath, content] of Object.entries(files)) {
    fs.writeFileSync(filepath, content);
}

console.log('Base files created successfully.');
