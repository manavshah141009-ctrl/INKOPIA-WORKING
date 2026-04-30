const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// In-memory OTP storage (for production, use Redis or a DB)
const otps = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure Nodemailer (Use environment variables for production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || '', // User should provide this
    pass: process.env.SMTP_PASS || ''
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = generateOTP();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  otps.set(email, { otp, expires });

  console.log(`[AUTH] OTP for ${email}: ${otp}`);

  // Send Email
  try {
    const mailOptions = {
      from: '"Inkopia Concierge" <noreply@inkopia.com>',
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

    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'OTP sent successfully' });
    } else {
      console.warn('[AUTH] No SMTP configuration found. OTP logged to console.');
      res.json({ message: 'OTP sent to console (Dev Mode)', devMode: true });
    }
  } catch (err) {
    console.error('[AUTH] Failed to send email:', err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const record = otps.get(email);
  if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });

  if (Date.now() > record.expires) {
    otps.delete(email);
    return res.status(400).json({ error: 'OTP has expired' });
  }

  if (record.otp === otp) {
    otps.delete(email);
    res.json({ success: true, message: 'Identity verified' });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  const jwt = require('jsonwebtoken');

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
