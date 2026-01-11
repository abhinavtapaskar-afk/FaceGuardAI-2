const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// 2. The Main Website Route (This fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: white; min-height: 100vh;">
      <h1 style="color: #818cf8;">🛡️ FaceGuard AI is Online</h1>
      <p>The backend and frontend are now connected.</p>
      <a href="/index.html" style="color: #fbbf24; text-decoration: none; font-weight: bold;">Click here to open the Scanner</a>
    </div>
  `);
});

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// 4. Mock Scan Route (To test if your AI logic is ready)
app.post('/api/scans/analyze', (req, res) => {
    res.json({ 
        success: true, 
        message: "Backend received your image!",
        glowScore: 88,
        skinType: "Normal/Glowy"
    });
});

// 5. Export for Vercel (This is the most important line)
module.exports = app;
