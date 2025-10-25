# E-commerce Frontend - FastAPI Integration

A fully functional e-commerce frontend that seamlessly connects with FastAPI backend and MySQL database.

## Features

### 🛒 **Core E-commerce Functionality**
- Dynamic product display from FastAPI backend
- Responsive product grid with auto-alignment
- Real-time search and filtering
- Category-based product filtering
- Add to cart / View cart functionality
- User authentication (login/signup)
- Product recommendations
- Favorites and recently viewed products

### 🎨 **Modern UI/UX**
- Clean, modern design with teal/coral/indigo color scheme
- Fully responsive for desktop, tablet, and mobile
- Loading states and error handling
- Toast notifications for user feedback
- Smooth animations and transitions

### 🔧 **Technical Features**
- Modular JavaScript architecture
- RESTful API integration with FastAPI
- JWT token-based authentication
- Local storage fallback for cart (when not logged in)
- Error handling and retry mechanisms
- Performance optimized with lazy loading

## File Structure

```
UI/
├── index.html          # Main product page
├── cart.html          # Shopping cart page
├── ui.html            # Reusable navbar component
├── styles.css         # Complete styling
├── config.js          # API configuration
├── api.js             # FastAPI service layer
├── ui.js              # UI utilities and components
├── auth.js            # Authentication management
├── products.js        # Product display and cart operations
├── cart.js            # Cart page functionality
└── README.md          # This file
```

## Backend Integration

### API Endpoints Expected

The frontend expects your FastAPI backend to provide these endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

#### Products
- `GET /products` - Get all products (with pagination, search, category filters)
- `GET /products/{id}` - Get single product
- `GET /products/search?q={query}` - Search products
- `GET /products/categories` - Get product categories
- `GET /products/recommendations` - Get product recommendations

#### Cart (Authenticated Users)
- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/update` - Update cart item quantity
- `DELETE /cart/remove` - Remove item from cart

#### User Actions
- `GET /user/favorites` - Get user favorites
- `POST /user/favorites` - Add to favorites
- `GET /user/recently-viewed` - Get recently viewed products
- `POST /user/recently-viewed` - Add to recently viewed

### Expected Data Formats

#### Product Object
```json
{
  "id": 1,
  "title": "Product Name",
  "name": "Product Name", // Alternative field name
  "description": "Product description",
  "price": 99.99,
  "image": "https://example.com/image.jpg",
  "image_url": "https://example.com/image.jpg", // Alternative field name
  "category": "Electronics",
  "stock": 10
}
```

#### User Object
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Cart Item Object
```json
{
  "product_id": 1,
  "quantity": 2,
  "product": {
    // Product object
  }
}
```

## Setup Instructions

### 1. Configure Backend URL

Edit `config.js` and update the `BASE_URL`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000', // Change to your FastAPI server URL
    // ... rest of config
};
```

### 2. CORS Configuration

Ensure your FastAPI backend allows CORS for your frontend domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5500"], # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Authentication Headers

The frontend sends JWT tokens in the Authorization header:
```
Authorization: Bearer <token>
```

### 4. Error Handling

The frontend expects standard HTTP status codes:
- `200` - Success
- `401` - Unauthorized (triggers login prompt)
- `404` - Not found
- `500` - Server error

### 5. Response Format

All API responses should be JSON. For lists, you can return either:
```json
{
  "products": [...],
  "total": 100,
  "page": 1
}
```
or simply:
```json
[...]
```

## Running the Frontend

### Option 1: Simple HTTP Server
```bash
# Python 3
python -m http.server 8080

# Node.js
npx http-server -p 8080

# PHP
php -S localhost:8080
```

### Option 2: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

### Option 3: Any Web Server
Place files in your web server directory and access via browser.

## Testing Without Backend

The frontend includes fallback functionality:
- Products will show loading state if backend is unavailable
- Cart functionality works with localStorage when not authenticated
- Error messages guide users when backend is down

## Customization

### Styling
- Edit `styles.css` to customize colors, fonts, and layout
- Current color scheme: Teal (#0d9488), Coral (#f97316), Indigo (#6366f1)

### API Endpoints
- Modify `config.js` to match your backend endpoint structure
- Update `api.js` if you need different request/response handling

### Features
- Add new product filters in `products.js`
- Extend user profile features in `auth.js`
- Customize cart behavior in `cart.js`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Features

- Lazy loading images
- Debounced search (300ms delay)
- Efficient DOM updates
- Minimal API calls
- Local storage caching

## Security Features

- JWT token storage in localStorage
- Automatic token cleanup on logout
- CSRF protection through proper headers
- Input validation on forms

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your FastAPI backend allows your frontend domain
2. **API Not Found**: Check `config.js` BASE_URL matches your backend
3. **Authentication Issues**: Verify JWT token format and expiration
4. **Images Not Loading**: Ensure image URLs are accessible or add placeholder handling

### Debug Mode

Open browser console to see detailed API request/response logs and error messages.

## Production Deployment

1. Update `config.js` with production API URL
2. Minify CSS and JavaScript files
3. Optimize images
4. Enable HTTPS
5. Configure proper caching headers
6. Test all functionality with production backend

## License

This frontend is designed to work with your existing FastAPI backend and can be customized as needed for your specific requirements.