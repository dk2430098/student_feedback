// Detect environment
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Explicitly assign to window to ensure global availability
window.config = {
    API_BASE_URL: isLocal ? "http://localhost:5000" : "https://student-feedback-backend-ph0e.onrender.com",
    FORMSPREE_URL: "",
    CLERK_PUBLISHABLE_KEY: "pk_test_Z29yZ2VvdXMtbW9ua2Zpc2gtMzQuY2xlcmsuYWNjb3VudHMuZGV2JA"
};

console.log('✅ Configuration Loaded:', window.config);
console.log('🌍 Environment:', isLocal ? 'Localhost' : 'Production');

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined') module.exports = window.config;
