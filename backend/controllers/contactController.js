const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    try {
        // Create Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email to Admin
        const mailOptions = {
            from: process.env.EMAIL_USER, // Check: Gmail requires 'from' to match authenticated user
            replyTo: email, // Allow replying to the user
            to: process.env.EMAIL_USER, // Send to self (Admin)
            subject: `New Contact Form Message from ${name}`,
            html: `
                <h3>New Message from NITMN Feedback Portal</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="background-color: #f4f4f4; padding: 10px; border-left: 4px solid #3b82f6;">${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact Form Error:', error);
        // TEMP: Return detailed error for debugging
        res.status(500).json({ success: false, message: `Failed to send message: ${error.message}` });
    }
};
