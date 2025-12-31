// chatbot.js controller using Python ML script
const { spawn } = require('child_process');
const path = require('path');

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        // Path to python script
        const pythonScriptPath = path.join(__dirname, '..', 'ml', 'chatbot.py');

        // Spawn python process
        const pythonProcess = spawn('python3', [pythonScriptPath, message]);

        let scriptOutput = "";
        let errorOutput = "";

        pythonProcess.stdout.on('data', (data) => {
            scriptOutput += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            // Clear timeout if process finishes naturally
            clearTimeout(timeoutId);

            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                // TEMP: Return error to frontend for debugging
                return res.status(500).json({ success: false, message: `Internal AI Error: ${errorOutput || 'Unknown caused'}` });
            }

            try {
                // Parse JSON output from Python script
                const result = JSON.parse(scriptOutput);
                res.json({ success: true, reply: result.reply });
            } catch (e) {
                console.error('Failed to parse Python output:', scriptOutput);
                res.status(500).json({ success: false, message: 'AI Parsing Error' });
            }
        });

        // Set a timeout to kill the process if it takes too long (e.g., 5 seconds)
        // Set a timeout to kill the process if it takes too long (e.g., 30 seconds)
        // Increased from 5s to 30s because Render Free Tier is slow to load Python libraries
        const timeoutId = setTimeout(() => {
            pythonProcess.kill();
            console.error('Python script timed out');
            if (!res.headersSent) {
                res.status(504).json({ success: false, message: 'AI Response Timed Out (Cold Start)' });
            }
        }, 30000);

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { chat };
