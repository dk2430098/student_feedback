const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, resolveComplaint, assignComplaint, deleteComplaint, updateComplaint } = require('../controllers/complaintController');
const { requireAuth, attachUser, authorize } = require('../middleware/clerkAuth');
const upload = require('../middleware/fileUpload');

router.use(requireAuth);
router.use(attachUser);

router.route('/')
    .get(getComplaints)
    .post(authorize('student'), upload.array('media', 3), createComplaint);

router.route('/:id')
    .put(authorize('student'), updateComplaint)
    .delete(authorize('student'), deleteComplaint);

router.route('/:id/assign')
    .put(authorize('admin'), assignComplaint);

router.route('/:id/resolve')
    .put(authorize('warden', 'supervisor'), upload.array('resolutionProof', 3), resolveComplaint);

module.exports = router;
