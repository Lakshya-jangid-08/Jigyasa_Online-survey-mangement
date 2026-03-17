/**
 * Caching middleware - ensures API responses are never cached
 * This is critical for Vercel serverless deployments
 */
const noCacheMiddleware = (req, res, next) => {
  // Set cache-control headers
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('ETag', ''); // Clear ETag to prevent 304 responses
  
  next();
};

module.exports = noCacheMiddleware;
