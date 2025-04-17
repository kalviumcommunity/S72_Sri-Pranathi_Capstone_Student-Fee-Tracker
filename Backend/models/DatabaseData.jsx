const mongoose = require('mongoose');

const databaseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'database_data' });

const DatabaseData = mongoose.model('DatabaseData', databaseSchema);

module.exports = DatabaseData; 