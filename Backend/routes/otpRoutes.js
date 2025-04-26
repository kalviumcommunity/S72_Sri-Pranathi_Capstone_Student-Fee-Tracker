const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initialize login and send OTP
router.post('/login-init', async (req, res) => {
  try {
    const { "Email id": email, Password: password } = req.body;

    // Find user by email
    const user = await User.findOne({ "Email id": email });
    
    if (!user || user.Password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with email (with 5 minutes expiry)
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // In a real application, send OTP via email
    console.log(`OTP for ${email}: ${otp}`); // For testing purposes

    res.json({ 
      success: true,
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Login init error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOTPData = otpStore.get(email);
    
    if (!storedOTPData) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired or not found' 
      });
    }

    if (Date.now() > storedOTPData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired' 
      });
    }

    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP' 
      });
    }

    // OTP is valid, find user and generate token
    const user = await User.findOne({ "Email id": email });
    
    const token = jwt.sign(
      { 
        userId: user._id,
        admin: user.Admins,
        email: user["Email id"]
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Clear the used OTP
    otpStore.delete(email);

    res.json({
      success: true,
      token,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate new OTP
    const otp = generateOTP();
    
    // Store new OTP
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // In a real application, send OTP via email
    console.log(`New OTP for ${email}: ${otp}`); // For testing purposes

    res.json({ 
      success: true,
      message: 'OTP resent successfully' 
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

module.exports = router; 