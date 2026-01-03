const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Middleware to verify Clerk token strictly (returns 401 if invalid)
const requireAuth = ClerkExpressRequireAuth({
    // Add any specific options here if needed
});

// Middleware to attach the local MongoDB user to req.user
const attachUser = async (req, res, next) => {
    try {
        // req.auth is populated by ClerkExpressRequireAuth
        if (!req.auth || !req.auth.userId) {
            return next(); // or return error if strict
        }

        const user = await User.findOne({ clerkId: req.auth.userId });
        if (user) {
            req.user = user;
        }
        next();
    } catch (err) {
        console.error('Error in attachUser middleware:', err);
        next(err);
    }
};

const authorize = (...roles) => {
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

module.exports = { requireAuth, attachUser, authorize };
