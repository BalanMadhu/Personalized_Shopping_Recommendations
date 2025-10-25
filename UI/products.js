/**
 * Products Module - Handles product display and cart operations
 */

class ProductManager {
    constructor() {
        this.products = [];
        this.loading = false;
        this.currentPage = 1;
        this.searchQuery = '';
        this.selectedCategory = '';
        this.init();
    }

    async init() {
        // Wait for UI manager to load navbar
        setTimeout(async () => {
            await this.loadProducts();
            this.bindEvents();
            this.initViewCartButton();
            this.initSearch();
        }, 100);
    }

    async loadProducts(params = {}) {
        try {
            this.showLoading();
            const response = await window.apiService.getProducts({
                page: this.currentPage,
                search: this.searchQuery,
                category: this.selectedCategory,
                ...params
            });
            
            this.products = response.products || response;
            this.renderProducts();
            this.loadRecommendations();
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showError('Failed to load products. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async loadRecommendations() {
        try {
            const user = window.apiService.getUser();
            if (user) {
                const recommendations = await window.apiService.getRecommendations(user.id);
                this.renderRecommendations(recommendations);
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (this.products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        const productsHTML = this.products.map(product => `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img 
                        src="${product.image || product.image_url || '/placeholder.jpg'}" 
                        alt="${product.title || product.name}"
                        class="product-image"
                        loading="lazy"
                        onerror="this.src='/placeholder.jpg'"
                    >
                    <button class="favorite-btn" data-product-id="${product.id}" aria-label="Add to favorites">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title || product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
                    <div class="product-footer">
                        <span class="product-price">${window.uiManager?.formatCurrency(product.price) || `$${product.price.toFixed(2)}`}</span>
                        <button 
                            class="add-to-cart" 
                            data-product-id="${product.id}"
                            aria-label="Add ${product.title || product.name} to cart"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </article>
        `).join('');

        productsGrid.innerHTML = productsHTML;
    }

    renderRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) return;
        
        const container = document.getElementById('recommendations-container');
        if (!container) return;
        
        const html = `
            <section class="recommendations">
                <h2>Recommended for You</h2>
                <div class="recommendations-grid">
                    ${recommendations.map(product => `
                        <div class="recommendation-card" data-product-id="${product.id}">
                            <img src="${product.image || '/placeholder.jpg'}" alt="${product.title}" loading="lazy">
                            <h4>${product.title}</h4>
                            <span class="price">${window.uiManager?.formatCurrency(product.price) || `$${product.price.toFixed(2)}`}</span>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
        
        container.innerHTML = html;
    }

    bindEvents() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        productsGrid.addEventListener('click', async (e) => {
            const productId = parseInt(e.target.dataset.productId || e.target.closest('[data-product-id]')?.dataset.productId);
            
            if (e.target.classList.contains('add-to-cart')) {
                await this.addToCart(productId);
            } else if (e.target.classList.contains('favorite-btn') || e.target.closest('.favorite-btn')) {
                await this.toggleFavorite(productId);
            }
        });
    }

    initSearch() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value;
                    this.currentPage = 1;
                    this.loadProducts();
                }, 300);
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }
    }

    async toggleFavorite(productId) {
        try {
            if (!window.apiService.isAuthenticated()) {
                window.uiManager?.showToast('Please login to add favorites', 'error');
                return;
            }
            
            await window.apiService.addToFavorites(productId);
            window.uiManager?.showToast('Added to favorites', 'success');
            
            // Update UI
            const favoriteBtn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn`);
            if (favoriteBtn) {
                favoriteBtn.classList.toggle('active');
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            window.uiManager?.showToast('Failed to update favorites', 'error');
        }
    }

    showLoading() {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading products...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading will be hidden when products are rendered
    }

    showError(message) {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }

    async addToCart(productId) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) return;

            // Add to recently viewed
            this.addToRecentlyViewed(productId);

            if (window.apiService.isAuthenticated()) {
                // Use backend cart
                await window.apiService.addToCart(productId, 1);
            } else {
                // Use local cart
                const cart = window.uiManager?.getCart() || [];
                const existingItem = cart.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                
                window.uiManager?.saveCart(cart);
            }

            window.uiManager?.showToast(`${product.title || product.name} added to cart`, 'success');
            this.animateCartCount();
            
            sessionStorage.setItem('recentlyAdded', productId.toString());
            
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 800);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            window.uiManager?.showToast('Failed to add item to cart', 'error');
        }
    }

    async addToRecentlyViewed(productId) {
        try {
            if (window.apiService.isAuthenticated()) {
                await window.apiService.addToRecentlyViewed(productId);
            }
        } catch (error) {
            console.error('Failed to add to recently viewed:', error);
        }
    }

    animateCartCount() {
        const cartCount = document.getElementById('nav-cart-count');
        if (cartCount) {
            cartCount.classList.add('bounce');
            setTimeout(() => {
                cartCount.classList.remove('bounce');
            }, 600);
        }
        this.updateViewCartButton();
    }

    initViewCartButton() {
        const viewCartBtn = document.getElementById('view-cart-btn');
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                window.location.href = 'cart.html';
            });
        }
        this.updateViewCartButton();
    }

    updateViewCartButton() {
        const cart = window.uiManager?.getCart() || [];
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
            totalElement.textContent = window.uiManager?.formatCurrency(totalAmount) || `$${totalAmount.toFixed(2)}`;
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
    }
}

// Initialize Product Manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProductManager();
    });
} else {
    new ProductManager();
}