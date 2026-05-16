const admin = require('../firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // If Admin isn't initialized (e.g. dev mode without env), you might want to reject
    // or allow a bypass, but for production, we strictly verify.
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized. Cannot verify token.');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach trusted user payload to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
};

module.exports = verifyFirebaseToken;
