const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import middleware
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/api/routes/authRoutes');
const scanRoutes = require('./src/api/routes/scanRoutes');
const leaderboardRoutes = require('./src/api/routes/leaderboardRoutes');
const subscriptionRoutes = require('./src/api/routes/subscriptionRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'FaceGuard AI Backend is Online',
    version: '2.0.0',
    model: 'gemini-1.5-flash',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Legal routes
app.get('/api/legal/privacy', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Privacy Policy',
      content: `
# Privacy Policy for FaceGuard AI

Last updated: ${new Date().toLocaleDateString()}

## Information We Collect

### 1. Account Information
- Email address
- Display name
- Profile photo (optional)

### 2. Skin Analysis Data
- Uploaded images (processed but not permanently stored)
- Analysis results
- Progress tracking data
- Routine recommendations

### 3. Usage Data
- Scan history
- Feature usage
- Device information
- IP address (for security)

## How We Use Your Information

1. **Provide Services**: Analyze skin, generate recommendations
2. **Improve AI**: Enhance analysis accuracy (anonymized data only)
3. **Communication**: Send important updates and notifications
4. **Security**: Prevent fraud and abuse

## Data Storage and Security

- Images are processed in real-time and NOT permanently stored
- Analysis results stored securely in Firebase
- All data encrypted in transit (HTTPS)
- Regular security audits

## Your Rights

- Access your data
- Delete your account and data
- Opt-out of leaderboard
- Export your data

## Third-Party Services

- Google Gemini AI (image analysis)
- Firebase (data storage)
- Razorpay (payments)

## Contact

For privacy concerns: privacy@faceguardai.com

## Changes to Policy

We will notify users of significant changes via email.
      `
    }
  });
});

app.get('/api/legal/terms', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Terms of Use',
      content: `
# Terms of Use for FaceGuard AI

Last updated: ${new Date().toLocaleDateString()}

## Acceptance of Terms

By using FaceGuard AI, you agree to these terms.

## Service Description

FaceGuard AI provides AI-powered skin analysis and personalized skincare recommendations for educational purposes only.

## User Responsibilities

1. **Accurate Information**: Provide accurate account information
2. **Appropriate Use**: Use service for personal skincare education only
3. **No Medical Reliance**: Do not use as substitute for professional medical advice
4. **Age Requirement**: Must be 18+ or have parental consent

## Medical Disclaimer

⚠️ **IMPORTANT**: FaceGuard AI is NOT a medical device or diagnostic tool.

- Analysis is for educational purposes only
- Always consult a dermatologist for medical concerns
- Do not rely solely on AI recommendations
- Patch test all new products
- Stop use if irritation occurs

## Subscription Terms

### Free Tier
- 1 scan per week
- Basic features
- Can upgrade anytime

### Premium Tier
- 1 scan per day
- Full features
- Monthly or yearly billing
- Cancel anytime (access until period end)

## Intellectual Property

- FaceGuard AI owns all platform content
- You retain rights to your uploaded images
- We have license to process images for analysis

## Limitation of Liability

FaceGuard AI is not liable for:
- Skin reactions to recommended products
- Inaccurate AI analysis
- Third-party product issues
- Service interruptions

## Termination

We may terminate accounts for:
- Terms violation
- Fraudulent activity
- Abuse of service

## Changes to Terms

We reserve the right to modify terms. Continued use constitutes acceptance.

## Contact

For questions: support@faceguardai.com
      `
    }
  });
});

app.get('/api/legal/disclaimer', (req, res) => {
  const { MEDICAL_DISCLAIMER, AFFILIATE_DISCLAIMER } = require('./src/config/constants');
  
  res.json({
    success: true,
    data: {
      medical: MEDICAL_DISCLAIMER,
      affiliate: AFFILIATE_DISCLAIMER
    }
  });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
