const User = require('../models/User');
const Otp = require('../models/Otp');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a user (Student)
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // If user exists AND is verified, block them
            if (user.isVerified) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            // If user exists but NOT verified (legacy/stale), remove them so we can start fresh
            await User.deleteOne({ _id: user._id });
        }

        // Generate Random 6-digit OTP
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        // Store user DETAILS in Otp collection temporarily (expires in 10m)
        // We do NOT create the User record yet.
        await Otp.create({
            email,
            otp,
            tempUser: {
                name,
                email,
                password, // Will be hashed when User is finally created
                role: 'student',
                isVerified: true // Will be verified upon creation
            }
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent to email. User not created yet.',
            email
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify OTP and Activate Account
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find most recent OTP for email
        const response = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);

        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
        }

        const otpRecord = response[0];

        // Check if user already exists (double check)
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already registered' });
        }

        // CREATE User now using stored temp data
        user = await User.create(otpRecord.tempUser);

        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        sendTokenResponse(user, 201, res);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login User
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email first' });
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
exports.logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

// @desc    Get Current User
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
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

// Helper to generate JWT and send cookie/response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            assignedHostel: user.assignedHostel,
            profileImage: user.profileImage
        }
    });
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
