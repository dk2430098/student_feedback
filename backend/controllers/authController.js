const User = require('../models/User');

// @desc    Sync Clerk User to MongoDB (Create or Update)
// @route   POST /api/auth/sync
// @access  Private (Clerk Auth)
// @desc    Sync Clerk User to MongoDB (Create or Update)
// @route   POST /api/auth/sync
// @access  Private (Clerk Auth)
exports.syncUser = async (req, res) => {
    try {
        // Data sent from frontend (Clerk JS SDK uses camelCase)
        const { id, emailAddresses, firstName, lastName, imageUrl } = req.body.user;

        if (!req.auth || !req.auth.userId) {
            throw new Error('Clerk Auth missing or invalid in request');
        }

        const clerkId = req.auth.userId;

        let email = null;
        if (emailAddresses && Array.isArray(emailAddresses) && emailAddresses.length > 0) {
            email = emailAddresses[0].emailAddress;
        } else if (req.body.user.primaryEmailAddressId && emailAddresses) {
            const primary = emailAddresses.find(e => e.id === req.body.user.primaryEmailAddressId);
            if (primary) email = primary.emailAddress;
        }

        // Fallback for snake_case if this endpoint is ever called by webhook
        if (!email && req.body.user.email_addresses) {
            const emails = req.body.user.email_addresses;
            if (emails.length > 0) email = emails[0].email_address;
        }

        if (!email) {
            console.error('Email missing in payload:', req.body.user);
            throw new Error('Email address is missing from Clerk user data');
        }

        const name = `${firstName || ''} ${lastName || ''}`.trim() || 'User';

        // Try to find user by Clerk ID
        let user = await User.findOne({ clerkId });

        if (!user) {
            // Check if user exists by email (Legacy user migration)
            user = await User.findOne({ email });

            if (user) {
                // Link Clerk ID to existing user
                user.clerkId = clerkId;
                if (!user.profileImage && imageUrl) user.profileImage = imageUrl;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    clerkId,
                    email,
                    name,
                    profileImage: imageUrl,
                    role: 'student', // Default role
                    isVerified: true
                });
            }
        } else {
            // User exists with Clerk ID, verify email consistency if needed
            if (user.email !== email) {
                user.email = email;
                await user.save();
            }
        }

        res.status(200).json({ success: true, user });

    } catch (err) {
        console.error('Sync Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is attached by the `attachUser` middleware
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found in local DB. Please sync first.' });
        }
        res.status(200).json({ success: true, data: req.user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get users by role
// @route   GET /api/auth/users/:role
// @access  Private (Admin)
exports.getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({ role: req.params.role }).select('name email role assignedHostel');
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            branch: req.body.branch,
            year: req.body.year,
            department: req.body.department,
            hostelBlock: req.body.hostelBlock,
            course: req.body.course,
            enrollmentNo: req.body.enrollmentNo
        };

        // Handle Profile Image Upload
        if (req.file) {
            fieldsToUpdate.profileImage = req.file.path;
        }

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

