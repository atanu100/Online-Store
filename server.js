const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Trust proxy for Vercel
app.enable('trust proxy');

// Enable better error logging
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Setup handlebars
app.engine('handlebars', exphbs.engine({
    layoutsDir: path.join(__dirname, 'sites/templates/layouts'),
    defaultLayout: 'base',
    extname: '.handlebars'
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'sites/templates'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: '1d',
    etag: true
}));

// Site configuration
const siteConfig = {
    siteName: 'PRC',
    siteLogo: 'https://via.placeholder.com/150x50?text=PRC',  // Temporary logo
    siteEmail: 'contact@prc.com',
    sitePhone: '1-800-PRC-KITCHEN'
};

// Handle routes
app.get('/', (req, res) => {
    res.render('home', { 
        layout: 'base',
        ...siteConfig 
    });
});

app.get('/products', (req, res) => {
    const products = [
        { name: 'Product 1', price: 1500, image: 'path/to/image1.jpg' },
        { name: 'Product 2', price: 2500, image: 'path/to/image2.jpg' },
        { name: 'Product 3', price: 3500, image: 'path/to/image3.jpg' },
    ];
    res.render('products', { 
        layout: 'base',
        products,
        ...siteConfig 
    });
});

app.get('/categories', (req, res) => {
    res.render('categories', { 
        layout: 'base',
        ...siteConfig 
    });
});

// Add this route to serve the login page
app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'base',
        ...siteConfig
    });
});

// Add this route to handle login requests
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Here you would typically check the credentials against a database
    // For demonstration, let's assume a simple check
    if (email === 'test@example.com' && password === 'password') {
        // Simulate successful login
        req.session.user = { email }; // Store user info in session
        return res.json({ success: true });
    }

    // If login fails
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Add 404 handler
app.use((req, res, next) => {
    res.status(404).render('404', { 
        layout: 'base',
        ...siteConfig,
        message: 'Page not found'
    });
});

// Simple server start for Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`PRC app listening at http://localhost:${port}`);
    });
}

// Export the app for Vercel
module.exports = app; 