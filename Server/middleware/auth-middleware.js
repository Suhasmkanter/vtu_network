const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // ---- 1. Check for Passport.js authentication (if used) ----
    // This line suggests you might be using Passport.js.
    // If Passport.js has already authenticated the request, 'req.user' will be populated.
    // However, 'req.isAuthenticated' is a method added by Passport.js,
    // so ensure it's available before calling it.
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        req.userInfo = req.user; // Use 'req.user' which Passport populates
        console.log("User authenticated via Passport.js:", req.userInfo); // For debugging
        return next();
    }

    // ---- 2. Extract token from cookies ----
    // Ensure you have 'cookie-parser' middleware set up in your main Express app
    const authToken = req.cookies && req.cookies['userToken']; // Safely access cookies

    if (!authToken) {
        // If no token in cookies, try checking Authorization header as a fallback/alternative
        // This is a common practice for APIs, especially when not relying solely on cookies
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const bearerToken = authHeader.split(' ')[1];
            if (bearerToken) {
                // If token found in header, use it instead of trying to send a 401 now
                // Proceed to try-catch block with this bearerToken
                // We'll rename authToken for clarity here
                req.authTokenSource = 'header'; // For debugging if needed
                return processToken(bearerToken, req, res, next);
            }
        }

        // If no token in cookies AND no valid bearer token in header
        return res.status(401).json({
            message: "Access denied. No token provided. Please login to continue.",
            success: false,
            isAuthenticated: false
        });
    }

    // If authToken was found in cookies, process it
    req.authTokenSource = 'cookie'; // For debugging if needed
    processToken(authToken, req, res, next);
};

// Helper function to encapsulate token verification logic
const processToken = (token, req, res, next) => {
    try {
        // Ensure process.env.JWT_SECRET_KEY is defined in your environment
        // and accessible in your Node.js application (e.g., using 'dotenv' package)
        if (!process.env.JWT_SECRET_KEY) {
            console.error('JWT_SECRET_KEY is not defined in environment variables.');
            return res.status(500).json({
                message: "Server error: JWT secret not configured.",
                success: false
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // ---- 3. Attach decoded user info to request object ----
        // Use a consistent property name for user data, e.g., 'req.user' or 'req.loggedInUser'
        // 'req.userName' and 'req.userData' are fine, but 'req.user' is common convention.
        req.user = decodedToken; // Assign the entire decoded payload
        // If you specifically need username:
        req.userName = decodedToken.username; // Assuming 'username' is in your token payload

        console.log("Token successfully verified. User:", req.user); // For debugging

        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        // ---- 4. Handle JWT verification errors ----
        console.error("JWT verification error:", error.message); // Log the specific error

        let errorMessage = "Access denied. Invalid or expired token. Please login again.";
        // You can add more specific messages based on error type if needed
        if (error.name === 'TokenExpiredError') {
            errorMessage = "Access denied. Your session has expired. Please log in again.";
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = "Access denied. Invalid token. Please log in again.";
        }

        return res.status(401).json({
            message: errorMessage,
            success: false,
            isAuthenticated: false // Explicitly state not authenticated
        });
    }
};

module.exports = authMiddleware;