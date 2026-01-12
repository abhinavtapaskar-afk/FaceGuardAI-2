# 🛡️ FaceGuard AI - Complete Skincare Platform

AI-powered skincare analysis and personalized routine management platform with comprehensive features.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🔬 Core Features
- **AI Skin Analysis**: Comprehensive skin type and issue detection using Google Gemini Vision API
- **Personalized Routines**: Morning, night, and weekly skincare routines tailored to your skin
- **Safety First**: Automatic ingredient conflict detection and safety warnings
- **Progress Tracking**: Week-over-week comparisons with AI-powered insights
- **Diet & Lifestyle**: Personalized nutrition and lifestyle recommendations

### 👥 User Features
- **Leaderboard System**: Compete with others based on Glow Score
- **Streak Tracking**: Maintain consistency with weekly scan streaks
- **Share Cards**: Social media-ready progress cards
- **Tier System**: Free and Premium membership options

### 💎 Premium Features
- Daily scans (vs weekly for free)
- Full progress graphs and analytics
- Detailed leaderboard stats
- Enhanced share cards with before/after
- PDF reports
- Affiliate product recommendations

### 🔒 Safety & Compliance
- Ingredient conflict detection
- Medical disclaimers
- Privacy policy & terms of use
- Consent tracking
- HTTPS encryption

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Firebase account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abhinavtapaskar-afk/FaceGuardAI-2.git
cd FaceGuardAI-2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_DATABASE_URL=your-database-url
FIREBASE_STORAGE_BUCKET=your-storage-bucket

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Optional: Razorpay for payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Skin Analysis

#### Analyze Skin
```http
POST /api/scans/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response includes:**
- Skin type detection
- Issue identification with severity
- Glow Score (0-100)
- Personalized morning/night routines
- Diet and lifestyle recommendations
- Safety warnings
- Progress comparison (if previous scans exist)

#### Get Scan History
```http
GET /api/scans/history?limit=10
Authorization: Bearer <token>
```

#### Get Progress Report
```http
GET /api/scans/progress/report?weeks=12
Authorization: Bearer <token>
```

#### Compare Scans
```http
GET /api/scans/progress/compare?scan1Id=xxx&scan2Id=yyy
Authorization: Bearer <token>
```

### Leaderboard

#### Get Leaderboard
```http
GET /api/leaderboard?limit=100
Authorization: Bearer <token> (optional)
```

#### Get My Rank
```http
GET /api/leaderboard/my-rank
Authorization: Bearer <token>
```

### Subscriptions

#### Get Plans
```http
GET /api/subscriptions/plans
```

#### Get Current Subscription
```http
GET /api/subscriptions/current
Authorization: Bearer <token>
```

## 🏗️ Project Structure

```
FaceGuardAI-2/
├── src/
│   ├── api/
│   │   └── routes/          # API route definitions
│   ├── config/
│   │   ├── constants.js     # App constants
│   │   ├── database.js      # Database helpers
│   │   └── firebase.js      # Firebase configuration
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth, rate limiting, errors
│   └── services/            # Business logic
│       ├── aiService.js     # Gemini AI integration
│       ├── recommendationService.js
│       ├── safetyService.js
│       └── progressService.js
├── app.js                   # Express app setup
├── server.js                # Server entry point
├── package.json
└── .env.example
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse
- **Helmet.js**: Security headers
- **Input Validation**: Joi validation
- **Password Hashing**: bcrypt
- **CORS Protection**: Configurable origins
- **Ingredient Safety**: Conflict detection

## 🎯 Tier Comparison

| Feature | Free | Premium |
|---------|------|---------|
| Scans | 1/week | 1/day |
| Progress Graphs | Basic | Full |
| Leaderboard | Limited | Full Stats |
| Share Cards | Simple | Enhanced |
| PDF Reports | ❌ | ✅ |
| Streak Tracking | ❌ | ✅ |
| Affiliate Products | ❌ | ✅ |

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","displayName":"Test User"}'
```

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase client email |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `JWT_SECRET` | Yes | JWT signing secret |
| `RAZORPAY_KEY_ID` | No | Razorpay key (for payments) |

## 🚢 Deployment

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway up
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for skin analysis
- Firebase for backend infrastructure
- All open-source contributors

## 📧 Contact

- **Developer**: Abhinav Tapaskar
- **Email**: abhinavtapaskar@gmail.com
- **GitHub**: [@abhinavtapaskar-afk](https://github.com/abhinavtapaskar-afk)

## ⚠️ Disclaimer

FaceGuard AI is for educational purposes only. Always consult a qualified dermatologist for medical advice. The AI analysis should not be used as the sole basis for medical decisions.

---

Made with ❤️ by Abhinav Tapaskar
