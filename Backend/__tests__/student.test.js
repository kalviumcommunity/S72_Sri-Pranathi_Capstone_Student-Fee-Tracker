const mongoose = require('mongoose');
const Student = require('../models/Student');

describe('Student Model Test', () => {
    // Clear the database between tests
    beforeEach(async () => {
        await Student.deleteMany();
    });

    // Test 1: Valid student data
    test('create & save student successfully', async () => {
        const validStudent = new Student({
            firstName: "John",
            lastName: "Smith",
            college: "Alliance University",
            transactionId: "TR123456789",
            feePaid: "Yes",
            semFee: "Yes",
            uploadDate: "21/04/2024",
            dateOfPayment: "20/04/2024",
            gender: "Male",
            fees: 350000,
            year: 2024,
            withdrawal: "Confirmed"
        });
        const savedStudent = await validStudent.save();
        
        expect(savedStudent._id).toBeDefined();
        expect(savedStudent.firstName).toBe(validStudent.firstName);
        expect(savedStudent.transactionId).toBe(validStudent.transactionId);
    });

    // Test 2: Required field validation
    test('should fail to save student without required fields', async () => {
        const studentWithoutRequiredField = new Student({
            firstName: "John"
            // missing other required fields
        });

        let err;
        try {
            await studentWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    // Test 3: Enum field validation
    test('should fail for invalid withdrawal status', async () => {
        const studentWithInvalidWithdrawal = new Student({
            firstName: "John",
            lastName: "Smith",
            college: "Alliance University",
            transactionId: "TR123456790",
            feePaid: "Yes",
            semFee: "Yes",
            uploadDate: "21/04/2024",
            dateOfPayment: "20/04/2024",
            withdrawal: "Invalid" // Invalid value
        });

        // Validate the document without saving
        const validationError = studentWithInvalidWithdrawal.validateSync();
        expect(validationError).toBeDefined();
        expect(validationError.errors.withdrawal).toBeDefined();
        expect(validationError.errors.withdrawal.kind).toBe('enum');
    });

    // Test 4: Unique field validation
    test('should fail for duplicate transactionId', async () => {
        // First student
        const student1 = new Student({
            firstName: "John",
            lastName: "Smith",
            college: "Alliance University",
            transactionId: "TR123456789",
            feePaid: "Yes",
            semFee: "Yes",
            uploadDate: "21/04/2024",
            dateOfPayment: "20/04/2024"
        });
        await student1.save();

        // Second student with same transactionId
        const student2 = new Student({
            firstName: "Jane",
            lastName: "Doe",
            college: "Alliance University",
            transactionId: "TR123456789", // Duplicate
            feePaid: "Yes",
            semFee: "Yes",
            uploadDate: "21/04/2024",
            dateOfPayment: "20/04/2024"
        });

        let err;
        try {
            await student2.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe(11000); // MongoDB duplicate key error code
    });

    // Test 5: Fee validation
    test('should handle numeric fee value correctly', async () => {
        const student = new Student({
            firstName: "John",
            lastName: "Smith",
            college: "Alliance University",
            transactionId: "TR123456791",
            feePaid: "Yes",
            semFee: "Yes",
            uploadDate: "21/04/2024",
            dateOfPayment: "20/04/2024",
            fees: 350000
        });

        const savedStudent = await student.save();
        expect(savedStudent.fees).toBe(350000);
        expect(typeof savedStudent.fees).toBe('number');
    });
}); 