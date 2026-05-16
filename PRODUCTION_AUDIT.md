# FULL-STACK PRODUCTION AUDIT & DEPLOYMENT STRATEGY (V2)

## 1. ACTUAL ARCHITECTURE DETECTED & SECURED

### Authentication Architecture (Fully Secured)
*   **Frontend:** Uses Firebase Client SDK (`firebase/auth`) exclusively for Google Login (`signInWithPopup`). It now strictly captures the `idToken` from Firebase upon successful login.
*   **Backend:** `firebase-admin` is reintroduced **minimally** (NO heavy services like Firestore or Messaging). It exists solely to execute `admin.auth().verifyIdToken()`.
*   **Trust Model:** The backend explicitly rejects unverified `email` and `firebaseUid` payloads from the frontend. It now uses `verifyFirebaseToken` middleware to extract the trusted `uid` and `email` directly from Google's cryptographic signature.

### Database Architecture
*   **Backend Storage:** Exclusively uses `mysql2/promise` to manage `inkopia_db` via `server/db.js`. MongoDB dependencies and remnants have been purged.

---

## 2. ACTIONS TAKEN & FILES UPDATED

1.  **Lightweight Firebase Admin:** Re-installed `firebase-admin` and created a minimal `server/firebaseAdmin.js` config to prevent loading unnecessary Firebase services.
2.  **Verification Middleware:** Created `server/middleware/firebaseAuth.js` which validates the Bearer token and attaches a trusted `req.user` payload.
3.  **Secured API Routes:** Refactored `/api/auth/sync-user` to use the middleware, discarding the untrusted frontend payload and relying exclusively on `req.user`.
4.  **Frontend Auth Flow:** Refactored `SignUp.tsx`. The Google login flow now retrieves the `idToken` and attaches it as `Authorization: Bearer <token>` to the `/sync-user` POST request, bypassing the vulnerable `addUser` data creation flow.
5.  **Downgraded Express:** Reverted Express from `5.2.1` to the highly stable `4.21.2`.
6.  **PM2 Fork Mode:** Configured `ecosystem.config.js` with `exec_mode: 'fork'` and `instances: 1` to ensure initial stability without cluster complications.

---

## 3. UPDATED CONFIG FILES (Available in Root)

### `ecosystem.config.js` (PM2)
```javascript
module.exports = {
  apps: [
    {
      name: 'inkopia-backend',
      script: './server/index.js',
      instances: 1, // Fork mode
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env_production: { NODE_ENV: 'production', PORT: 3000 }
    }
  ]
};
```

---

## 4. ENVIRONMENT VARIABLES REQUIRED (.env)

Your `/server/.env` must now include the JSON string representation of your Firebase Service Account for the backend verification to succeed:

```ini
NODE_ENV=production
PORT=3000

# Provide the Firebase Service Account JSON as a single-line string
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=inkopia_db
```

---

## 5. DEPLOYMENT CHEAT SHEET

### A. Server Preparation
```bash
# Install critical global packages
npm install -g pm2

# Install project dependencies
npm install
npm run build
```

### B. PM2 Process Management
```bash
# Start backend in Fork Mode
pm2 start ecosystem.config.js --env production

# Save process list to reboot automatically
pm2 save
pm2 startup
```

### C. NGINX Reverse Proxy
```bash
# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/inkopia
sudo ln -s /etc/nginx/sites-available/inkopia /etc/nginx/sites-enabled/

# Test and Reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. FINAL PRODUCTION CHECKLIST

- [x] **Firebase Token Verification:** Backend strictly verifies Google Auth tokens.
- [x] **Spoofing Prevented:** `/sync-user` no longer trusts frontend data for identity.
- [x] **MySQL Purity:** Mongoose completely removed from the dependency tree and codebase.
- [x] **Express 4.21.2:** Installed and verified.
- [x] **Deployment Configs:** PM2 Fork Mode and NGINX templates fully generated.
