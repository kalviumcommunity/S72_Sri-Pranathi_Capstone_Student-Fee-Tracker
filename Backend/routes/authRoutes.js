const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            role: 'admin' // You can modify this based on your needs
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { "Email id": email, Password: password } = req.body;

        // Find user by email
        const user = await User.findOne({ "Email id": email });
        
        if (!user || user.Password !== password) {
            return res.status(401).json({ message: 'Access denied' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                admin: user.Admins,
                email: user["Email id"]
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                email: user["Email id"],
                admin: user.Admins
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Access denied' });
    }
});

// Temporary route to create admin user (remove this in production)
router.post('/create-admin', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Creating admin user with:', { email, password });

        // Check if user already exists
        const existingUser = await User.findOne({ "Email id": email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new admin user
        const user = new User({
            "Email id": email,
            Password: password,
            Admins: true
        });

        await user.save();
        console.log('Admin user created successfully');
        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).json({ message: 'Error creating admin user', error: error.message });
    }
});

// Helper function to generate a hashed password (use this in Node REPL to generate passwords)
// async function hashPassword(password) {
//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(password, salt);
//   console.log('Hashed password:', hash);
//   return hash;
// }
// hashPassword('password123');

module.exports = router; 