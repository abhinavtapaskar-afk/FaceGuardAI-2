const admin = require('firebase-admin');

const initFirebase = () => {
  try {
    const rawData = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    // DEBUG: This helps us see if the data is corrupted
    if (rawData && typeof rawData === 'string') {
        console.log("Data type: String. Starts with:", rawData.substring(0, 15));
    }

    if (!rawData) throw new Error("Environment variable is empty!");

    let serviceAccount;
    
    // Safety check: If Vercel already parsed it as an object
    if (typeof rawData === 'object') {
      serviceAccount = rawData;
    } else {
      // Clean the string: remove any accidental surrounding quotes or whitespace
      const cleanedData = rawData.trim().replace(/^['"]|['"]$/g, '');
      serviceAccount = JSON.parse(cleanedData);
    }

    // Fix the private key newlines (the most common fail point)
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase connected successfully using provided keys!");
    }
  } catch (err) {
    console.error("❌ CONNECTION ERROR:", err.message);
    // This will tell us if it's still failing at 'position 7'
    if (err.message.includes('position 7')) {
       console.error("CRITICAL: Vercel is reading the key as '[object Object]'. Check your Env Var settings.");
    }
  }
};

initFirebase();
const db = admin.firestore();
module.exports = { db };
