const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['student', 'warden', 'admin', 'supervisor'],
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Specific fields
    assignedHostel: {
        type: String, // e.g., 'H1', 'Academic', 'Mess'
        default: null
    },
    hostelBlock: {
        type: String
    },
    branch: {
        type: String,
        default: ''
    },
    year: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    course: {
        type: String,
        default: ''
    },
    enrollmentNo: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: '' // URL
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
