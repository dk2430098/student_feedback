const mongoose = require('mongoose');
const User = require('./models/User');

// Correct URI from previous debugging
const MONGO_URI = 'mongodb+srv://dk2430098_db_user:IkOarK5abF9U6JMD@cluster0.v1zbvi2.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const email = 'admin@nitmn.ac.in';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('Admin NOT FOUND. Creating...');
            user = await User.create({
                name: 'System Administrator',
                email: email,
                password: 'adminpassword123',
                role: 'admin',
                assignedHostel: 'All',
                isVerified: true
            });
            console.log('Created NEW Admin.');
        } else {
            console.log(`Found Admin: ${user.email}`);
            // Force reset password to be sure
            user.password = 'adminpassword123';
            await user.save();
            console.log('Admin password reset to: adminpassword123');
        }

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
