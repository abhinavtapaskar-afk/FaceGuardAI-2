const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🛡️  FaceGuard AI Backend Server');
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
  console.log('📋 Available Endpoints:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/profile');
  console.log('   POST   /api/scans/analyze');
  console.log('   GET    /api/scans/history');
  console.log('   GET    /api/scans/progress/report');
  console.log('   GET    /api/leaderboard');
  console.log('   GET    /api/subscriptions/plans');
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
