const axios = require('axios');

exports.sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const formspreeUrl = process.env.FORMSPREE_URL;

        if (!formspreeUrl) {
            return res.status(500).json({ success: false, message: 'Server configuration error: Missing Formspree URL' });
        }

        // Forward to Formspree
        const response = await axios.post(formspreeUrl, {
            name,
            email,
            message
        }, {
            headers: { 'Accept': 'application/json' }
        });

        res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact Form Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};
