# PRODUCTION READINESS - MANDATORY FIXES (90 Minutes)

This document contains all exact code changes needed to make the application production-ready.

---

## FIX #1: Firebase UID Spoofing Prevention [15 min]

**File:** `server/routes/authRoutes.js`

**BEFORE:**
```javascript
// Google OAuth User Sync
router.post('/sync-user', async (req, res) => {
  const { email, firebaseUid } = req.body;
  if (!email || !firebaseUid) return res.status(400).json({ error: 'Missing data' });

  try {
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      await db.query('INSERT INTO users (email, firebase_uid, is_verified) VALUES (?, ?, TRUE)', [email, firebaseUid]);
    } else {
      await db.query('UPDATE users SET firebase_uid = ?, is_verified = TRUE WHERE email = ?', [firebaseUid, email]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[AUTH] Sync user error:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});
```

**AFTER:**
```javascript
// Google OAuth User Sync - Now with Firebase token verification
router.post('/sync-user', verifyFirebaseToken, async (req, res) => {
  const { email, firebaseUid } = req.body;
  if (!email || !firebaseUid) return res.status(400).json({ error: 'Missing data' });

  try {
    // SECURITY FIX: Verify that the token matches the provided credentials
    if (req.user.uid !== firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID does not match verified token' });
    }
    if (req.user.email !== email) {
      return res.status(400).json({ error: 'Email does not match verified token' });
    }

    // Now safe to proceed - token is verified and matches provided data
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      await db.query('INSERT INTO users (email, firebase_uid, is_verified) VALUES (?, ?, TRUE)', [email, firebaseUid]);
    } else {
      await db.query('UPDATE users SET firebase_uid = ?, is_verified = TRUE WHERE email = ?', [firebaseUid, email]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[AUTH] Sync user error:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});
```

---

## FIX #2: Authentication on Data APIs [30 min]

**File:** `server/routes/dataRoutes.js`

**BEFORE:**
```javascript
const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Get all data for a schema - PUBLIC, NO AUTH
router.get('/:schemaId', async (req, res) => {
  try {
    const data = await storage.find('SiteData', { schemaId: req.params.schemaId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update data - PUBLIC, NO AUTH
router.post('/', async (req, res) => {
  // ... code
});

// Delete data - PUBLIC, NO AUTH
router.delete('/:id', async (req, res) => {
  // ... code
});
```

**AFTER:**
```javascript
const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Get all data for a schema - NOW REQUIRES AUTHENTICATION
router.get('/:schemaId', verifyFirebaseToken, async (req, res) => {
  try {
    const data = await storage.find('SiteData', { schemaId: req.params.schemaId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Error fetching data' : err.message });
  }
});

// Create or update data - NOW REQUIRES AUTHENTICATION
router.post('/', verifyFirebaseToken, async (req, res) => {
  // ... code remains same, but now only authenticated users can create data
});

// Delete data - NOW REQUIRES AUTHENTICATION
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  // ... code remains same, but now only authenticated users can delete data
});
```

**Also apply to:** `server/routes/schemaRoutes.js` (same pattern)

---

## FIX #3: Rate Limiting on Auth Endpoints [15 min]

**Step 1:** Install rate limiting
```bash
npm install --save express-rate-limit
```

**Step 2:** Add to `server/package.json` (verify it's there after install)

**Step 3:** Update `server/routes/authRoutes.js` at the top:

**BEFORE:**
```javascript
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios');
```

**AFTER:**
```javascript
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,      // Return rate limit info in `RateLimit-*` headers
  skipSuccessfulRequests: true, // Don't count successful requests
});
```

**Step 4:** Add limiter to auth routes:

```javascript
// Send OTP - ADD LIMITER
router.post('/send-otp', authLimiter, async (req, res) => {
  // ... existing code
});

// Verify OTP - ADD LIMITER
router.post('/verify-otp', authLimiter, async (req, res) => {
  // ... existing code
});

// Admin Login - ADD LIMITER
router.post('/admin-login', authLimiter, async (req, res) => {
  // ... existing code
});
```

---

## FIX #4: Async Email Sending (Non-Blocking) [20 min]

**File:** `server/routes/dataRoutes.js`

**BEFORE:**
```javascript
router.post('/', async (req, res) => {
  try {
    const { schemaId, uniqueId, data } = req.body;
    
    let result;
    if (uniqueId) {
      result = await storage.save('SiteData', { schemaId, data, updatedAt: new Date() }, uniqueId);
    } else {
      result = await storage.save('SiteData', { schemaId, data });
    }
    
    // Send email SYNCHRONOUSLY - BLOCKS RESPONSE
    if (!uniqueId && data && data.clientEmail && data.instrument) {
      const mailOptions = {/* ... */};
      try {
        await transporter.sendMail(mailOptions);  // WAITS FOR EMAIL
        console.log(`[EMAIL] Sent to ${data.clientEmail}`);
      } catch (mailErr) {
        console.error('[EMAIL] Failed:', mailErr);
      }
    }
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
```

**AFTER:**
```javascript
router.post('/', async (req, res) => {
  try {
    const { schemaId, uniqueId, data } = req.body;
    
    let result;
    if (uniqueId) {
      result = await storage.save('SiteData', { schemaId, data, updatedAt: new Date() }, uniqueId);
    } else {
      result = await storage.save('SiteData', { schemaId, data });
    }
    
    // Send email ASYNCHRONOUSLY - DOES NOT BLOCK RESPONSE
    if (!uniqueId && data && data.clientEmail && data.instrument) {
      const mailOptions = {/* ... */};
      
      // Fire-and-forget: Don't await, don't block response
      transporter.sendMail(mailOptions).then(() => {
        console.log(`[EMAIL] Successfully sent to ${data.clientEmail}`);
      }).catch(err => {
        // Log error but don't crash
        console.error(`[EMAIL] Failed to send to ${data.clientEmail}:`, err.message);
        // Optionally log to DB for monitoring
      });
    }
    
    // Response sent immediately, without waiting for email
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
```

---

## FIX #5: Graceful Shutdown Handler [10 min]

**File:** `server/index.js` (bottom of file, before app.listen)

**BEFORE:**
```javascript
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server is actively listening on port ${PORT}`);
  });
}

module.exports = app;
```

**AFTER:**
```javascript
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server is actively listening on port ${PORT}`);
  });

  // Graceful shutdown on SIGTERM (sent by PM2 when restarting)
  process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, initiating graceful shutdown...');
    
    // Stop accepting new connections
    server.close(async () => {
      console.log('✅ HTTP server closed, no new connections accepted');
      
      // Close database pool to prevent hanging connections
      if (pool) {
        try {
          await pool.end();
          console.log('✅ Database connections closed');
        } catch (err) {
          console.error('⚠️ Error closing DB pool:', err.message);
        }
      }
      
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    });
    
    // Force exit if graceful shutdown takes too long (30 seconds)
    setTimeout(() => {
      console.error('❌ Forced shutdown after 30s timeout - some connections may be dropped');
      process.exit(1);
    }, 30000);
  });
}

module.exports = app;
```

**Also update:** `ecosystem.config.js`

**BEFORE:**
```javascript
{
  kill_timeout: 5000,
  wait_ready: true,
  listen_timeout: 3000,
}
```

**AFTER:**
```javascript
{
  kill_timeout: 35000,  // 35s: Matches our 30s timeout + 5s buffer
  wait_ready: true,
  listen_timeout: 3000,
}
```

---

## TESTING THESE FIXES

### Test Fix #1 (Firebase UID Validation)
```bash
# Should fail (no token)
curl -X POST http://localhost:3000/api/auth/sync-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","firebaseUid":"fake-uid"}'
# Expected: 401 "Missing or invalid authorization header"

# Should fail (UID mismatch)
curl -X POST http://localhost:3000/api/auth/sync-user \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","firebaseUid":"mismatched-uid"}'
# Expected: 400 "Firebase UID does not match verified token"

# Should succeed (valid token, matching data)
curl -X POST http://localhost:3000/api/auth/sync-user \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@email.com","firebaseUid":"verified-uid"}'
# Expected: 200 {"success":true}
```

### Test Fix #2 (Auth on Data APIs)
```bash
# Should fail (no auth)
curl http://localhost:3000/api/data/orders
# Expected: 401 "Missing or invalid authorization header"

# Should succeed (with auth)
curl -H "Authorization: Bearer $VALID_TOKEN" \
  http://localhost:3000/api/data/orders
# Expected: 200 [... order data ...]
```

### Test Fix #3 (Rate Limiting)
```bash
# Send 6 requests in quick succession to /api/auth/admin-login
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/admin-login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
  echo ""
done

# After 5 attempts, request #6 should be rate-limited
# Expected on request #6: 429 "Too many login attempts"
```

### Test Fix #4 (Async Email)
```bash
# Send large order
curl -X POST http://localhost:3000/api/data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schemaId": "orders",
    "data": {
      "clientEmail": "customer@example.com",
      "clientName": "John Doe",
      "instrument": "fountain-pen"
    }
  }'

# Response should come back IMMEDIATELY (<200ms)
# Email will be sent in background (check logs)
```

### Test Fix #5 (Graceful Shutdown)
```bash
# Send request
curl http://localhost:3000/api/health

# While request is in-flight, restart PM2
pm2 restart inkopia-backend

# Check logs - should see graceful shutdown messages
pm2 logs inkopia-backend

# Server should restart without losing in-flight requests
```

---

## DEPLOYMENT CHECKLIST

After applying all 5 fixes:

- [ ] Run all tests above
- [ ] Verify no console errors
- [ ] Check npm run build succeeds
- [ ] Deploy to staging environment
- [ ] Run full integration tests
- [ ] Monitor staging for 1 hour
- [ ] Deploy to production
- [ ] Monitor production for 24 hours
- [ ] Check error rates (should be ~0%)

---

## ROLLBACK PLAN

If something breaks:

```bash
# Stop the app
pm2 stop inkopia-backend

# Revert to previous version
git checkout HEAD~1

# Rebuild and restart
npm install
npm run build
pm2 restart inkopia-backend
```

---

**Total implementation time: 90 minutes**  
**Total testing time: 30 minutes**  
**Recommended deployment: During low-traffic window (night/weekend)**

