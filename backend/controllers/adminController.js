const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new staff (Warden/Supervisor)
// @route   POST /api/auth/users
// @access  Admin
exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, role, assignedHostel } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        user = await User.create({
            name,
            email,
            password,
            role,
            assignedHostel: role === 'warden' ? assignedHostel : undefined,
            isVerified: true
        });

        // SEND EMAIL
        try {
            await sendEmail({
                email: user.email,
                subject: 'NITMN Feedback Portal - Staff Account Created',
                message: `Hello ${user.name},\n\nYour staff account has been created.\n\nRole: ${role}\nUsername: ${email}\nPassword: ${password}\n\nPlease login and change your password immediately.`
            });
            console.log(`Email sent to ${email}`);
        } catch (emailErr) {
            console.error('Email send failed:', emailErr);
            // Don't fail the whole request, just log it
        }

        res.status(201).json({
            success: true,
            data: user,
            message: `User created! Password sent to ${email}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update staff details
// @route   PUT /api/auth/users/:id
// @access  Admin
exports.updateStaff = async (req, res) => {
    try {
        const { name, email, password, role, assignedHostel } = req.body;

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update basic fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        // Update Role & Jurisdiction
        if (role) {
            user.role = role;
            // If changing role, we must handle assignedHostel carefully
            if (assignedHostel) {
                user.assignedHostel = assignedHostel;
            } else if (role !== 'warden' && role !== 'supervisor') {
                // If switching to student/admin, clear it
                user.assignedHostel = undefined;
            }
        } else if (assignedHostel) {
            // Role assignment didn't change, but jurisdiction did
            user.assignedHostel = assignedHostel;
        }

        await user.save();

        if (password) {
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'NITMN Feedback Portal - Password Updated',
                    message: `Hello ${user.name},\n\nYour staff account password has been updated by the Admin.\n\nNew Password: ${password}\n\nPlease login with your new credentials.`
                });
                console.log(`Password reset email sent to ${user.email}`);
            } catch (emailErr) {
                console.error('Email send failed:', emailErr);
            }
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete staff
// @route   DELETE /api/auth/users/:id
// @access  Admin
exports.deleteStaff = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete Admin account' });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
