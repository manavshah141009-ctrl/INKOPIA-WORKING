const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios'); // For webhooks

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // 1. Ensure user exists in MySQL
    let users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    let userId;
    
    if (users.length === 0) {
      const result = await db.query('INSERT INTO users (email) VALUES (?)', [email]);
      userId = result.insertId;
    } else {
      userId = users[0].id;
    }

    // 2. Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    // Clear old codes
    await db.query('DELETE FROM verification_codes WHERE user_id = ?', [userId]);
    // Insert new code
    await db.query('INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, ?)', [userId, otp, expiresAt]);

    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    // 3. Send Email
    const fromEmail = process.env.SMTP_USER || 'noreply@inkopia.com';
    const mailOptions = {
      from: `"Inkopia Concierge" <${fromEmail}>`,
      to: email,
      subject: 'Your Inkopia Verification Code',
      html: `
        <div style="font-family: serif; color: #004225; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #D5C8AD;">
          <h2 style="text-transform: uppercase; letter-spacing: 0.2em; text-align: center;">Identity Verification</h2>
          <p>A request to access the Private Vault has been initiated for this email address.</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 4px; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.5em; color: #D4AF37;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `
    };

    console.log(`[AUTH] Sending OTP to: ${email}`);
    if (process.env.SMTP_USER) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`[AUTH] Email sent successfully to ${email}`);
        res.json({ message: 'OTP sent successfully' });
      } catch (mailErr) {
        console.error('[AUTH] SMTP Error:', mailErr);
        throw mailErr;
      }
    } else {
      console.log(`[AUTH] Dev Mode: OTP is ${otp}`);
      res.json({ message: 'OTP sent to console (Dev Mode)', devMode: true });
    }
  } catch (err) {
    console.error('[AUTH] Failed to send OTP:', err.message);
    res.status(500).json({ error: 'Failed to send verification code: ' + err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  try {
    const results = await db.query(`
      SELECT vc.*, u.id as user_id 
      FROM verification_codes vc 
      JOIN users u ON vc.user_id = u.id 
      WHERE u.email = ? AND vc.code = ? AND vc.expires_at > NOW()
    `, [email, otp]);

    if (results.length > 0) {
      const userId = results[0].user_id;
      
      // Mark user as verified
      await db.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId]);
      // Delete used code
      await db.query('DELETE FROM verification_codes WHERE id = ?', [results[0].id]);

      // TRIGGER WEBHOOK (n8n placeholder)
      if (process.env.N8N_WEBHOOK_URL) {
        axios.post(process.env.N8N_WEBHOOK_URL, {
          event: 'lead.verified',
          email: email,
          timestamp: new Date()
        }).catch(e => console.error('Webhook failed:', e.message));
      }

      res.json({ success: true, message: 'Identity verified' });
    } else {
      res.status(400).json({ error: 'Invalid or expired verification code' });
    }
  } catch (err) {
    console.error('[AUTH] Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

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

// Admin Login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'inkopia2026';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign(
      { role: 'admin', username: adminUser },
      process.env.JWT_SECRET || 'inkopia_secret_key',
      { expiresIn: '24h' }
    );
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

module.exports = router;
