/**
 * Application configuration
 * Centralizes environment variable access with defaults
 */

require('dotenv').config();

const config = {
  // Server settings
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX,
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  
  // Database settings
  db: {
    uri: process.env.MONGODB_URI,
    debug: process.env.MONGODB_DEBUG === 'true',
  },
  
  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'its_your_choice_default_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Helper method to check if in production
  isProd: () => process.env.NODE_ENV === 'production',

  // Helper method to check if in development
  isDev: () => process.env.NODE_ENV === 'development',
};

// Log config on startup (for debugging)
if (config.isDev()) {
  console.log('Configuration loaded:');
  console.log('- Port:', config.server.port);
  console.log('- Environment:', config.server.env);
  console.log('- JWT Secret:', config.jwt.secret ? '✓ Set' : '✗ Not set');
  console.log('- Database URI:', config.db.uri ? '✓ Set' : '✗ Not set');
}

module.exports = config;
