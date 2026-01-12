# FaceGuard AI - Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Enter project name: "FaceGuard-AI"
   - Disable Google Analytics (optional)
   - Click "Create Project"

2. **Enable Firestore Database**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create Database"
   - Start in **Production Mode**
   - Choose your region
   - Click "Enable"

3. **Enable Firebase Storage**
   - Go to "Storage" in Firebase Console
   - Click "Get Started"
   - Start in **Production Mode**
   - Click "Done"

4. **Get Service Account Credentials**
   - Go to Project Settings (gear icon) → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely
   - Extract these values for your `.env`:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `databaseURL` → `FIREBASE_DATABASE_URL`
     - Storage bucket → `FIREBASE_STORAGE_BUCKET`

5. **Set Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Scans collection
       match /scans/{scanId} {
         allow read: if request.auth != null && resource.data.userId == request.auth.uid;
         allow create: if request.auth != null;
       }
       
       // Progress collection
       match /progress/{progressId} {
         allow read: if request.auth != null && resource.data.userId == request.auth.uid;
         allow create: if request.auth != null;
       }
       
       // Products collection (read-only for all)
       match /products/{productId} {
         allow read: if true;
         allow write: if false; // Only admins via backend
       }
       
       // Leaderboard (read-only for all)
       match /leaderboard/{entry} {
         allow read: if true;
         allow write: if false;
       }
     }
   }
   ```

### Step 2: Google Gemini AI Setup

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the API key
   - Add to `.env` as `GEMINI_API_KEY`

2. **Enable Gemini API**
   - The API should be automatically enabled
   - If not, go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Generative Language API"

### Step 3: Razorpay Setup (Optional - for Premium Features)

1. **Create Razorpay Account**
   - Go to [Razorpay](https://razorpay.com/)
   - Sign up for an account
   - Complete KYC verification

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate Test/Live keys
   - Add to `.env`:
     - `RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`

3. **Configure Webhooks** (for subscription management)
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `subscription.charged`

### Step 4: Environment Configuration

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Fill in all values**
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Firebase (from Step 1)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   
   # Gemini AI (from Step 2)
   GEMINI_API_KEY=AIzaSy...
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=7d
   
   # Razorpay (from Step 3 - optional)
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   
   # App URLs
   APP_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   ```

3. **Generate JWT Secret**
   ```bash
   # On Linux/Mac
   openssl rand -base64 32
   
   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Initialize Firestore Collections

The collections will be created automatically when you use the app, but you can pre-create them:

1. **Create Collections in Firestore Console:**
   - `users`
   - `scans`
   - `products`
   - `recommendations`
   - `subscriptions`
   - `progress`
   - `leaderboard`
   - `feature_flags`
   - `legal_consents`
   - `affiliate_clicks`

2. **Add Sample Products** (optional)
   - Go to Firestore Console
   - Create documents in `products` collection
   - Use this structure:
   ```json
   {
     "name": "Gentle Cleanser",
     "category": "Facewash",
     "activeIngredients": ["Glycerin", "Ceramides"],
     "suitableFor": ["Dry", "Sensitive"],
     "price": 599,
     "brand": "CeraVe",
     "amazonLink": "https://amazon.in/...",
     "flipkartLink": "https://flipkart.com/...",
     "affiliateEnabled": true
   }
   ```

### Step 7: Run the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Production Mode**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open browser: `http://localhost:3000`
   - API Health Check: `http://localhost:3000/api/health`

### Step 8: Test the Application

1. **Register a User**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123456",
       "displayName": "Test User"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123456"
     }'
   ```

3. **Test Skin Analysis**
   - Use the web interface at `http://localhost:3000`
   - Upload a face image
   - Click "Analyze Skin"
   - View results

### Step 9: Deployment

#### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Add Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env`

#### Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set FIREBASE_PROJECT_ID=your-value
   # Repeat for all variables
   ```

### Step 10: Post-Deployment

1. **Update CORS Settings**
   - Update `FRONTEND_URL` in `.env` to your production URL
   - Update Firebase CORS settings if needed

2. **Enable Production Mode**
   ```env
   NODE_ENV=production
   ```

3. **Monitor Logs**
   ```bash
   # Vercel
   vercel logs
   
   # Railway
   railway logs
   ```

4. **Set up Monitoring**
   - Use Firebase Console for database monitoring
   - Set up error tracking (Sentry, etc.)
   - Monitor API usage

## 🔧 Troubleshooting

### Firebase Connection Issues
- Verify all Firebase credentials are correct
- Check if Firestore is enabled
- Ensure service account has proper permissions

### Gemini API Errors
- Verify API key is valid
- Check API quota limits
- Ensure Generative Language API is enabled

### Authentication Issues
- Check JWT_SECRET is set
- Verify Firebase Auth is configured
- Check token expiration settings

### Image Upload Issues
- Verify file size is under 10MB
- Check image format (JPG, PNG)
- Ensure base64 encoding is correct

## 📞 Support

If you encounter issues:
1. Check the logs: `npm start` shows detailed errors
2. Verify all environment variables are set
3. Check Firebase Console for errors
4. Review API responses in browser DevTools

## 🎉 Success!

Your FaceGuard AI application should now be fully functional with:
- ✅ User authentication
- ✅ AI skin analysis
- ✅ Personalized recommendations
- ✅ Progress tracking
- ✅ Leaderboard system
- ✅ Premium features (if Razorpay configured)

Happy analyzing! 🛡️✨
