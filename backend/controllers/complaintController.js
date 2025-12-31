const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        // Handle Media Uploads
        let media = [];
        if (req.files) {
            media = req.files.map(file => ({
                url: file.path,
                public_id: file.filename,
                type: file.mimetype.startsWith('video') ? 'video' : 'image'
            }));
        }

        const complaint = await Complaint.create({
            student: req.user.id,
            title,
            description,
            category,
            media
        });

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all complaints (Filter by Role)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        let complaints = [];

        if (req.user.role === 'student') {
            complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
        }
        else if (req.user.role === 'warden') {
            // Warden: Only Hostel & Mess complaints from students in THEIR assigned block
            if (req.user.assignedHostel) {
                // Find all students in this hostel block
                const studentsInBlock = await User.find({ hostelBlock: req.user.assignedHostel }).distinct('_id');

                complaints = await Complaint.find({
                    student: { $in: studentsInBlock },
                    category: { $in: ['hostel', 'mess'] }
                }).populate('student', 'name email hostelBlock').populate('assignedTo', 'name').sort({ createdAt: -1 });
            } else {
                // Fallback for legacy (or if unassigned, show nothing or all? Show nothing to be safe)
                complaints = [];
            }
        }
        else if (req.user.role === 'supervisor') {
            // Supervisor: Filter by their assigned department if set, otherwise see all general
            let filter = {};
            if (req.user.assignedHostel && req.user.assignedHostel !== 'All') {
                filter.category = req.user.assignedHostel.toLowerCase(); // 'Academic' -> 'academic'
            } else {
                filter.category = { $in: ['academic', 'security', 'other', 'mess'] };
            }

            complaints = await Complaint.find(filter)
                .populate('student', 'name email hostelBlock')
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 });
        }
        else if (req.user.role === 'admin') {
            complaints = await Complaint.find({}).populate('student', 'name email hostelBlock').populate('assignedTo', 'name').sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Assign complaint to warden
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = async (req, res) => {
    try {
        const { wardenId } = req.body;

        const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
            assignedTo: wardenId,
            status: 'in-progress'
        }, { new: true }).populate('assignedTo', 'name');

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Resolve complaint (Warden)
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Warden)
exports.resolveComplaint = async (req, res) => {
    try {
        const { status, resolutionNotes } = req.body;

        // Handle Proof Uploads
        let resolutionProof = [];
        if (req.files) {
            resolutionProof = req.files.map(file => ({
                url: file.path,
                public_id: file.filename,
                type: file.mimetype.startsWith('video') ? 'video' : 'image'
            }));
        }

        const allowedStatuses = ['in-progress', 'resolved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status for resolution' });
        }

        const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
            status,
            resolutionNotes,
            $push: { resolutionProof: { $each: resolutionProof } }
        }, { new: true });

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Student)
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        // Ensure user is the owner
        if (complaint.student.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Only allow delete if pending
        if (complaint.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot delete processed complaint' });
        }

        await Complaint.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private (Student)
exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        if (complaint.student.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (complaint.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Cannot edit processed complaint' });
        }

        // Simplification: Not handling file re-upload for now in edit, just text fields
        // To properly handle file edit, would need more complex logic to delete old Cloudinary files etc.
        // Assuming just text update for this iteration as video re-upload is complex.
        const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: updatedComplaint });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
