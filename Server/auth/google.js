const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://vtu-network.onrender.com/api/user/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    // TODO: Replace with DB logic to create or find a user

    let data = await User.findOne({ email: profile.emails[0].value })
    if (data) {
        done(null, profile)
    } else {
        try {
            let response = await User.create({
                username: profile.displayName,
                password: 'googlebro',
                image: profile.photos[0].value,
                email: profile.emails[0].value,
                googleId: profile.id

            })
            const data = await response.save()
            return done(null, profile);

        } catch (error) {
            console.log(error)
        }

    }
}));

passport.serializeUser((user, done) => {
    console.log('Uservalues', user)
    done(null, user._json.email);
});

passport.deserializeUser(async (email, done) => {
    try {
        let user = await User.findOne({ email: email })

        if (user) {
            done(null, user);
        }
    } catch (error) {
        console.log(error)
    }
});