document.addEventListener("DOMContentLoaded", function () {
    let loginModal = document.getElementById("loginModal");
    let loginBtn = document.getElementById("loginBtn");
    let closeModal = document.querySelector(".close-modal");

// Open Modal
loginBtn.addEventListener("click", function () {
    loginModal.style.display = "block";
});

// Close Modal
closeModal.addEventListener("click", function () {
    loginModal.style.display = "none";
});

// Close Modal when clicking outside
window.addEventListener("click", function (e) {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
});

// Handle Signup
document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const phone = document.getElementById("signupPhone").value;
    const password = document.getElementById("signupPassword").value;

    try {
        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();
        alert(data.message);
        if (data.success) {
            document.getElementById("signupForm").reset();
            loginModal.style.display = "none";
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Error signing up. Please try again.");
    }
});

// Handle Login
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        alert(data.message);
        if (data.success) {
            localStorage.setItem("token", data.token);
            document.getElementById("loginForm").reset();
            loginModal.style.display = "none";
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Error logging in. Please try again.");
    }
});
});
    // Form Submission Handling
    document.getElementById("authForm").addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent default form submission

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let phone = document.getElementById("phone").value.trim();
        let password = document.getElementById("password").value.trim();

        // Validate Inputs
        if (name === "" || email === "" || phone === "" || password === "") {
            alert("Please fill in all fields.");
            return;
        }

        // Simulated account creation
        alert(`Welcome, ${name}! Your account has been created.`);

        // Close Modal after successful registration
        loginModal.style.display = "none";

        // Optional: Clear form fields
        document.getElementById("authForm").reset();
    });

