const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Setup handlebars
app.engine('handlebars', exphbs.engine({
    layoutsDir: path.join(__dirname, 'sites/templates/layouts'),
    defaultLayout: 'base',
    extname: '.handlebars'
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'sites/templates'));

// Serve static files
app.use('/assets', express.static('assets'));
app.use('/sites', express.static('sites'));

// Site configuration
const siteConfig = {
    siteName: 'PRC',
    siteLogo: '/assets/images/logo.png',
    siteEmail: 'contact@prc.com',
    sitePhone: '1-800-PRC-KITCHEN'
};

// Function to start server on next available port
function startServer(initialPort) {
    const server = app.listen(initialPort)
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${initialPort} is busy, trying ${initialPort + 1}...`);
                startServer(initialPort + 1);
            } else {
                console.error('Server error:', err);
            }
        })
        .on('listening', () => {
            const address = server.address();
            console.log(`PRC app listening at http://localhost:${address.port}`);
        });
}

// Handle routes
app.get('/', (req, res) => {
    res.render('home', { 
        layout: 'base',
        ...siteConfig 
    });
});

app.get('/products', (req, res) => {
    res.render('products', { 
        layout: 'base',
        ...siteConfig 
    });
});

app.get('/categories', (req, res) => {
    res.render('categories', { 
        layout: 'base',
        ...siteConfig 
    });
});

// Start the server
startServer(port); 