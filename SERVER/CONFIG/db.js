const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // Enable mongoose debug mode based on config
    mongoose.set('debug', config.db.debug);
    
    const conn = await mongoose.connect(config.db.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
