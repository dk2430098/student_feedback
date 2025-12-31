const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'js', 'config.js');

// Default to localhost if env var not set
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
const formspreeUrl = process.env.FORMSPREE_URL || '';

const configContent = `const config = {
    // Generated from Environment Variable
    API_BASE_URL: "${apiBaseUrl}",
    FORMSPREE_URL: "${formspreeUrl}"
};

// Export for usage if using modules
if (typeof module !== 'undefined') module.exports = config;
`;

fs.writeFileSync(configPath, configContent);
console.log(`Generated config.js with API_BASE_URL: ${apiBaseUrl}`);
