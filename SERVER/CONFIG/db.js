const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    if (!config.db.uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // CRITICAL: Connection options to prevent timeout errors
    const mongooseOptions = {
      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Timeout settings (in milliseconds)
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Retry logic
      retryWrites: true,
      retryReads: true,
      
      // Buffer timeout prevention
      bufferCommands: false,
      
      // Other options
      ssl: true,
      family: 4,
      authSource: 'admin'
    };

    const connect = await mongoose.connect(config.db.uri, mongooseOptions);
    
    console.log('✓ MongoDB connected successfully');]
    
    return connect;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error('Fix: Check MONGODB_URI in .env file');
    return null;
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

module.exports = connectDB;
