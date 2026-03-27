const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./CONFIG/config');
const connectDB = require('./CONFIG/db');
const { notFound, errorHandler } = require('./MIDDLEWARE/errorMiddleware');
const requestLogger = require('./MIDDLEWARE/requestLogger');
const noCacheMiddleware = require('./MIDDLEWARE/noCacheMiddleware');

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

// Add no-cache headers for API endpoints (fixes Vercel caching issue)
app.use('/api', noCacheMiddleware);

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

// Export app for Vercel serverless
module.exports = app;

// For local development, run the server
if (require.main === module) {
  const startServer = async () => {
    try {
      // CRITICAL: Wait for database connection before starting server
      console.log('⏳ Connecting to MongoDB...');
      await connectDB();
      
      const PORT = process.env.PORT || config.server.port || 3000;
      app.listen(PORT, () => {
        console.log(`\n✓ Server running in ${config.server.env} mode on port ${PORT}`);
        console.log(`✓ Ready to accept requests\n`);
      });
    } catch (error) {
      console.error('✗ Failed to start server:', error.message);
      process.exit(1);
    }
  };

  startServer();
}