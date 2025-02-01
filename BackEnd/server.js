const express = require('express');
const fs = require('fs');
const https = require('https');
const serveStatic = require('serve-static');
const path = require('path');
const cors = require('cors');
const app = require('./controller/app'); 

// Serve static files
app.use(serveStatic(path.join(__dirname, 'public')));

privateKey = fs.readFileSync(path.join(__dirname, '../cert/key.pem'), 'utf8');
certificate = fs.readFileSync(path.join(__dirname, '../cert/cert.pem'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Define ports
const httpsPort = 8081;

// Create HTTPS servers
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, () => {
    console.log(`Backend HTTPS Server running at https://localhost:${httpsPort}`);
});

// Add a simple route for testing
app.get('/test', (req, res) => {
    res.send('Server is working!');
});

