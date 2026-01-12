const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Parse the private key (handle escaped newlines)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  throw error;
}

// Firestore Database
const db = admin.firestore();

// Firebase Storage
const bucket = admin.storage().bucket();

// Firebase Auth
const auth = admin.auth();

// Collections
const collections = {
  USERS: 'users',
  SCANS: 'scans',
  PRODUCTS: 'products',
  RECOMMENDATIONS: 'recommendations',
  SUBSCRIPTIONS: 'subscriptions',
  PROGRESS: 'progress',
  LEADERBOARD: 'leaderboard',
  FEATURE_FLAGS: 'feature_flags',
  LEGAL_CONSENTS: 'legal_consents',
  AFFILIATE_CLICKS: 'affiliate_clicks'
};

module.exports = {
  admin,
  db,
  bucket,
  auth,
  collections,
  firebaseApp
};
