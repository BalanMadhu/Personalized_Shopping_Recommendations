/**
 * API Service - Handles all FastAPI backend communication
 */

class APIService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.token = localStorage.getItem('auth_token');
    }

    // Generic request method with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            timeout: this.timeout,
            headers: {
                ...API_CONFIG.HEADERS,
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request failed: ${endpoint}`, error);
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timeout');
        }
        if (error.message.includes('401')) {
            this.clearAuth();
            return new Error('Authentication required');
        }
        return error;
    }

    // Auth methods
    async login(credentials) {
        const response = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.access_token) {
            this.setAuth(response.access_token, response.user);
        }
        return response;
    }

    async register(userData) {
        return await this.request(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        try {
            await this.request(API_CONFIG.ENDPOINTS.LOGOUT, { method: 'POST' });
        } finally {
            this.clearAuth();
        }
    }

    async getProfile() {
        return await this.request(API_CONFIG.ENDPOINTS.PROFILE);
    }

    // Product methods
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.PRODUCTS}?${queryString}` : API_CONFIG.ENDPOINTS.PRODUCTS;
        return await this.request(endpoint);
    }

    async getProduct(id) {
        const endpoint = API_CONFIG.ENDPOINTS.PRODUCT_DETAIL.replace('{id}', id);
        return await this.request(endpoint);
    }

    async searchProducts(query, filters = {}) {
        const params = { q: query, ...filters };
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`${API_CONFIG.ENDPOINTS.SEARCH}?${queryString}`);
    }

    async getCategories() {
        return await this.request(API_CONFIG.ENDPOINTS.CATEGORIES);
    }

    async getRecommendations(userId = null) {
        const params = userId ? { user_id: userId } : {};
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.RECOMMENDATIONS}?${queryString}` : API_CONFIG.ENDPOINTS.RECOMMENDATIONS;
        return await this.request(endpoint);
    }

    // Cart methods
    async getCart() {
        return await this.request(API_CONFIG.ENDPOINTS.CART);
    }

    async addToCart(productId, quantity = 1) {
        return await this.request(API_CONFIG.ENDPOINTS.ADD_TO_CART, {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    async updateCart(productId, quantity) {
        return await this.request(API_CONFIG.ENDPOINTS.UPDATE_CART, {
            method: 'PUT',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    async removeFromCart(productId) {
        return await this.request(API_CONFIG.ENDPOINTS.REMOVE_FROM_CART, {
            method: 'DELETE',
            body: JSON.stringify({ product_id: productId })
        });
    }

    // User action methods
    async getFavorites() {
        return await this.request(API_CONFIG.ENDPOINTS.FAVORITES);
    }

    async addToFavorites(productId) {
        return await this.request(API_CONFIG.ENDPOINTS.FAVORITES, {
            method: 'POST',
            body: JSON.stringify({ product_id: productId })
        });
    }

    async getRecentlyViewed() {
        return await this.request(API_CONFIG.ENDPOINTS.RECENTLY_VIEWED);
    }

    async addToRecentlyViewed(productId) {
        return await this.request(API_CONFIG.ENDPOINTS.RECENTLY_VIEWED, {
            method: 'POST',
            body: JSON.stringify({ product_id: productId })
        });
    }

    // Auth helpers
    setAuth(token, user) {
        this.token = token;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }
}

// Initialize global API service
window.apiService = new APIService();