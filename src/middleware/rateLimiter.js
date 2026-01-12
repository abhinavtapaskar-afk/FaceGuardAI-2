const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Authentication Routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  }
});

/**
 * Scan Rate Limiter
 */
const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 scans per minute max
  message: {
    success: false,
    error: 'Too many scan requests. Please wait a moment before trying again.'
  }
});

/**
 * Upload Rate Limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'Too many upload requests. Please slow down.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  scanLimiter,
  uploadLimiter
};
