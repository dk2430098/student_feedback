const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['mess', 'hostel', 'academic', 'security', 'other'],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Warden or Admin
    },
    media: [{
        url: String,
        public_id: String,
        type: { type: String, enum: ['image', 'video'] }
    }],
    resolutionProof: [{
        url: String,
        public_id: String,
        type: { type: String, enum: ['image', 'video'] }
    }],
    resolutionNotes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
