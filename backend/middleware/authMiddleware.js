const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        // If user not found (deleted?), clear cookie and redirect
        if (!req.user) {
            res.clearCookie('token');
            if (req.accepts('html')) {
                return res.redirect('/login');
            }
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        next();
    } catch (err) {
        res.clearCookie('token');
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
