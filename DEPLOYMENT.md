# Inkopia Production Deployment Guide

This guide covers the complete setup for deploying Inkopia to production on AWS Ubuntu/EC2.

## Prerequisites

- Ubuntu 20.04+ on AWS EC2
- Node.js 18+ installed
- PM2 globally installed: `npm install -g pm2`
- NGINX installed: `sudo apt-get install nginx`
- MySQL 8.0+ installed and running

---

## Step 1: Frontend Build

```bash
# Build the React frontend
npm run build

# Verify build succeeded
ls -la dist/
```

Expected: A `dist/` directory with `index.html` and static assets.

---

## Step 2: Configure Environment Variables

Create `.env` file in the `server/` directory based on `.env.example`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and update:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `SMTP_*` settings (for OTP emails)

---

## Step 3: Deploy Code to Server

```bash
# On your local machine, create a deployment archive
zip -r inkopia-deploy.zip dist/ server/ public/ package.json package-lock.json ecosystem.config.js nginx.conf -x "node_modules/*" "server/node_modules/*"

# Upload to server (or use git clone)
scp inkopia-deploy.zip ubuntu@your-ec2-ip:/home/ubuntu/
```

On the server:

```bash
cd /home/ubuntu
unzip inkopia-deploy.zip
npm install
cd server && npm install && cd ..
```

---

## Step 4: Verify MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS inkopia_db;
EXIT;
```

Backend will auto-create tables on startup.

---

## Step 5: Start Backend with PM2

```bash
# Start the application cluster
pm2 start ecosystem.config.js --env production

# Verify it's running
pm2 list

# Save PM2 process list for reboot
pm2 save
sudo pm2 startup

# Check if API is responding
curl http://127.0.0.1:3000/api/health
# Expected: {"status":"ok","time":"..."}
```

---

## Step 6: Configure NGINX

```bash
# Copy the NGINX config
sudo cp nginx.conf /etc/nginx/sites-available/inkopia

# Create symlink
sudo ln -s /etc/nginx/sites-available/inkopia /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Validate configuration
sudo nginx -t

# Restart NGINX
sudo systemctl restart nginx
```

---

## Step 7: SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

Certbot will automatically update `nginx.conf` with SSL settings.

---

## Step 8: Verify Deployment

1. **Frontend via domain:**
   - Visit `https://yourdomain.com`
   - Verify page loads and CSS/JS assets are served

2. **API connectivity:**
   ```bash
   curl https://yourdomain.com/api/health
   # Expected: {"status":"ok","time":"..."}
   ```

3. **CORS is working:**
   ```bash
   curl -H "Origin: https://yourdomain.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS https://yourdomain.com/api/health -v
   # Should see Access-Control-Allow-Origin header
   ```

---

## Step 9: Production Monitoring

```bash
# View PM2 logs
pm2 logs inkopia-backend

# Monitor memory/CPU
pm2 monit

# Set up auto-restart on crash
pm2 start ecosystem.config.js --env production --watch

# Enable PM2 Plus (optional, for cloud monitoring)
pm2 plus
```

---

## Production Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `DB_HOST` points to production database
- [ ] `DB_PASSWORD` is secure (not empty)
- [ ] `JWT_SECRET` is a random 64-char string
- [ ] `CORS_ORIGINS` set to your domain(s) only
- [ ] `VITE_API_URL=/api` (frontend will use relative paths)
- [ ] `SMTP_*` configured for email (or dev server if not sending emails)
- [ ] `PORT=3000` (internal port, NGINX handles 80/443)

---

## Common Issues & Fixes

### Issue: "Cannot POST /api/..."
**Fix:** Ensure CORS_ORIGINS environment variable is set correctly.

### Issue: Upload URLs return localhost
**Fix:** Verify NGINX is passing `X-Forwarded-Proto` and `X-Forwarded-Host` headers (see Step 6).

### Issue: Static assets (CSS/JS) return 404
**Fix:** Rebuild frontend: `npm run build` and verify `dist/` exists on server.

### Issue: Database connection failed
**Fix:** Verify MySQL is running: `sudo systemctl status mysql`

### Issue: PM2 doesn't restart on reboot
**Fix:** Run `sudo pm2 startup` and `pm2 save`

---

## Security Checklist

- [ ] SSL/HTTPS enabled on domain
- [ ] CORS restricted to specific domains (not *)
- [ ] JWT_SECRET is strong and secret
- [ ] Database password is strong
- [ ] PM2 configured with memory limits (prevents OOM crashes)
- [ ] NGINX configured to trust X-Forwarded-* headers only from localhost
- [ ] Sensitive `.env` variables not in version control
- [ ] Regular backups of database

---

## Rollback Procedure

If deployment fails:

```bash
# Check PM2 logs for errors
pm2 logs inkopia-backend

# Restart from last working version
pm2 restart inkopia-backend

# Or revert and redeploy
git checkout previous-commit
npm run build
pm2 restart ecosystem.config.js --env production
```

---

## Support

For debugging:
- Check `/var/log/nginx/error.log` for NGINX issues
- Check `pm2 logs` for backend errors
- Verify firewall allows 80/443: `sudo ufw status`

