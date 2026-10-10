module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.session && req.session.userId) {
            return next();
        }
        res.redirect('/login');
    },
    forwardAuthenticated: (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return next();
        }
        res.redirect('/');
    }
};
