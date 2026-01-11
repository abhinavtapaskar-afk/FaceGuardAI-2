const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/scans', require('./api/routes/scanRoutes'));
app.use('/api/community', require('./api/routes/ecosystemRoutes'));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date(), mode: process.env.TEST_MODE === 'true' ? 'MOCK' : 'LIVE' });
});

// Import Routes (To be created in Drop 2)
// app.use('/api/auth', require('./api/routes/authRoutes'));
// app.use('/api/scans', require('./api/routes/scanRoutes'));

// Export for Vercel
module.exports = app;

// Local Development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 FaceGuard AI Core running on port ${PORT}`));
}


