/**
 * Configuration for FastAPI Backend Connection
 */

const API_CONFIG = {
    BASE_URL: 'http://localhost:8000', // Change to your FastAPI server URL
    ENDPOINTS: {
        // Auth endpoints
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        
        // Product endpoints
        PRODUCTS: '/products',
        PRODUCT_DETAIL: '/products/{id}',
        SEARCH: '/products/search',
        CATEGORIES: '/products/categories',
        RECOMMENDATIONS: '/products/recommendations',
        
        // Cart endpoints
        CART: '/cart',
        ADD_TO_CART: '/cart/add',
        UPDATE_CART: '/cart/update',
        REMOVE_FROM_CART: '/cart/remove',
        
        // User actions
        FAVORITES: '/user/favorites',
        RECENTLY_VIEWED: '/user/recently-viewed',
        ORDER_HISTORY: '/user/orders'
    },
    
    // Request timeout in milliseconds
    TIMEOUT: 10000,
    
    // Default headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Export for use in other modules
window.API_CONFIG = API_CONFIG;