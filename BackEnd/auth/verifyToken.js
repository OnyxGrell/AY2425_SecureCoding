const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Retrieve the Authorization header

    console.log("Authorization Header:", authHeader); // Log the Authorization header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Token missing or improperly formatted'); // Log missing or improperly formatted token
        return res.status(401).json({ auth: false, message: 'Not authorized! Token missing or invalid.' });
    }

    const token = authHeader.substring(7);

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log('Invalid or expired token'); // Log invalid or expired token
            return res.status(401).json({ auth: false, message: 'Not authorized! Invalid or expired token.' });
        }

        console.log('Token verified, user ID:', decoded.id); // Log successful token verification
        req.id = decoded.id; // Attach the decoded user ID to the request object
        res.locals.userId = decoded.id; // Attach the decoded user ID to the request object
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = verifyToken;