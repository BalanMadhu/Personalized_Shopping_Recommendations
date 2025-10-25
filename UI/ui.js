/**
 * UI Module - Handles shared UI components and utilities
 */

class UIManager {
    constructor() {
        this.loadNavbar();
        this.updateCartCount();
    }

    // Load reusable navbar component
    async loadNavbar() {
        try {
            const response = await fetch('ui.html');
            const navbarHTML = await response.text();
            document.getElementById('navbar-container').innerHTML = navbarHTML;
            this.updateCartCount();
        } catch (error) {
            console.error('Failed to load navbar:', error);
        }
    }

    // Update cart count in navbar
    updateCartCount() {
        const cart = this.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('nav-cart-count');
        
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            cartCountElement.classList.toggle('visible', totalItems > 0);
        }
    }

    // Get cart from localStorage
    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Save cart to localStorage
    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        this.updateViewCartButton();
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Calculate tax (8.5% for demo)
    calculateTax(subtotal) {
        return subtotal * 0.085;
    }

    // Update view cart button
    updateViewCartButton() {
        const cart = this.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update floating cart button
        const container = document.getElementById('view-cart-container');
        const countElement = document.getElementById('view-cart-count');
        const totalElement = document.getElementById('view-cart-total');
        
        if (container) {
            container.classList.toggle('visible', totalItems > 0);
        }
        
        if (countElement) {
            countElement.textContent = totalItems;
            countElement.classList.toggle('visible', totalItems > 0);
        }
        
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(totalAmount);
        }
        
        // Update hero cart button
        const heroContainer = document.getElementById('hero-cart-btn');
        const heroCount = document.getElementById('hero-cart-count');
        
        if (heroContainer) {
            heroContainer.classList.toggle('visible', totalItems > 0);
        }
        
        if (heroCount) {
            heroCount.textContent = totalItems;
        }
        
        // Update top corner cart button
        const topContainer = document.getElementById('top-cart-btn');
        const topCount = document.getElementById('corner-cart-count');
        
        if (topContainer) {
            topContainer.classList.toggle('visible', totalItems > 0);
        }
        
        if (topCount) {
            topCount.textContent = totalItems;
            topCount.classList.toggle('visible', totalItems > 0);
        }
        
        // Update navbar shopping cart button
        const navCartBtn = document.getElementById('nav-cart-btn');
        const navCartItems = document.getElementById('nav-cart-items');
        
        if (navCartBtn) {
            navCartBtn.classList.toggle('visible', totalItems > 0);
        }
        
        if (navCartItems) {
            navCartItems.textContent = totalItems;
        }
    }
}

// Initialize UI Manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uiManager = new UIManager();
    });
} else {
    window.uiManager = new UIManager();
}