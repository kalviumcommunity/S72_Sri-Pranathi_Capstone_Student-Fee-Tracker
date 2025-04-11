require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes'); // Importing routes

const app = express();
app.use(express.json());
app.use(cors()); // Enables CORS for frontend requests

// **MongoDB Connection (Merged from db.js)**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Your MongoDB is connected successfully!'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
});

// **Use Student Routes**
app.use('/students', studentRoutes);

// **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
