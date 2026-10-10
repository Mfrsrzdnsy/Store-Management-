const express = require('express');
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

const session = require('express-session');
const { ensureAuthenticated, forwardAuthenticated } = require('./middleware/auth');
const authController = require('./controllers/authController');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'store-management-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Pass user data to all views
app.use((req, res, next) => {
    res.locals.user = req.session.username || null;
    next();
});

// Auth Routes
app.get('/login', forwardAuthenticated, authController.showLoginForm);
app.post('/login', authController.login);
app.get('/register', forwardAuthenticated, authController.showRegisterForm);
app.post('/register', authController.register);
app.get('/logout', authController.logout);

// Protected Routes
app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('auth/profile', { title: 'Profil Saya' });
});
app.use('/', ensureAuthenticated, require('./routes/index'));
app.use('/products', ensureAuthenticated, require('./routes/products'));
app.use('/categories', ensureAuthenticated, require('./routes/categories'));
app.use('/transactions', ensureAuthenticated, require('./routes/transactions'));

// Sync Database and Start Server
db.sequelize.sync().then(async () => {
    console.log('Database synced successfully');
    
    // Seed admin user if not exists
    const adminExists = await db.User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
        await db.User.create({
            username: 'admin',
            password: 'password123', // Default password
            role: 'admin'
        });
        console.log('Default admin user created. Username: admin, Password: password123');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});