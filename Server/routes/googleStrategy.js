const router = require('express').Router();
const passport = require('passport');

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: 'https://vtu-network.vercel.app/login',
        successRedirect: 'https://vtu-network.vercel.app'
    })
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.send('Logged out');
    });
});

module.exports = router;