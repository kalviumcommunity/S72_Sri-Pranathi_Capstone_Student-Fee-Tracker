const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'your-secret-key');
        console.log('Token decoded:', decoded); // Temporary log
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth error:', error); // Temporary log
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 