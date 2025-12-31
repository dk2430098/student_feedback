const express = require('express');
const router = express.Router();
const { signup, verifyOtp, login, getMe, getUsersByRole, updateProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

const { createStaff, updateStaff, deleteStaff } = require('../controllers/adminController');

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.get('/users/:role', protect, authorize('admin'), getUsersByRole);

// Admin Usage Only
router.route('/users')
    .post(protect, authorize('admin'), createStaff);

router.route('/users/:id')
    .put(protect, authorize('admin'), updateStaff)
    .delete(protect, authorize('admin'), deleteStaff);

module.exports = router;
