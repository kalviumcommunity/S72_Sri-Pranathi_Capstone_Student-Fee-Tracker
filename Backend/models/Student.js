const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    uploadDate: String, // Consider using Date type if format changes
    dateOfPayment: String, // Consider using Date type if needed
    transactionId: String,
    firstName: String,
    lastName: String,
    college: String,
    feePaid: String, // Keeping as String for the 10K fee
    semFee: Boolean, // Changed to Boolean for proper representation
    gender: String,
    fees: Number, // New field for total semester fee
    year: Number,
    withdrawal: String // Consider converting to Boolean if needed
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
