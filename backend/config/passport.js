const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { query, get, run } = require('./database-production');
const jwt = require('jsonwebtoken');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  try {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const business_name = profile.displayName || email.split('@')[0];
        
        // Check if user exists
        let user = await get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user) {
          // User exists, update OAuth info
          await run(
            'UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?',
            ['google', profile.id, user.id]
          );
        } else {
          // Create new user
          const result = await run(
            `INSERT INTO users (email, password, business_name, oauth_provider, oauth_id, created_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [email, 'oauth-google', business_name, 'google', profile.id]
          );
          
          user = await get('SELECT * FROM users WHERE id = ?', [result.id]);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }));
    console.log('✓ Google OAuth configured');
  } catch (error) {
    console.error('Failed to configure Google OAuth:', error.message);
  }
} else {
  console.log('⚠ Google OAuth not configured (missing credentials)');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  try {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
        const business_name = profile.displayName || profile.username || email.split('@')[0];
        
        // Check if user exists
        let user = await get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user) {
          // User exists, update OAuth info
          await run(
            'UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?',
            ['github', profile.id, user.id]
          );
        } else {
          // Create new user
          const result = await run(
            `INSERT INTO users (email, password, business_name, oauth_provider, oauth_id, created_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [email, 'oauth-github', business_name, 'github', profile.id]
          );
          
          user = await get('SELECT * FROM users WHERE id = ?', [result.id]);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        return done(error, null);
      }
    }));
    console.log('✓ GitHub OAuth configured');
  } catch (error) {
    console.error('Failed to configure GitHub OAuth:', error.message);
  }
} else {
  console.log('⚠ GitHub OAuth not configured (missing credentials)');
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  try {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5001/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;
        const business_name = profile.displayName || email.split('@')[0];
        
        // Check if user exists
        let user = await get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (user) {
          // User exists, update OAuth info
          await run(
            'UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?',
            ['facebook', profile.id, user.id]
          );
        } else {
          // Create new user
          const result = await run(
            `INSERT INTO users (email, password, business_name, oauth_provider, oauth_id, created_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [email, 'oauth-facebook', business_name, 'facebook', profile.id]
          );
          
          user = await get('SELECT * FROM users WHERE id = ?', [result.id]);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Facebook OAuth error:', error);
        return done(error, null);
      }
    }));
    console.log('✓ Facebook OAuth configured');
  } catch (error) {
    console.error('Failed to configure Facebook OAuth:', error.message);
  }
} else {
  console.log('⚠ Facebook OAuth not configured (missing credentials)');
}

module.exports = passport;
