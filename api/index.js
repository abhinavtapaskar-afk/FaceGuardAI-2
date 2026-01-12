// Vercel Serverless Function Entry Point
// This file is the entry point for all API requests

// Load environment variables first
require('dotenv').config();

console.log('=== Vercel Function Starting ===');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Has JWT_SECRET:', !!process.env.JWT_SECRET);

let app;

try {
  console.log('Loading app.js...');
  app = require('../app');
  console.log('✅ App loaded successfully');
} catch (error) {
  console.error('❌ Failed to load app:', error);
  console.error('Error stack:', error.stack);
  
  // Create a minimal error handler
  const express = require('express');
  app = express();
  
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Failed to initialize application',
      details: error.message,
      stack: error.stack
    });
  });
}

module.exports = app;
