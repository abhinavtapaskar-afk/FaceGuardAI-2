const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// This handles the main URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Mock Scan Route for your button
app.post('/api/scans/analyze', (req, res) => {
    res.json({ 
        success: true, 
        glowScore: 85,
        skinType: "Normal",
        concerns: ["None"]
    });
});

module.exports = app;
