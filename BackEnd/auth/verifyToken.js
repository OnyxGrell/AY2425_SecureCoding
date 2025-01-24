const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Retrieve the Authorization header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Return 403 if the token is missing or improperly formatted
        return res.status(403).json({ auth: false, message: 'Not authorized! Token missing or invalid.' });
    }

    const token = authHeader.substring(7);

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            // Return 403 if the token is invalid or expired
            return res.status(403).json({ auth: false, message: 'Not authorized! Invalid or expired token.' });
        }

        req.id = decoded.id; // Attach the decoded user ID to the request object
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = verifyToken;
