const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    "Email id": {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Admins: {
        type: String,
        required: true
    }
}, { collection: 'Admin Users' });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // For plain text password comparison
        return this.Password === candidatePassword;
    } catch (error) {
        console.error('Password comparison error:', error);
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;