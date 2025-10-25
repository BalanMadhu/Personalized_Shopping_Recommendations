/**
 * Authentication Module - Handles user login/signup
 */

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Auth modal toggles
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const authModal = document.getElementById('auth-modal');
        const closeModal = document.querySelector('.close-modal');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showAuthModal('login'));
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showAuthModal('register'));
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideAuthModal());
        }

        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) this.hideAuthModal();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            this.showLoading('login');
            const response = await window.apiService.login(credentials);
            
            window.uiManager?.showToast('Login successful!', 'success');
            this.hideAuthModal();
            this.updateAuthUI();
            
            // Reload page to fetch user-specific data
            setTimeout(() => window.location.reload(), 1000);
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('login', error.message || 'Login failed. Please try again.');
        } finally {
            this.hideLoading('login');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirm_password: formData.get('confirm_password')
        };

        // Validate passwords match
        if (userData.password !== userData.confirm_password) {
            this.showError('register', 'Passwords do not match');
            return;
        }

        try {
            this.showLoading('register');
            await window.apiService.register(userData);
            
            window.uiManager?.showToast('Registration successful! Please login.', 'success');
            this.showAuthModal('login');
            
        } catch (error) {
            console.error('Registration failed:', error);
            this.showError('register', error.message || 'Registration failed. Please try again.');
        } finally {
            this.hideLoading('register');
        }
    }

    async handleLogout() {
        try {
            await window.apiService.logout();
            window.uiManager?.showToast('Logged out successfully', 'success');
            this.updateAuthUI();
            
            // Reload page to clear user-specific data
            setTimeout(() => window.location.reload(), 1000);
            
        } catch (error) {
            console.error('Logout failed:', error);
            // Clear local auth even if server request fails
            window.apiService.clearAuth();
            this.updateAuthUI();
        }
    }

    checkAuthStatus() {
        this.updateAuthUI();
        
        // Load user profile if authenticated
        if (window.apiService.isAuthenticated()) {
            this.loadUserProfile();
        }
    }

    async loadUserProfile() {
        try {
            const profile = await window.apiService.getProfile();
            this.updateUserProfile(profile);
        } catch (error) {
            console.error('Failed to load user profile:', error);
            // Token might be expired, clear auth
            window.apiService.clearAuth();
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const isAuthenticated = window.apiService.isAuthenticated();
        const user = window.apiService.getUser();

        // Update navigation
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');

        if (authButtons && userMenu) {
            if (isAuthenticated && user) {
                authButtons.style.display = 'none';
                userMenu.style.display = 'flex';
                if (userName) userName.textContent = user.name || user.email;
            } else {
                authButtons.style.display = 'flex';
                userMenu.style.display = 'none';
            }
        }
    }

    updateUserProfile(profile) {
        // Update user profile information in UI
        const profileElements = {
            userName: document.getElementById('user-name'),
            userEmail: document.getElementById('user-email'),
            userAvatar: document.getElementById('user-avatar')
        };

        if (profileElements.userName) {
            profileElements.userName.textContent = profile.name;
        }
        
        if (profileElements.userEmail) {
            profileElements.userEmail.textContent = profile.email;
        }
        
        if (profileElements.userAvatar && profile.avatar) {
            profileElements.userAvatar.src = profile.avatar;
        }
    }

    showAuthModal(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        const loginForm = document.getElementById('login-form-container');
        const registerForm = document.getElementById('register-form-container');

        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        if (loginForm && registerForm) {
            if (mode === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        }
    }

    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Clear any error messages
        this.clearErrors();
    }

    showLoading(formType) {
        const submitBtn = document.querySelector(`#${formType}-form button[type="submit"]`);
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Loading...';
        }
    }

    hideLoading(formType) {
        const submitBtn = document.querySelector(`#${formType}-form button[type="submit"]`);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = formType === 'login' ? 'Login' : 'Register';
        }
    }

    showError(formType, message) {
        const errorElement = document.getElementById(`${formType}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }
}

// Initialize Auth Manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager = new AuthManager();
    });
} else {
    window.authManager = new AuthManager();
}