const { User } = require('../models');

exports.showLoginForm = (req, res) => {
    res.render('auth/login', { 
        layout: false, 
        error: req.query.error === '1' ? 'Username atau password salah!' : null 
    });
};

exports.showRegisterForm = (req, res) => {
    res.render('auth/register', { 
        layout: false, 
        error: req.query.error === 'exists' ? 'Username sudah digunakan!' : (req.query.error === '1' ? 'Terjadi kesalahan sistem!' : null)
    });
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Cek apakah username sudah ada
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.redirect('/register?error=exists');
        }

        // Buat user baru
        await User.create({
            username,
            password,
            role: 'admin'
        });

        // Langsung login setelah daftar
        const user = await User.findOne({ where: { username } });
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        
        res.redirect('/');
    } catch (error) {
        console.error('Register error:', error);
        res.redirect('/register?error=1');
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            return res.redirect('/login?error=1');
        }

        // Validate password
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.redirect('/login?error=1');
        }

        // Setup session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login?error=1');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout error:', err);
        res.redirect('/login');
    });
};
