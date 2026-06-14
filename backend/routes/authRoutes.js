const express = require('express');
const router = express.Router();
const passport = require('passport'); // <-- MISSING LINE 1
const jwt = require('jsonwebtoken');  // <-- MISSING LINE 2
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');

// Route: POST /api/auth/register
router.post('/register', registerUser);

// Route: POST /api/auth/login
router.post('/login', loginUser);

// Route: POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// Route: POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

const { updateSettings } = require('../controllers/authController');
// Route: PUT /api/auth/settings
router.put('/settings', updateSettings);

// 1. The Google Trigger Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. The callback route where Google returns the data
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: process.env.CLIENT_URL}),
  (req, res) => {
    // Generate our JWT token using the user object Passport attached to req
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Redirect back to the React frontend, passing the token and email in the URL
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  }
);

const User = require('../models/User');

// 3. Get current user profile from token
router.get('/me', async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token failed' });
  }
});
console.log("CLIENT_URL =", process.env.CLIENT_URL);
console.log("🚨🚨🚨 AUTH ROUTES FILE IS LOADING! 🚨🚨🚨");

module.exports = router;