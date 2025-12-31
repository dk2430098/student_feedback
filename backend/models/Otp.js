const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    tempUser: {
        type: Object, // Stores name, password, role temporarily
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // The document will be automatically deleted after 10 minutes (600 seconds)
    }
});

// Function to send emails
async function sendVerificationEmail(email, otp) {
    try {
        console.log(`DEV_OTP: ${otp} for ${email}`); // For Development Testing
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailResponse = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Code - Student Feedback System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verification Code</h2>
                    <p>Please use the following OTP to verify your account:</p>
                    <h1 style="color: #4F46E5;">${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                </div>
            `,
        });
        console.log("Email sent successfully: ", mailResponse.messageId);
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}

// Pre-save hook to send email after OTP creation
otpSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            await sendVerificationEmail(this.email, this.otp);
        } catch (err) {
            console.log("Email send failed (ignoring for dev):", err.message);
        }
    }
    next();
});

module.exports = mongoose.model('Otp', otpSchema);
