const mongoose = require('mongoose');

// Use a global variable to cache the database connection
let cachedConnection = null;

const connectDB = async () => {
    if (process.env.NODE_ENV === 'test') return null;

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing in environment variables');
        return null;
    }

    // Reuse existing connection if available
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Do not crash the process in serverless
        return null;
    }
};

module.exports = connectDB;
