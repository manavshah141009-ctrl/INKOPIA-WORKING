const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// If service account key is provided via env variable as JSON string
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT not found in environment. Storage features may be disabled.');
}

const bucket = admin.apps.length > 0 ? admin.storage().bucket() : null;

module.exports = { admin, bucket };
