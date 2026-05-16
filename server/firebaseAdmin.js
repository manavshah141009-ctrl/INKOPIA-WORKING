const admin = require('firebase-admin');

// Initialize Firebase Admin solely for Token Verification (No heavy services)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized for token verification');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin:', err.message);
  }
} else {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT missing. Secure token verification disabled.');
}

module.exports = admin;
