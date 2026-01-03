const express = require('express');
const router = express.Router();
const { syncUser, getMe, getUsersByRole, updateProfile } = require('../controllers/authController');
const { requireAuth, attachUser, authorize } = require('../middleware/clerkAuth');
const upload = require('../middleware/fileUpload');

const { createStaff, updateStaff, deleteStaff } = require('../controllers/adminController');

// New route for syncing Clerk user to MongoDB
router.post('/sync', requireAuth, syncUser);

// Profile Routes
router.get('/me', requireAuth, attachUser, getMe);
router.put('/profile', requireAuth, attachUser, upload.single('profileImage'), updateProfile);

// Admin Routes
router.get('/users/:role', requireAuth, attachUser, authorize('admin'), getUsersByRole);

// Admin Usage Only
router.route('/users')
    .post(requireAuth, attachUser, authorize('admin'), createStaff);

router.route('/users/:id')
    .put(requireAuth, attachUser, authorize('admin'), updateStaff)
    .delete(requireAuth, attachUser, authorize('admin'), deleteStaff);

module.exports = router;
