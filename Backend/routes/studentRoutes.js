const express = require('express');
const Student = require('../models/Student');

const router = express.Router();


// GET all students
router.get('/all', async (req, res) => {
    try {
      const students = await Student.find();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

// **GET Admissions Data (Grouped by College)**
router.get("/admissions", async (req, res) => {
    try {
        const students = await Student.aggregate([
            { $group: { _id: "$College", count: { $sum: 1 } } }, // Count students per college
            { $sort: { count: -1 } } // Optional: Sort by highest admissions
        ]);

        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admission data" });
    }
});

router.get('/tenk-fees', async (req, res) => {
    try {
        const students = await Student.find({ "10K": { $exists: true } });
        res.json(students);
    } catch (error) {
        console.error("Error fetching 10K student fee records:", error);
        res.status(500).json({ error: "Failed to fetch 10K student fee records" });
    }
});


router.get("/sem-fee-paid", async (req, res) => {
    try {
        // First get all unique colleges
        const allColleges = await Student.distinct("College");
        
        // Then get counts for colleges with paid fees
        const paidColleges = await Student.aggregate([
            { $match: { "Sem Fee": { $regex: /^yes$/i } } },
            { $group: { _id: "$College", count: { $sum: 1 } } }
        ]);

        // Create a map of paid colleges
        const paidMap = {};
        paidColleges.forEach(college => {
            paidMap[college._id] = college.count;
        });

        // Create result with all colleges, including those with zero paid fees
        const result = allColleges.map(college => ({
            college: college,
            fees: paidMap[college] || 0
        }));

        res.json(result);
    } catch (error) {
        console.error("Error fetching sem fee records:", error);
        res.status(500).json({ error: "Failed to fetch sem fee records" });
    }
});


router.get("/girls", async (req, res) => {
    try {
        const girlsCount = await Student.aggregate([
            { 
                $match: { 
                    Gender: "Female" 
                } 
            },
            { 
                $group: { 
                    _id: "$College", 
                    count: { $sum: 1 } 
                } 
            },
            { 
                $project: { 
                    _id: 0, 
                    college: "$_id", 
                    count: 1 
                } 
            }
        ]);

        // Transform the data into the format expected by the frontend
        const result = {};
        girlsCount.forEach(item => {
            if (item.college) {
                result[item.college] = item.count;
            }
        });

        res.json(result);
    } catch (error) {
        console.error("Error fetching girls' records:", error);
        res.status(500).json({ error: "Failed to fetch girls' records" });
    }
});

// **POST - Add a New Student**
router.post('/', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add student' });
    }
});


module.exports = router;