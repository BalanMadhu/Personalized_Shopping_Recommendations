/**
 * Cart Module - Handles cart page functionality
 */

class CartManager {
    constructor() {
        this.init();
    }

    init() {
        // Wait for UI manager to load navbar
        setTimeout(() => {
            this.renderCart();
            this.bindEvents();
        }, 100);
    }

    bindEvents() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Delegate events for cart items
        const cartContainer = document.getElementById('cart-items-container');
        if (cartContainer) {
            cartContainer.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.itemId || e.target.closest('[data-item-id]')?.dataset.itemId);
                
                if (e.target.classList.contains('quantity-decrease')) {
                    this.updateQuantity(itemId, -1);
                } else if (e.target.classList.contains('quantity-increase')) {
                    this.updateQuantity(itemId, 1);
                } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                    this.removeItem(itemId);
                }
            });
        }
    }

    renderCart() {
        const cart = window.uiManager?.getCart() || [];
        const container = document.getElementById('cart-items-container');
        
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty-state">
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="index.html" class="empty-cart-btn">Start Shopping</a>
                </div>
            `;
            this.updateSummary(cart);
            return;
        }

        const cartHTML = cart.map(item => `
            <div class="cart-item ${this.isRecentlyAdded(item.id) ? 'recently-added' : ''}" data-item-id="${item.id}">
                <img 
                    src="${item.image}" 
                    alt="${item.title}"
                    class="cart-item-image"
                >
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-description">${item.description}</p>
                    <div class="cart-item-price">${window.uiManager?.formatCurrency(item.price) || `$${item.price.toFixed(2)}`}</div>
                    <div class="quantity-controls">
                        <button 
                            class="quantity-btn quantity-decrease" 
                            data-item-id="${item.id}"
                            aria-label="Decrease quantity"
                            ${item.quantity <= 1 ? 'disabled' : ''}
                        >−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button 
                            class="quantity-btn quantity-increase" 
                            data-item-id="${item.id}"
                            aria-label="Increase quantity"
                        >+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="item-total">${window.uiManager?.formatCurrency(item.price * item.quantity) || `$${(item.price * item.quantity).toFixed(2)}`}</div>
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
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = cartHTML;
        this.updateSummary(cart);
    }

    updateQuantity(itemId, change) {
        const cart = window.uiManager?.getCart() || [];
        const item = cart.find(item => item.id === itemId);
        
        if (!item) return;

        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            this.removeItem(itemId);
            return;
        }

        item.quantity = newQuantity;
        
        if (window.uiManager) {
            window.uiManager.saveCart(cart);
        }
        
        this.renderCart();
    }

    removeItem(itemId) {
        const cart = window.uiManager?.getCart() || [];
        const updatedCart = cart.filter(item => item.id !== itemId);
        
        if (window.uiManager) {
            window.uiManager.saveCart(updatedCart);
            window.uiManager.showToast('Item removed from cart', 'success');
        }
        
        this.renderCart();
    }

    updateSummary(cart) {
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = window.uiManager?.calculateTax(subtotal) || 0;
        const total = subtotal + tax;

        // Update summary elements
        const elements = {
            itemCount: document.getElementById('item-count'),
            itemsTotal: document.getElementById('items-total'),
            taxAmount: document.getElementById('tax-amount'),
            finalTotal: document.getElementById('final-total'),
            checkoutBtn: document.getElementById('checkout-btn')
        };

        if (elements.itemCount) {
            elements.itemCount.textContent = itemCount;
        }
        
        if (elements.itemsTotal) {
            elements.itemsTotal.textContent = window.uiManager?.formatCurrency(subtotal) || `$${subtotal.toFixed(2)}`;
        }
        
        if (elements.taxAmount) {
            elements.taxAmount.textContent = window.uiManager?.formatCurrency(tax) || `$${tax.toFixed(2)}`;
        }
        
        if (elements.finalTotal) {
            elements.finalTotal.textContent = window.uiManager?.formatCurrency(total) || `$${total.toFixed(2)}`;
        }
        
        if (elements.checkoutBtn) {
            elements.checkoutBtn.disabled = cart.length === 0;
        }
    }

    isRecentlyAdded(itemId) {
        const recentItem = sessionStorage.getItem('recentlyAdded');
        return recentItem && parseInt(recentItem) === itemId;
    }

    handleCheckout() {
        const cart = window.uiManager?.getCart() || [];
        if (cart.length === 0) return;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = window.uiManager?.calculateTax(subtotal) || 0;
        const total = subtotal + tax;

        if (window.uiManager) {
            window.uiManager.showToast('Processing checkout...', 'success');
        }

        // Simulate checkout process
        setTimeout(() => {
            const summary = `Checkout Summary:
            
Items: ${cart.length} (${cart.reduce((sum, item) => sum + item.quantity, 0)} total)
Subtotal: ${window.uiManager?.formatCurrency(subtotal) || `$${subtotal.toFixed(2)}`}
Tax: ${window.uiManager?.formatCurrency(tax) || `$${tax.toFixed(2)}`}
Total: ${window.uiManager?.formatCurrency(total) || `$${total.toFixed(2)}`}

Thank you for your purchase!`;

            alert(summary);
            
            // Clear cart after "purchase"
            if (window.uiManager) {
                window.uiManager.saveCart([]);
            }
            sessionStorage.removeItem('recentlyAdded');
            this.renderCart();
        }, 1500);
    }
}

// Initialize Cart Manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CartManager();
    });
} else {
    new CartManager();
}