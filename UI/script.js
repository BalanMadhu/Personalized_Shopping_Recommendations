/**
 * Shopping Cart Application
 * Modern e-commerce frontend with cart management
 */

class ShoppingCart {
    constructor() {
        this.products = this.initializeProducts();
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.isCartOpen = false;
        
        this.initializeElements();
        this.bindEvents();
        this.renderProducts();
        this.updateCartUI();
    }

    initializeProducts() {
        return [
            {
                id: 1,
                title: "Premium Wireless Headphones",
                description: "High-quality audio with noise cancellation and 30-hour battery life.",
                price: 299.99,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
            },
            {
                id: 2,
                title: "Smart Fitness Watch",
                description: "Track your health and fitness with advanced sensors and GPS.",
                price: 199.99,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
            },
            {
                id: 3,
                title: "Portable Bluetooth Speaker",
                description: "Waterproof speaker with 360-degree sound and 12-hour playtime.",
                price: 89.99,
                image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop"
            },
            {
                id: 4,
                title: "Wireless Charging Pad",
                description: "Fast wireless charging for all Qi-enabled devices with LED indicator.",
                price: 49.99,
                image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop"
            },
            {
                id: 5,
                title: "USB-C Hub",
                description: "7-in-1 hub with HDMI, USB 3.0, SD card reader, and power delivery.",
                price: 79.99,
                image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=300&fit=crop"
            },
            {
                id: 6,
                title: "Mechanical Keyboard",
                description: "RGB backlit mechanical keyboard with tactile switches and aluminum frame.",
                price: 159.99,
                image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop"
            }
        ];
    }

    initializeElements() {
        this.elements = {
            productsGrid: document.getElementById('products-grid'),
            cartToggle: document.querySelector('.cart-toggle'),
            cartSidebar: document.getElementById('cart-sidebar'),
            cartClose: document.querySelector('.cart-close'),
            cartOverlay: document.querySelector('.cart-overlay'),
            cartItems: document.getElementById('cart-items'),
            cartCount: document.querySelector('.cart-count'),
            cartSubtotal: document.getElementById('cart-subtotal'),
            cartTotal: document.getElementById('cart-total'),
            checkoutBtn: document.getElementById('checkout-btn'),
            toastContainer: document.getElementById('toast-container')
        };
    }

    bindEvents() {
        // Cart toggle events
        this.elements.cartToggle.addEventListener('click', () => this.toggleCart());
        this.elements.cartClose.addEventListener('click', () => this.closeCart());
        this.elements.cartOverlay.addEventListener('click', () => this.closeCart());
        
        // Checkout event
        this.elements.checkoutBtn.addEventListener('click', () => this.handleCheckout());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCartOpen) {
                this.closeCart();
            }
        });

        // Prevent body scroll when cart is open
        this.elements.cartSidebar.addEventListener('transitionend', () => {
            if (this.isCartOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    renderProducts() {
        const productsHTML = this.products.map(product => `
            <article class="product-card" data-product-id="${product.id}">
                <img 
                    src="${product.image}" 
                    alt="${product.title}"
                    class="product-image"
                    loading="lazy"
                >
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <button 
                            class="add-to-cart" 
                            data-product-id="${product.id}"
                            aria-label="Add ${product.title} to cart"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

        this.elements.productsGrid.innerHTML = productsHTML;

        // Bind add to cart events
        this.elements.productsGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCart(productId);
            }
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.showToast(`${product.title} added to cart`, 'success');
        this.animateCartCount();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    updateCartUI() {
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotals();
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.elements.cartCount.textContent = totalItems;
        this.elements.cartCount.classList.toggle('visible', totalItems > 0);
    }

    renderCartItems() {
        if (this.cart.length === 0) {
            this.elements.cartItems.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                    <small>Add some products to get started</small>
                </div>
            `;
            return;
        }

        const cartHTML = this.cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <img 
                    src="${item.image}" 
                    alt="${item.title}"
                    class="cart-item-image"
                >
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button 
                            class="quantity-btn decrease" 
                            data-item-id="${item.id}"
                            aria-label="Decrease quantity"
                            ${item.quantity <= 1 ? 'disabled' : ''}
                        >−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button 
                            class="quantity-btn increase" 
                            data-item-id="${item.id}"
                            aria-label="Increase quantity"
                        >+</button>
                        <button 
                            class="remove-item" 
                            data-item-id="${item.id}"
                            aria-label="Remove ${item.title} from cart"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.elements.cartItems.innerHTML = cartHTML;

        // Bind cart item events
        this.elements.cartItems.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.itemId);
            
            if (e.target.classList.contains('decrease')) {
                const item = this.cart.find(item => item.id === itemId);
                this.updateQuantity(itemId, item.quantity - 1);
            } else if (e.target.classList.contains('increase')) {
                const item = this.cart.find(item => item.id === itemId);
                this.updateQuantity(itemId, item.quantity + 1);
            } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                this.removeFromCart(itemId);
            }
        });
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal; // Add tax/shipping calculations here if needed
        
        this.elements.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        this.elements.cartTotal.textContent = `$${total.toFixed(2)}`;
        
        this.elements.checkoutBtn.disabled = this.cart.length === 0;
    }

    toggleCart() {
        if (this.isCartOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        this.isCartOpen = true;
        this.elements.cartSidebar.classList.add('open');
        this.elements.cartSidebar.setAttribute('aria-hidden', 'false');
        
        // Focus management for accessibility
        setTimeout(() => {
            this.elements.cartClose.focus();
        }, 300);
    }

    closeCart() {
        this.isCartOpen = false;
        this.elements.cartSidebar.classList.remove('open');
        this.elements.cartSidebar.setAttribute('aria-hidden', 'true');
        
        // Return focus to cart toggle
        this.elements.cartToggle.focus();
    }

    handleCheckout() {
        if (this.cart.length === 0) return;
        
        // Simulate checkout process
        this.showToast('Redirecting to checkout...', 'success');
        
        // In a real application, this would redirect to a checkout page
        setTimeout(() => {
            alert(`Checkout Summary:\n\nItems: ${this.cart.length}\nTotal: $${this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}\n\nThank you for your purchase!`);
            
            // Clear cart after "purchase"
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.closeCart();
        }, 1000);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            <span class="toast-message">${message}</span>
        `;

        this.elements.toastContainer.appendChild(toast);

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

    animateCartCount() {
        this.elements.cartCount.classList.add('bounce');
        setTimeout(() => {
            this.elements.cartCount.classList.remove('bounce');
        }, 600);
    }
}

// Performance optimization: Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ShoppingCart());
} else {
    new ShoppingCart();
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(() => {
                // Service worker registration failed - not critical for demo
            });
    });
}