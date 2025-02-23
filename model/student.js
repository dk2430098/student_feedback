const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    enrollmentNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mess: { type: [String], default: [] },
    hostel: { type: [String], default: [] },
    academic: { type: [String], default: [] }
});

// Export the model
const StudentDetails = mongoose.model("Student_details", studentSchema);
module.exports = StudentDetails;
