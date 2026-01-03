const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const usersToSeed = [
    {
        email: 'kumardeepak94262@gmail.com',
        name: 'Warden H1',
        role: 'warden',
        assignedHostel: 'H1',
        clerkId: 'pending_seed_warden_h1_' + Date.now(), // Placeholder
        isVerified: true
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB Connected for Seeding');

        for (const u of usersToSeed) {
            // Check if user exists by email
            let user = await User.findOne({ email: u.email });
            if (user) {
                user.role = u.role;
                user.assignedHostel = u.assignedHostel;
                if (!user.clerkId) user.clerkId = u.clerkId;
                await user.save();
                console.log(`Updated existing user ${u.email} to role ${u.role} for ${u.assignedHostel}`);
            } else {
                await User.create(u);
                console.log(`Created new user ${u.email} with role ${u.role} for ${u.assignedHostel}`);
            }
        }

        console.log('Seeding Complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
