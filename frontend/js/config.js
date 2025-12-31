const config = {
    // Default / Localhost URL.
    // In production, this file is overwritten by generate-config.js using Environment Variables.
    API_BASE_URL: "http://localhost:5000"
};

if (typeof module !== 'undefined') module.exports = config;
