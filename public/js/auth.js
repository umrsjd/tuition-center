// Handle signup
// Update the fetch URL to include the correct port
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;

    try {
        // Update the fetch URL
        // Update the fetch URL to use port 4000
        const response = await fetch('http://localhost:4000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('otpModal').style.display = 'block';
            document.getElementById('userId').value = data.userId;
            alert('OTP has been sent to your email and phone');
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during signup. Please try again.');
    }
});

// Handle OTP verification
document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const otp = document.getElementById('otpInput').value;
    const userId = document.getElementById('userId').value;

    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp, userId })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Account verified successfully!');
            document.getElementById('otpModal').style.display = 'none';
            window.location.reload();
        } else {
            alert(data.message || 'Invalid OTP');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during verification. Please try again.');
    }
});

// Close OTP modal when clicking the close button
document.querySelector('#otpModal .close-modal').addEventListener('click', () => {
    document.getElementById('otpModal').style.display = 'none';
});

// Handle login
// Update login handler
// Add close modal functionality
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'none';
    document.querySelector('.modal-overlay').style.display = 'none';
});

// Update login handler to use the correct port
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            alert('Login successful!');
            document.getElementById('loginModal').style.display = 'none';
            document.querySelector('.modal-overlay').style.display = 'none';
            updateUIForLoggedInUser(data.name);
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during login. Please try again.');
    }
});

// Update UI for logged-in user
function updateUIForLoggedInUser(userName) {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.style.display = 'none'; // Hide login button
    
    // Add user info display
    const userInfo = document.createElement('div');
    userInfo.id = 'userInfo';
    userInfo.innerHTML = `
        <span>Welcome, ${userName}!</span>
        <button onclick="logout()" class="logout-btn">Logout</button>
    `;
    loginBtn.parentNode.insertBefore(userInfo, loginBtn);
}

// Update logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    const userInfo = document.getElementById('userInfo');
    if (userInfo) userInfo.remove();
    document.getElementById('loginBtn').style.display = 'block';
    window.location.reload();
}

// Check auth status on page load
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    if (token && userName) {
        updateUIForLoggedInUser(userName);
    }
});

