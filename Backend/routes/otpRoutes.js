const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initialize login and send OTP
router.post('/login-init', async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { "Email id": email, password } = req.body;

    // Find user by exact email
    const user = await User.findOne({ "Email id": email }).lean();
    console.log('Found user data:', JSON.stringify(user, null, 2));
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create a new user instance for OTP operations
    const userInstance = new User({
      "Email id": user["Email id"],
      Password: user.Password,
      Admins: false, // Set a default boolean value
      isPasswordHashed: user.isPasswordHashed
    });

    // Verify password using the model's method
    const isPasswordValid = await userInstance.comparePassword(password);
    console.log('Password validation:', { isValid: isPasswordValid });

    if (!isPasswordValid) {
      console.log('Password mismatch');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate OTP and store it
    const otp = generateOTP();
    userInstance.tempOTP = {
      code: otp,
      expiry: Date.now() + 300000 // 5 minutes
    };

    // Save only the OTP update
    await User.updateOne(
      { "Email id": email },
      { $set: { tempOTP: userInstance.tempOTP } }
    );

    console.log('Generated OTP:', otp);

    res.json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp // Remove in production
    });

  } catch (error) {
    console.error('Login init error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      details: error.message
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { "Email id": email, otp } = req.body;
    console.log('Verifying OTP request:', { email, otp });

    // Find user and check OTP
    const user = await User.findOne({ "Email id": email }).lean();
    console.log('Found user for verification:', {
      email: user?.["Email id"],
      hasOTP: !!user?.tempOTP,
      storedOTP: user?.tempOTP?.code,
      expiry: user?.tempOTP?.expiry ? new Date(user.tempOTP.expiry) : null
    });
    
    if (!user || !user.tempOTP) {
      console.log('No OTP found for user');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check expiry
    if (Date.now() > user.tempOTP.expiry) {
      console.log('OTP expired:', {
        now: new Date(),
        expiry: new Date(user.tempOTP.expiry)
      });
      
      // Clear expired OTP
      await User.updateOne(
        { "Email id": email },
        { $unset: { tempOTP: "" } }
      );
      
      return res.status(401).json({
        success: false,
        message: 'OTP expired'
      });
    }

    // Verify OTP
    console.log('Comparing OTPs:', {
      received: otp,
      stored: user.tempOTP.code,
      match: user.tempOTP.code === otp
    });

    if (user.tempOTP.code !== otp) {
      console.log('OTP mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        admin: user.Admins || false,
        email: user["Email id"]
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Clear the OTP
    await User.updateOne(
      { "Email id": email },
      { $unset: { tempOTP: "" } }
    );

    console.log('OTP verified successfully');

    res.json({
      success: true,
      token,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router; 