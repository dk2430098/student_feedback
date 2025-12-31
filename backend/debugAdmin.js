const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const Complaint = require('./models/Complaint');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URL;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // 1. Count Complaints
        const total = await Complaint.countDocuments();
        console.log(`Total Complaints in DB: ${total}`);

        const complaints = await Complaint.find({});
        console.log('Sample Complaints:', complaints.map(c => ({ id: c._id, status: c.status, category: c.category })));

        // 2. Check Admin User
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log(`Admin Found: ${admin.email}, Role: ${admin.role}`);
        } else {
            console.log('Admin User NOT Found!');
        }

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
