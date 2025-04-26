const mongoose = require('mongoose');

jest.setTimeout(10000); // Increase timeout to 10 seconds

// Disable watchers during tests
jest.mock('../watcher', () => ({
    getLastModifiedTime: jest.fn()
}));

// Mock environment variables
process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
process.env.NODE_ENV = 'test';

// Connect to MongoDB before all tests
beforeAll(async () => {
    try {
        // Close any existing connections
        await mongoose.disconnect();
        
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    } catch (error) {
        console.error('Error connecting to the test database:', error);
        process.exit(1);
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error cleaning up test database:', error);
    }
}); 