const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

    if (req.isAuthenticated && req.isAuthenticated()) {
        req.userInfo = req.user
        return next();
    }
    const authToken = req.cookies['userToken'];
    if (!authToken) {
        return res.status(401).json({
            message: "Access denied. No token provided. Please login to continue.",
            success: false,
            isAuthenticated: false
        });
    }
    try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
        // Set user info from token
        req.userName = decodedToken.username,
            req.userData = decodedToken
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Access denied. Invalid or expired token. Please login again.",
            success: false,
            isAuthenticated: false
        });
    }
};

module.exports = authMiddleware;