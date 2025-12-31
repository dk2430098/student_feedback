const dotenv = require('dotenv');
dotenv.config();

// Use env variable
const MONGO_URI = process.env.MONGO_URL;

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
                password: process.env.ADMIN_PASSWORD || 'adminpassword123',
                role: 'admin',
                assignedHostel: 'All',
                isVerified: true
            });
            console.log('Created NEW Admin.');
        } else {
            console.log(`Found Admin: ${user.email}`);
            // Force reset password to be sure
            user.password = process.env.ADMIN_PASSWORD || 'adminpassword123';
            await user.save();
            console.log('Admin password reset.');
        }

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
