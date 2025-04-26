const request = require('supertest');
const express = require('express');
const studentRoutes = require('../routes/studentRoutes');
const Student = require('../models/Student');

const app = express();
app.use(express.json());
app.use('/students', studentRoutes);

describe('Student API Tests', () => {
    beforeEach(async () => {
        await Student.deleteMany();
    });

    // Test 1: GET all students
    test('GET /students/all should return all students', async () => {
        // Create test students
        await Student.create([
            {
                firstName: "John",
                lastName: "Smith",
                college: "Alliance University",
                transactionId: "TR123456789",
                feePaid: "Yes",
                semFee: "Yes",
                uploadDate: "21/04/2024",
                dateOfPayment: "20/04/2024"
            },
            {
                firstName: "Jane",
                lastName: "Doe",
                college: "Alliance University",
                transactionId: "TR123456790",
                feePaid: "Yes",
                semFee: "No",
                uploadDate: "21/04/2024",
                dateOfPayment: "20/04/2024"
            }
        ]);

        const response = await request(app).get('/students/all');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(2);
    });

    // Test 2: POST new student
    test('POST /students should create a new student', async () => {
        const newStudent = {
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
        };

        const response = await request(app)
            .post('/students')
            .send(newStudent);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Student added successfully');
        expect(response.body.student.firstName).toBe(newStudent.firstName);
    });

    // Test 3: POST validation error
    test('POST /students should return 400 for invalid data', async () => {
        const invalidStudent = {
            firstName: "John"
            // Missing required fields
        };

        const response = await request(app)
            .post('/students')
            .send(invalidStudent);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    // Test 4: GET students by college
    test('GET /students/college/:college should return college students', async () => {
        // Create test student
        await Student.create({
            firstName: "John",
            lastName: "Smith",
            college: "Alliance University",
            transactionId: "TR123456789",
            feePaid: "Yes",
            semFee: "Yes",
            uploadDate: "21/04/2024",
            dateOfPayment: "20/04/2024"
        });

        const response = await request(app)
            .get('/students/college/Alliance');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].college).toBe("Alliance University");
    });

    // Test 5: GET student count
    test('GET /students/count should return total count', async () => {
        // Create test students
        await Student.create([
            {
                firstName: "John",
                lastName: "Smith",
                college: "Alliance University",
                transactionId: "TR123456789",
                feePaid: "Yes",
                semFee: "Yes",
                uploadDate: "21/04/2024",
                dateOfPayment: "20/04/2024"
            },
            {
                firstName: "Jane",
                lastName: "Doe",
                college: "Alliance University",
                transactionId: "TR123456790",
                feePaid: "Yes",
                semFee: "No",
                uploadDate: "21/04/2024",
                dateOfPayment: "20/04/2024"
            }
        ]);

        const response = await request(app).get('/students/count');
        expect(response.status).toBe(200);
        expect(response.body.count).toBe(2);
    });
}); 