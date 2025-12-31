const API_URL = `${config.API_BASE_URL}/api`;

// Helper: Toggle Loading State
const setLoading = (btn, isLoading, originalText = 'Submit') => {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>`;
    } else {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMsg');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        setLoading(submitBtn, true);
        errorMsg.classList.add('hidden');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on role (using root-relative paths)
                let targetUrl = '/dashboards/student.html';
                if (data.user.role === 'admin') targetUrl = '/dashboards/admin.html';
                else if (data.user.role === 'warden' || data.user.role === 'supervisor') targetUrl = '/dashboards/warden.html';

                window.location.href = targetUrl;
            } else {
                errorMsg.textContent = data.message;
                errorMsg.classList.remove('hidden');
                setLoading(submitBtn, false, originalText);
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = 'Connection failed. Please check your internet or try again later.';
            errorMsg.classList.remove('hidden');
            setLoading(submitBtn, false, originalText);
        }
    });
}

// Signup Logic
const signupForm = document.getElementById('signupForm');
let userEmail = '';

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('signupError');
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText; // Use innerText to grab text only

        setLoading(submitBtn, true);
        errorMsg.classList.add('hidden');

        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (data.success) {
                userEmail = email;
                document.getElementById('signupForm').classList.add('hidden');
                document.getElementById('otpForm').classList.remove('hidden');
            } else {
                errorMsg.textContent = data.message;
                errorMsg.classList.remove('hidden');
                setLoading(submitBtn, false, originalText);
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = 'Connection failed';
            errorMsg.classList.remove('hidden');
            setLoading(submitBtn, false, originalText);
        }
    });

    document.getElementById('otpForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('otp').value;
        const errorMsg = document.getElementById('otpError');
        const submitBtn = document.getElementById('otpForm').querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        setLoading(submitBtn, true);
        errorMsg.classList.add('hidden');

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, otp })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboards/student.html';
            } else {
                errorMsg.textContent = data.message;
                errorMsg.classList.remove('hidden');
                setLoading(submitBtn, false, originalText);
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = 'Connection failed';
            errorMsg.classList.remove('hidden');
            setLoading(submitBtn, false, originalText);
        }
    });
}
