import postgres from 'postgres';

const sql = postgres({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: 'require',
});

// Site Configuration
const siteConfig = {
    currentSite: window.location.hostname,
    apiEndpoint: '/api'
};

// Cart Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartCount();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartCount();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
}

// Initialize cart
const cart = new Cart();

// Product Management
class ProductManager {
    async fetchProducts(filters = {}) {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`${siteConfig.apiEndpoint}/products?${queryString}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async getProductDetails(productId) {
        try {
            const response = await fetch(`${siteConfig.apiEndpoint}/products/${productId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    }
}

// User Authentication
class Auth {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    async login(email, password) {
        try {
            const response = await fetch(`${siteConfig.apiEndpoint}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.token) {
                this.token = data.token;
                localStorage.setItem('authToken', data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Initialize core objects
const productManager = new ProductManager();
const auth = new Auth();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cart button click handler
    document.getElementById('cartButton').addEventListener('click', () => {
        window.location.href = '/cart';
    });

    // User menu button click handler
    document.getElementById('userMenuButton').addEventListener('click', () => {
        if (auth.isAuthenticated()) {
            window.location.href = '/account';
        } else {
            window.location.href = '/login';
        }
    });

    // Add mobile menu toggle
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Add this code to handle the login form submission
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (data.success) {
                    // Redirect to home or another page on successful login
                    window.location.href = '/';
                } else {
                    // Show error message
                    errorMessage.textContent = data.message;
                    errorMessage.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error during login:', error);
                errorMessage.textContent = 'An error occurred. Please try again.';
                errorMessage.classList.remove('hidden');
            }
        });
    }
}); 