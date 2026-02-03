// Authentication functionality
let users = JSON.parse(localStorage.getItem('pharmaUsers')) || [];

// Modal functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

function switchToRegister() {
    closeModal('loginModal');
    openRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    openLoginModal();
}

// Close modal when clicking outside
window.onclick = function (event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (event.target === loginModal) {
        closeModal('loginModal');
    }
    if (event.target === registerModal) {
        closeModal('registerModal');
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function () {
    // Login form
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        let user = users.find(u => u.email === email && u.password === password);

        // Demo mode: If user not found, create a temporary session user
        if (!user) {
            user = {
                id: 'demo-' + Date.now(),
                name: email.split('@')[0],
                email: email,
                password: password, // Not storing securely for demo
                createdAt: new Date().toISOString()
            };
        }

        if (user) {
            // Store current user session
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Immediate redirect with explicit origin
            console.log('Redirecting to analysis.html...');
            window.location.href = window.location.origin + '/analysis.html';
        }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long!', 'error');
            return;
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            showNotification('User with this email already exists!', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('pharmaUsers', JSON.stringify(users));

        showNotification('Account created successfully! You can now log in.', 'success');

        // Clear form and switch to login
        document.getElementById('registerForm').reset();
        setTimeout(() => {
            switchToLogin();
        }, 2000);
    });
});

// Enhanced notification system with Tailwind styling
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = 'notification fixed top-4 right-4 z-[200] max-w-sm transform transition-all duration-300 translate-x-full opacity-0';

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const icon = type === 'success' ? 'check_circle' : 'error';

    notification.innerHTML = `
        <div class="${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl border border-white/10 backdrop-blur-md">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl">${icon}</span>
                <span class="font-semibold">${message}</span>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 100);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.hover\\:scale-105');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });
});

// Add loading states to buttons
document.addEventListener('DOMContentLoaded', function () {
    const submitButtons = document.querySelectorAll('button[type="submit"]');

    submitButtons.forEach(button => {
        button.addEventListener('click', function () {
            const originalContent = this.innerHTML;
            this.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                </div>
            `;
            this.disabled = true;

            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
            }, 2000);
        });
    });
});