// Load Vercel-specific configuration first
if (process.env.VERCEL) {
  require('./vercel.config');
}

const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./CONFIG/config');
const connectDB = require('./CONFIG/db');
const { notFound, errorHandler } = require('./MIDDLEWARE/errorMiddleware');
const requestLogger = require('./MIDDLEWARE/requestLogger');

const app = express();

// Track database connection status
let dbConnected = false;

// Attempt database connection but don't block server startup
connectDB()
  .then(connection => {
    if (connection) {
      dbConnected = true;
      console.log('Database connection established');
    } else {
      console.log('Server running without database connection');
    }
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

// Request logger middleware
app.use(requestLogger);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware with configuration from config
app.use(cors({
  origin: config.server.corsOrigin || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'PUBLIC')));

// Simple database middleware to check DB status
const checkDbMiddleware = (req, res, next) => {
  if (!dbConnected && req.path.startsWith('/api/') && req.path !== '/api/health') {
    return res.status(503).json({ 
      error: 'Database connection not available',
      message: 'The server is running but cannot connect to the database. Please check your database configuration.'
    });
  }
  next();
};

app.use(checkDbMiddleware);

// Explicit root route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'PUBLIC', 'index.html'));
});

// Debug endpoint to check server status
app.get('/debug', (req, res) => {
  res.status(200).json({
    status: 'running',
    environment: process.env.NODE_ENV || 'not set',
    databaseConnected: dbConnected,
    config: {
      corsOrigin: config.server.corsOrigin || '*',
      port: config.server.port || 'not set',
      dbUri: config.db.uri ? 'set' : 'not set'
    }
  });
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    databaseConnected: dbConnected
  });
});

// Define routes
app.use('/api/auth', require('./ROUTES/Auth.route'));
app.use('/api/organizations', require('./ROUTES/Organization.route'));
app.use('/api/surveys', require('./ROUTES/SureveyManagment.route'));
app.use('/api/survey-responses', require('./ROUTES/ServeyResponse.route'));
app.use('/api/data-analysis', require('./ROUTES/DataAnalysis.route'));
app.use('/api/api', require('./ROUTES/ApiCompatibility.route')); // Added for frontend compatibility

// Serve static files from uploads folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Set port from config or default to 3000 for Vercel
const PORT = process.env.PORT || config.server.port || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Log error but don't exit the process on Vercel
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  // Log error but don't exit the process on Vercel
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
