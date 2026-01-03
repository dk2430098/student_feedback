// Clerk Authentication Logic
const clerkPubKey = config.CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    console.error('Clerk Publishable Key is missing in config.js');
    alert('Clerk Key Missing! Check Console.');
}

const script = document.createElement('script');
script.setAttribute('data-clerk-publishable-key', clerkPubKey);
script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
script.crossOrigin = 'anonymous';
script.async = true;

// Define globals immediately to handle clicks before load
window.clerkReady = false;

window.openSignIn = (options = {}) => {
    if (window.clerkReady && window.clerk) {
        const signInProps = {};

        if (options.email) {
            signInProps.initialValues = {
                emailAddress: options.email
            };
        }

        window.clerk.openSignIn(signInProps);
    } else {
        alert('Authentication is still loading. Please wait a moment...');
    }
};

window.openSignUp = (options = {}) => {
    if (window.clerkReady && window.clerk) {
        // Map custom form fields to Clerk's expected format
        const splitName = (options.name || '').split(' ');
        const firstName = splitName[0] || '';
        const lastName = splitName.slice(1).join(' ') || '';

        const signUpProps = {
            initialValues: {
                emailAddress: options.email || '',
                firstName: firstName,
                lastName: lastName
            }
        };

        window.clerk.openSignUp(signUpProps);
    } else {
        alert('Authentication is still loading. Please wait a moment...');
    }
};

script.onload = async () => {
    try {
        if (!window.Clerk) {
            throw new Error('window.Clerk is undefined. Script failed to export global.');
        }

        let clerk;
        if (typeof window.Clerk === 'function') {
            // It's a constructor
            const Clerk = window.Clerk;
            clerk = new Clerk(clerkPubKey);
            await clerk.load();
        } else {
            // It's likely already an instance (singleton)
            clerk = window.Clerk;
            await clerk.load({
                publishableKey: clerkPubKey
            });
        }

        window.clerk = clerk;
        window.clerkReady = true;

        // Update UI based on auth state
        if (clerk.user) {
            await handleSignedInUser(clerk);
        } else {
            handleSignedOutUser();
        }

        // Setup logout helper
        window.logout = () => {
            clerk.signOut();
        };

    } catch (err) {
        console.error('Error loading Clerk:', err);
        alert(`Authentication Error: ${err.message || err}`);
    }
};

document.head.appendChild(script);

async function handleSignedInUser(clerk) {
    // 1. Get Token
    const token = await clerk.session.getToken();
    window.token = token; // Expose for legacy scripts

    // 2. Sync with Backend
    try {
        const res = await fetch(`${config.API_BASE_URL}/api/auth/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user: clerk.user })
        });

        const data = await res.json();

        if (data.success) {
            const mongoUser = data.user;

            // Dispatch Ready Event for dashboard.js
            const event = new CustomEvent('clerk-ready', {
                detail: { user: clerk.user, mongoUser: mongoUser }
            });
            document.dispatchEvent(event);

            // Redirect logic (if on login page)
            // Redirect logic (if on login/signup page)
            const path = window.location.pathname;
            if (path.includes('login') || path.includes('signup') || path === '/') {
                const role = mongoUser.role;
                if (role === 'admin') window.location.href = 'dashboards/admin.html';
                else if (role === 'warden') window.location.href = 'dashboards/warden.html';
                else if (role === 'supervisor') window.location.href = 'dashboards/supervisor.html';
                else window.location.href = 'dashboards/student.html';
            }

            // Update Index.html UI
            updateIndexUI(mongoUser);
        }
    } catch (err) {
        console.error('Sync failed:', err);
    }
}

function updateIndexUI(mongoUser) {
    if (!mongoUser) return;

    // Determine dashboard link
    let dashLink = 'dashboards/student.html';
    if (mongoUser.role === 'admin') dashLink = 'dashboards/admin.html';
    else if (mongoUser.role === 'warden') dashLink = 'dashboards/warden.html';
    else if (mongoUser.role === 'supervisor') dashLink = 'dashboards/supervisor.html';

    // Desktop Button
    const desktopBtn = document.querySelector('.login-circle');
    if (desktopBtn) {
        desktopBtn.href = dashLink;
        desktopBtn.innerHTML = `
            <span>Dashboard</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
        `;
    }

    // Mobile Button
    const mobileLink = document.querySelector('#mobile-menu a[href="login.html"]');
    if (mobileLink) {
        mobileLink.href = dashLink;
        mobileLink.textContent = 'Dashboard';
    }

    // Hero Button
    const heroBtn = document.querySelector('#home a[href="login.html"]');
    if (heroBtn) {
        heroBtn.href = dashLink;
        heroBtn.textContent = 'Go to Dashboard';
    }
}

function handleSignedOutUser() {
    // If on a protected page, redirect to login
    if (window.location.pathname.includes('dashboards/')) {
        window.location.href = '../login.html';
    }
}
