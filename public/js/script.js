document.addEventListener("DOMContentLoaded", function () {
    // Modal Controls
    const loginBtn = document.getElementById("loginBtn");
    const loginModal = document.getElementById("loginModal");
    const closeModal = document.querySelector(".close-modal");

    loginBtn.addEventListener("click", () => {
        loginModal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        loginModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    // Sidebar Button Controls
    const contactBtn = document.getElementById("contactBtn");
    const tutorBtn = document.getElementById("tutorBtn");
    const backToTop = document.getElementById("backToTop");

    const contactUs = document.getElementById("contactUs");
    const joinTutor = document.getElementById("joinTutor");

    // Ensure sections are hidden initially
    contactUs.classList.add("hidden");
    joinTutor.classList.add("hidden");
    
    function expandSection(section) {
        section.classList.remove("collapsed");
        section.classList.add("expanded");
    }

    function collapseSection(section) {
        section.classList.remove("expanded");
        section.classList.add("collapsed");
    }

    // Hover event listeners
    contactBtn.addEventListener("mouseenter", () => expandSection(contactUs));
    contactBtn.addEventListener("mouseleave", () => collapseSection(contactUs));

    tutorBtn.addEventListener("mouseenter", () => expandSection(joinTutor));
    tutorBtn.addEventListener("mouseleave", () => collapseSection(joinTutor));

    function showOnly(sectionToShow) {
        [contactUs, joinTutor].forEach((section) => {
            if (section === sectionToShow) {
                section.classList.remove("hidden"); // Show section
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); // Scroll to bottom
            } else {
                section.classList.add("hidden"); // Hide other sections
            }
        });
    }
     contactUs.classList.add("collapsed");
    joinTutor.classList.add("collapsed");

    // Function to expand section on hover
    function expandSection(section) {
        section.classList.remove("collapsed");
        section.classList.add("expanded");
    }

    // Function to collapse section when not hovered
    function collapseSection(section) {
        section.classList.remove("expanded");
        section.classList.add("collapsed");
    }

    // Hover event listeners
    contactBtn.addEventListener("mouseenter", () => expandSection(contactUs));
    contactBtn.addEventListener("mouseleave", () => collapseSection(contactUs));

    tutorBtn.addEventListener("mouseenter", () => expandSection(joinTutor));
    tutorBtn.addEventListener("mouseleave", () => collapseSection(joinTutor));


    contactBtn.addEventListener("click", () => {
        showOnly(contactUs);
    });

    tutorBtn.addEventListener("click", () => {
        showOnly(joinTutor);
    });

    // Smooth Scroll for Back to Top Button
    backToTop.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    

    // Form Submission Handler
    document.getElementById("contactForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
        };

        try {
            const response = await fetch("http://localhost:5000/submit-form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            document.getElementById("formMessage").textContent = data.message;
            document.getElementById("contactForm").reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            document.getElementById("formMessage").textContent = "Error submitting form.";
        }
    });
});
// 🟢 Scroll Effect for Minimizing Hero Section 🟢
const heroSection = document.querySelector('.hero-section');

window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {  // Trigger effect after scrolling 100px
        heroSection.classList.add('shrink');
    } else {
        heroSection.classList.remove('shrink');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const contactBtn = document.getElementById('contactBtn');
    const tutorBtn = document.getElementById('tutorBtn');
    const contactUs = document.getElementById('contactUs');
    const joinTutor = document.getElementById('joinTutor');
    const modalOverlay = document.querySelector('.modal-overlay');
    const closeBtns = document.querySelectorAll('.close-btn');

    // Contact Button Click Handler
    contactBtn.addEventListener('click', function() {
        contactUs.classList.add('active');
        modalOverlay.classList.add('active');
    });

    // Tutor Button Click Handler
    tutorBtn.addEventListener('click', function() {
        joinTutor.classList.add('active');
        modalOverlay.classList.add('active');
    });

    // Close Button Click Handlers
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Close when clicking overlay
    modalOverlay.addEventListener('click', closeModals);

    function closeModals() {
        contactUs.classList.remove('active');
        joinTutor.classList.remove('active');
        modalOverlay.classList.remove('active');
    }
});

// Login/Signup Modal functionality
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');
const modalOverlay = document.querySelector('.modal-overlay');

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
    modalOverlay.classList.add('active');
});

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', () => {
    loginModal.style.display = 'none';
    modalOverlay.classList.remove('active');
});

// Form submission handling
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your login logic here
});

document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Add your signup logic here
});
