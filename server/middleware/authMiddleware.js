const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tectora_secure_jwt_token_secret_key_prod_2026_x89f';

// Helper to extract token from cookie or Authorization header
const extractToken = (req) => {
  if (req.cookies && req.cookies.tectora_jwt) {
    return req.cookies.tectora_jwt;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Middleware: Protect API endpoints (returns 401 JSON)
const protectApi = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or user not found. Please log in again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
};

// Middleware: Strict Page Gatekeeper (redirects unauthenticated users to /login.html)
const protectPage = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    const redirectUrl = encodeURIComponent(req.originalUrl || '/index.html');
    return res.redirect(`/login.html?redirect=${redirectUrl}`);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.clearCookie('tectora_jwt');
      return res.redirect('/login.html');
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('tectora_jwt');
    const redirectUrl = encodeURIComponent(req.originalUrl || '/index.html');
    return res.redirect(`/login.html?redirect=${redirectUrl}`);
  }
};

// Middleware: Guest-only pages (redirects logged-in users away from /login.html and /signup.html to /index.html)
const guestOnlyPage = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      const destination = req.query.redirect || '/index.html';
      return res.redirect(destination);
    }
    next();
  } catch (error) {
    // If token is invalid, let them view guest pages
    res.clearCookie('tectora_jwt');
    next();
  }
};

module.exports = {
  extractToken,
  protectApi,
  protectPage,
  guestOnlyPage
};
