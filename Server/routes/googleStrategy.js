const e = require('express')
const router = e.Router()
const passport = require('passport');


router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'consent' })
);

// Google Auth Callback
router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login-failed',
        successRedirect: 'https://vtu-network.onrender.com/api/user/register',
    })
);

module.exports = router