const mongoose = require('mongoose');
const config = require('./config');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.db.uri);

    isConnected = conn.connections[0].readyState === 1;

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error; 
  }
};

module.exports = connectDB;