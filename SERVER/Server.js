const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./CONFIG/config');
const connectDB = require('./CONFIG/db');
const { notFound, errorHandler } = require('./MIDDLEWARE/errorMiddleware');

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware with configuration from config
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'PUBLIC')));

// Define routes
app.use('/api/auth', require('./ROUTES/Auth.route'));
app.use('/api/organizations', require('./ROUTES/Organization.route'));
app.use('/api/surveys', require('./ROUTES/SureveyManagment.route'));
app.use('/api/survey-responses', require('./ROUTES/ServeyResponse.route'));
app.use('/api/data-analysis', require('./ROUTES/DataAnalysis.route'));
app.use('/api/api', require('./ROUTES/ApiCompatibility.route')); // Added for frontend compatibility

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Set port from config or default to 3000 for Vercel
const PORT = process.env.PORT || config.server.port || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
});

// Add a health check route that Vercel can use
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API server is running' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
