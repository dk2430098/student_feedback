const config = {
    // Change this to your Render Backend URL after deployment
    // e.g., "https://student-feedback-backend.onrender.com"
    API_BASE_URL: "http://localhost:5000"
};

// Export for usage if using modules, but for vanilla we just load this first in HTML
if (typeof module !== 'undefined') module.exports = config;
