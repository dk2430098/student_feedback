const dotenv = require('dotenv');
dotenv.config();

// Use env variable
const MONGO_URI = process.env.MONGO_URL;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const email = 'supervisor@nitmn.ac.in';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('Supervisor NOT FOUND. Creating...');
            user = await User.create({
                name: 'Student Supervisor',
                email: email,
                password: 'supervisor123',
                role: 'supervisor',
                assignedHostel: 'All',
                isVerified: true
            });
            console.log('Created NEW Supervisor.');
        } else {
            console.log(`Found Supervisor: ${user.email}`);
            // Manually set password again to trigger hash
            user.password = 'supervisor123';
            await user.save();
            console.log('Password reset successfully to: supervisor123');
        }

        console.log('User Role:', user.role);
        console.log('Is Verified:', user.isVerified);

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
