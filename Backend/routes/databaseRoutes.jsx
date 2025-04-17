const express = require('express');
const router = express.Router();
const DatabaseData = require('../models/DatabaseData');

// Read: Get all items
router.get('/all', async (req, res) => {
    try {
        const items = await DatabaseData.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Error fetching items", error: error.message });
    }
});

// Read: Get a single item
router.get('/:id', async (req, res) => {
    try {
        const item = await DatabaseData.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Error fetching item", error: error.message });
    }
});

// Write: Create a new item
router.post('/create', async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const newItem = new DatabaseData({
            title,
            description,
            status: status || 'Pending'
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: "Error creating item", error: error.message });
    }
});

module.exports = router; 