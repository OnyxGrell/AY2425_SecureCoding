const express = require('express');
const fs = require('fs');
const https = require('https');
const serveStatic = require('serve-static');

const hostname = "localhost";
const port = 3001;

const app = express();

app.use(function(req, res, next) {
    console.log(req.url);
    console.log(req.method);
    console.log(req.path);
    console.log(req.query.id);

    if (req.method != "GET") {
        res.type('.html');
        var msg = "<html><body>This server only serves web pages with GET!</body></html>";
        res.end(msg);
    } else {
        next();
    }
});

app.use(serveStatic(__dirname + "/public"));

// Read SSL certificate and key
const privateKey = fs.readFileSync('../cert/key.pem', 'utf8');
const certificate = fs.readFileSync('../cert/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, hostname, function() {
    console.log(`HTTPS Server hosted at https://${hostname}:${port}`);
});