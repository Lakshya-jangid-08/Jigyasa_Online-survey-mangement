const mongoose = require('mongoose');
const config = require('./config');

// Cache to store the connection for Vercel's serverless environment
let connectionCache = null;

const connectDB = async () => {
  try {
    // Return cached connection if already connected
    if (connectionCache) {
      return connectionCache;
    }

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
      
      // Allow command buffering during connection
      bufferCommands: true,
      
      // Other options
      ssl: true,
      family: 4,
      authSource: 'admin'
    };

    const connect = await mongoose.connect(config.db.uri, mongooseOptions);
    
    // Cache the connection for serverless environments
    connectionCache = connect;
    
    console.log('MongoDB connected successfully');
    
    return connect;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Fix: Check MONGODB_URI in .env file');
    // Don't throw, let the request handler deal with it
    return null;
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  connectionCache = null; // Clear cache on disconnect
});

mongoose.connection.on('error', (error) => {
  console.error('Mongoose connection error:', error.message);
  connectionCache = null; // Clear cache on error
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

module.exports = connectDB;
