const admin = require('firebase-admin');

// We use an Environment Variable for the Service Account to keep it secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://your-project-id.firebaseio.com"
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
