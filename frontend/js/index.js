// Simple Slider Logic
let currentSlide = 0;
const slides = document.querySelectorAll('.slider-slide');

function changeSlide(index) {
    slides[currentSlide].style.opacity = '0';
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    slides[currentSlide].style.opacity = '1';
}

setInterval(() => {
    changeSlide(currentSlide + 1);
}, 5000); // Change every 5 seconds

// Mobile Menu Toggle
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// AJAX Form Submission
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

async function handleSubmit(event) {
    event.preventDefault();
    // Use Formspree (Direct Submission) instead of Backend API
    // Use Dynamic Env Var if available, else fallback to hardcoded action
    const apiEndpoint = config.FORMSPREE_URL || form.action;

    if (!apiEndpoint) {
        formStatus.textContent = "Error: Formspree URL not configured. Please check Vercel settings.";
        formStatus.classList.remove("hidden", "text-green-600");
        formStatus.classList.add("text-red-500");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formStatus.classList.add("hidden");

    const formData = new FormData(form);
    const jsonData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        const data = await response.json();

        if (response.ok) {
            formStatus.textContent = "Thanks for your message! We'll get back to you soon.";
            formStatus.classList.remove("hidden", "text-red-500");
            formStatus.classList.add("text-green-600");
            form.reset();
        } else {
            formStatus.textContent = data.message || "Oops! There was a problem submitting your form";
            formStatus.classList.remove("hidden", "text-green-600");
            formStatus.classList.add("text-red-500");
        }
    } catch (error) {
        formStatus.textContent = "Connection error. Please try again later.";
        formStatus.classList.remove("hidden", "text-green-600");
        formStatus.classList.add("text-red-500");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
}
form.addEventListener("submit", handleSubmit);
