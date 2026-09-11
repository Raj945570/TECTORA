require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const { protectPage, guestOnlyPage } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// 1. Static Assets (Publicly accessible: styles, scripts, images, icons)
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));
app.use('/styles', express.static(path.join(PUBLIC_DIR, 'styles')));
app.use('/scripts', express.static(path.join(PUBLIC_DIR, 'scripts')));

// 2. Authentication API Routes
app.use('/api/auth', authRoutes);

// 3. Guest-Only Pages (Login and Signup)
// If already logged in, redirect to homepage
app.get(['/login.html', '/pages/auth/login.html'], guestOnlyPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.get(['/signup.html', '/pages/auth/signup.html'], guestOnlyPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'signup.html'));
});

// 4. Convenience Routes for Services & Subpages (Protected)
// Allows direct access via /services.html as well as /pages/services.html
app.get(['/services.html', '/pages/services.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'services.html'));
});

// Subpage direct routes
app.get(['/materials.html', '/pages/services/materials.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'services', 'materials.html'));
});

app.get(['/commercial.html', '/pages/services/commercial.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'services', 'commercial.html'));
});

app.get(['/contractors.html', '/pages/services/contractors.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'services', 'contractors.html'));
});

app.get(['/eco.html', '/pages/services/eco.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'services', 'eco.html'));
});

app.get(['/interior.html', '/pages/interior.html', '/pages/services/interior.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'interior.html'));
});

app.get(['/enquiry.html', '/pages/enquiry/enquiry.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'enquiry', 'enquiry.html'));
});

app.get(['/project-management.html', '/pages/project/project-management.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'pages', 'project', 'project-management.html'));
});

// 5. Main Homepage (Strictly Protected)
// If user has no valid session, protectPage redirects them to /login.html
app.get(['/', '/index.html'], protectPage, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// 6. Any other HTML or static file under public (with auth protection on HTML)
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    return protectPage(req, res, () => {
      res.sendFile(path.join(PUBLIC_DIR, req.path), (err) => {
        if (err) next();
      });
    });
  }
  next();
});

// General static serving for any other assets
app.use(express.static(PUBLIC_DIR));

// 404 Fallback: Redirect unauthenticated to login, or authenticated to index
app.use((req, res) => {
  if (req.accepts('html')) {
    res.redirect('/');
  } else {
    res.status(404).json({ success: false, message: 'Resource not found' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[TECTORA] Server running at http://localhost:${PORT}`);
  console.log(`[TECTORA] Protected routes: /index.html, /materials.html, /commercial.html, etc.`);
  console.log(`[TECTORA] Auth routes: /login.html, /signup.html, /api/auth/*`);
});
