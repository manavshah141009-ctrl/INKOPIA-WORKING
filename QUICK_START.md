# QUICK START: Production Deployment Guide

This is a quick reference. For detailed information, see `BUG_AUDIT_REPORT.md` and `DEPLOYMENT.md`.

---

## What Was Fixed

### 🔴 Critical Bugs Fixed
1. **Build Failure** - Fixed lovable-tagger ESM import breaking build (`vite.config.ts`)
2. **CORS Security** - Replaced hardcoded domains with environment variables (`server/index.js`)
3. **Reverse Proxy** - Fixed upload URLs generation behind NGINX (`server/routes/uploadRoutes.js`)

### 🟡 Production Safety
4. **Async Error Handling** - Added global error handler to prevent crashes
5. **Trust Proxy** - Configured Express to trust X-Forwarded headers

### 📚 Documentation
6. **Environment Template** - Created `server/.env.example`
7. **Deployment Guide** - Created `DEPLOYMENT.md` with complete setup instructions

---

## Files Changed

```
✏️ Modified:
  - vite.config.ts (fixed ESM import issue)
  - server/index.js (CORS, proxy, error handling)
  - server/routes/uploadRoutes.js (X-Forwarded headers)
  - nginx.conf (added X-Forwarded-Host)

✨ Created:
  - server/.env.example (environment template)
  - DEPLOYMENT.md (deployment guide)
  - BUG_AUDIT_REPORT.md (detailed audit)
```

---

## Before Deployment

### 1. Build Frontend
```bash
npm run build
```

### 2. Create Production `.env`
```bash
cp server/.env.example server/.env

# Edit server/.env and set:
NODE_ENV=production
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=inkopia_db
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Test Locally
```bash
npm run dev
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
# API: http://localhost:3000/api/health
```

---

## Production Deployment (AWS Ubuntu)

### Step 1: Prepare Server
```bash
# SSH into your EC2 instance
ssh ubuntu@your-ec2-ip

# Create app directory
mkdir -p /var/www/inkopia
cd /var/www/inkopia
```

### Step 2: Deploy Code
```bash
# Download/copy your code (example using git)
git clone <your-repo> .
npm install
cd server && npm install && cd ..

# OR upload a zip file:
# scp app.zip ubuntu@ec2:/var/www/inkopia/
# unzip app.zip
```

### Step 3: Start Backend
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
sudo pm2 startup
```

### Step 4: Configure NGINX
```bash
sudo cp nginx.conf /etc/nginx/sites-available/inkopia
sudo ln -s /etc/nginx/sites-available/inkopia /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Enable HTTPS
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 6: Verify
```bash
# Check backend is running
curl http://127.0.0.1:3000/api/health

# Check NGINX proxying
curl https://yourdomain.com/api/health

# View logs
pm2 logs inkopia-backend
```

---

## Environment Variables (Production)

```bash
NODE_ENV=production
PORT=3000
VITE_API_URL=/api

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=inkopia_db

# JWT (generate random: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_random_secret_min_32_chars

# CORS (restrict to your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# SMTP (for OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Common Issues & Fixes

### Issue: "Cannot build"
```bash
# Clear cache and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Issue: "API not responding"
1. Check backend is running: `pm2 list`
2. Check logs: `pm2 logs inkopia-backend`
3. Verify CORS_ORIGINS env var is set
4. Test directly: `curl http://127.0.0.1:3000/api/health`

### Issue: "Upload URLs are wrong"
- Verify NGINX is passing `X-Forwarded-Proto` header
- Check Express trust proxy: `NODE_ENV=production` should enable it
- Test: `curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: yourdomain.com" http://127.0.0.1:3000/api/health`

### Issue: "Database connection failed"
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env
# Test connection:
mysql -h your-db-host -u your-db-user -p your-db-password
```

---

## Monitoring

### Check Backend Status
```bash
pm2 list
pm2 logs inkopia-backend
pm2 monit
```

### Check Frontend
```bash
curl https://yourdomain.com/
# Should return HTML, not 404
```

### Check API
```bash
curl https://yourdomain.com/api/health
# Should return {"status":"ok","time":"..."}
```

---

## Rollback

If deployment fails:

```bash
# Check what went wrong
pm2 logs inkopia-backend

# Restart
pm2 restart inkopia-backend

# Or stop and revert
pm2 stop inkopia-backend
git checkout previous-version
npm run build
pm2 start ecosystem.config.js --env production
```

---

## Security Checklist

- [ ] HTTPS enabled (certbot)
- [ ] CORS restricted to your domain only
- [ ] JWT_SECRET is strong (32+ random chars)
- [ ] Database password is strong
- [ ] .env file not committed to git
- [ ] PM2 configured with memory limits
- [ ] NGINX firewall allows only 80/443
- [ ] SSL certificate auto-renewal configured

---

## Next Steps

1. Read `BUG_AUDIT_REPORT.md` for detailed explanation of all fixes
2. Read `DEPLOYMENT.md` for comprehensive deployment guide
3. Test in staging environment first
4. Deploy to production
5. Monitor logs for first 24 hours

---

**All systems ready for production! 🚀**
