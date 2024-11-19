document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const otpVerificationForm = document.getElementById('otpVerificationForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const tabs = document.querySelectorAll('.tab');
    const switchLinks = document.querySelectorAll('.switch-link');
    const forgotPasswordLink = document.querySelector('.forgot-password');

    // Tab switching functionality
    function switchTab(tabName) {
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Hide all forms
        [loginForm, signupForm, forgotPasswordForm, otpVerificationForm, resetPasswordForm].forEach(form => {
            if (form) form.classList.add('hidden');
        });

        // Show selected form
        if (tabName === 'login') {
            loginForm.classList.remove('hidden');
        } else if (tabName === 'signup') {
            signupForm.classList.remove('hidden');
        }
    }

    // Add click handlers for tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Add click handlers for switch links
    switchLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.switch);
        });
    });

    // Forgot Password Link Handler
    forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        forgotPasswordForm.classList.remove('hidden');
    });

    // Handle forgot password form submission
    forgotPasswordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = forgotPasswordForm.querySelector('.submit-btn');
        const email = document.getElementById('forgotEmail').value;

        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;

        try {
            // Simulate API call to send OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store email for verification
            localStorage.setItem('reset_email', email);
            
            // Show success message
            showNotification('OTP sent to your email!', 'success');
            
            // Switch to OTP verification form
            forgotPasswordForm.classList.add('hidden');
            otpVerificationForm.classList.remove('hidden');
        } catch (error) {
            showNotification('Failed to send OTP. Please try again.', 'error');
        } finally {
            submitBtn.textContent = 'Send OTP';
            submitBtn.disabled = false;
        }
    });

    // Handle OTP verification form submission
    otpVerificationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = otpVerificationForm.querySelector('.submit-btn');
        const otp = document.getElementById('otpInput').value;

        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;

        try {
            // Simulate API call to verify OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo, accept any 6-digit OTP
            if (otp.length !== 6) {
                throw new Error('Invalid OTP');
            }
            
            showNotification('OTP verified successfully!', 'success');
            
            // Switch to reset password form
            otpVerificationForm.classList.add('hidden');
            resetPasswordForm.classList.remove('hidden');
        } catch (error) {
            showNotification(error.message || 'Invalid OTP', 'error');
        } finally {
            submitBtn.textContent = 'Verify OTP';
            submitBtn.disabled = false;
        }
    });

    // Handle reset password form submission
    resetPasswordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = resetPasswordForm.querySelector('.submit-btn');
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        submitBtn.textContent = 'Resetting...';
        submitBtn.disabled = true;

        try {
            // Simulate API call to reset password
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showNotification('Password reset successfully!', 'success');
            
            // Clear stored email
            localStorage.removeItem('reset_email');
            
            // Switch back to login form
            resetPasswordForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } catch (error) {
            showNotification('Failed to reset password', 'error');
        } finally {
            submitBtn.textContent = 'Reset Password';
            submitBtn.disabled = false;
        }
    });

    // Handle login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('.submit-btn');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.setItem('maidmatch_user', JSON.stringify({
                email: email,
                name: email.split('@')[0],
                isLoggedIn: true
            }));
            window.location.href = '/dashboard.html';
        } catch (error) {
            showNotification('Login failed', 'error');
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
        }
    });

    // Handle signup form submission
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = signupForm.querySelector('.submit-btn');
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const address = document.getElementById('signupAddress').value;
        const termsAccepted = document.getElementById('terms').checked;

        if (!termsAccepted) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            return;
        }

        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.setItem('maidmatch_user', JSON.stringify({
                name: name,
                email: email,
                address: address,
                isLoggedIn: true
            }));
            window.location.href = '/dashboard.html';
        } catch (error) {
            showNotification('Signup failed', 'error');
            submitBtn.textContent = 'Create Account';
            submitBtn.disabled = false;
        }
    });

    // Utility function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Check if user is already logged in
    const checkAuth = () => {
        const user = JSON.parse(localStorage.getItem('maidmatch_user') || '{}');
        if (user.isLoggedIn) {
            window.location.href = '/dashboard.html';
        }
    };

    // Run auth check when page loads
    checkAuth();
});