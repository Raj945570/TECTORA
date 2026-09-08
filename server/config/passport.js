const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // 1. Check if user already exists in MongoDB
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email: email }]
          });

          if (user) {
            // User exists: update googleId and avatar if needed
            if (!user.googleId) user.googleId = profile.id;
            if (profile.photos && profile.photos[0] && !user.avatar) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // 2. If user does NOT exist: create new user in MongoDB
          user = await User.create({
            fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User',
            email: email,
            phone: '',
            googleId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            authProvider: 'google',
            role: 'client'
          });

          return done(null, user);
        } catch (error) {
          console.error('[Passport Google] Error during authentication:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log('[TECTORA Auth] Passport Google OAuth 2.0 Strategy initialized.');
} else {
  console.log('[TECTORA Auth] Google OAuth credentials not found in .env; direct token/API handler active.');
}

module.exports = passport;
