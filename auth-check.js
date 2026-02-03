// Authentication check for main application
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        console.warn('No user found in localStorage. Redirecting to login.');
        // No user logged in, redirect to main landing page
        window.location.href = 'login.html';
        return;
    }
    console.log('User authenticated:', currentUser.name);

    // Update user profile in navigation if user is logged in
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        const userName = userProfile.querySelector('span') || userProfile.childNodes[2];
        if (userName) {
            userName.textContent = currentUser.name || 'Dr. Pharma';
        }
    }

    // Add logout functionality
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                window.location.replace('login.html');
            }
        });
    }
});