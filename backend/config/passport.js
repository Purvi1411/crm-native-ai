const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://crm-native-ai-1.onrender.com/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists in our database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          return done(null, user);
        }

        // 2. If not, create a new user (with a dummy password since Google handles auth)
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: Date.now().toString(), // Random temporary password
        });

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);