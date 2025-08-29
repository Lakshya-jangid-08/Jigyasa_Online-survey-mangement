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

// Request logger middleware
app.use(requestLogger);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS middleware
app.use(cors({
  origin: config.server.corsOrigin || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'PUBLIC')));

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.status(200).json({
    status: 'running',
    environment: process.env.NODE_ENV || 'not set',
    vercel: !!process.env.VERCEL,
    config: {
      corsOrigin: config.server.corsOrigin || '*',
      port: config.server.port || 'not set'
    }
  });
});

// Explicit root route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'PUBLIC', 'index.html'));
});

// Define routes
app.use('/api/auth', require('./ROUTES/Auth.route'));
app.use('/api/organizations', require('./ROUTES/Organization.route'));
app.use('/api/surveys', require('./ROUTES/SureveyManagment.route'));
app.use('/api/survey-responses', require('./ROUTES/ServeyResponse.route'));
app.use('/api/data-analysis', require('./ROUTES/DataAnalysis.route'));
app.use('/api/api', require('./ROUTES/ApiCompatibility.route'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Vercel serverless function export
module.exports = app;

// Only start server if not in Vercel environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || config.server.port || 3000;
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
  });

  // Start server only if not on Vercel
  app.listen(PORT, () => {
    console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
  });
}