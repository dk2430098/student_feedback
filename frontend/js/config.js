const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const config = {
    // Dynamic API URL: Localhost for dev, Render for production
    API_BASE_URL: isLocal ? "http://localhost:5000" : "https://student-feedback-backend-ph0e.onrender.com",
    FORMSPREE_URL: "",
    CLERK_PUBLISHABLE_KEY: "pk_test_Z29yZ2VvdXMtbW9ua2Zpc2gtMzQuY2xlcmsuYWNjb3VudHMuZGV2JA"
};

// Export for usage if using modules
if (typeof module !== 'undefined') module.exports = config;
