// This is a special configuration to make development easier
// It provides fallbacks for when environment variables are not set

// Load environment variables from .env file if it exists
require('dotenv').config();

// Override config.js with fallbacks specifically for Vercel
process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.API_PREFIX = process.env.API_PREFIX || '/api';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// MongoDB fallback - this will only be used if MONGODB_URI is not set in environment variables
if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not found in environment. Database functionality will be limited.');
  // We don't set a fallback URI because the updated connectDB will handle this case
}

// Ensure JWT secret exists
if (!process.env.JWT_SECRET) {
  // For development only - don't use this in production
  process.env.JWT_SECRET = 'vercel-temporary-dev-secret-' + Date.now();
  console.warn('JWT_SECRET not found in environment. Using temporary secret.');
}

// Expire tokens in 1 day by default
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

console.log('Server environment:', process.env.NODE_ENV);
