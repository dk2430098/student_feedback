const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

// Use env variable
const MONGO_URI = process.env.MONGO_URL;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // 1. Create Wardens for each block
        const blocks = ['H1', 'H2', 'H3', 'H4', 'H5'];

        for (const block of blocks) {
            const email = `warden.${block.toLowerCase()}@nitmn.ac.in`;
            const exists = await User.findOne({ email });

            if (!exists) {
                await User.create({
                    name: `Warden ${block}`,
                    email: email,
                    password: 'wardenpassword123',
                    role: 'warden',
                    assignedHostel: block,
                    isVerified: true
                });
                console.log(`Created Warden for ${block}: ${email}`);
            } else {
                console.log(`Warden ${block} already exists.`);
            }
        }

        // 2. Create Supervisor
        const supEmail = 'supervisor@nitmn.ac.in';
        const supExists = await User.findOne({ email: supEmail });

        if (!supExists) {
            await User.create({
                name: 'Student Supervisor',
                email: supEmail,
                password: 'supervisor123',
                role: 'supervisor',
                assignedHostel: 'All',
                isVerified: true
            });
            console.log(`Created Supervisor: ${supEmail}`);
        } else {
            console.log('Supervisor already exists.');
        }

        console.log('--- Account Setup Complete ---');
        console.log('Warden Passwords: wardenpassword123');
        console.log('Supervisor Password: supervisor123');

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
