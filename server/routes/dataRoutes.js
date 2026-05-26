const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Get all data for a schema
router.get('/:schemaId', async (req, res) => {
  try {
    const data = await storage.find('SiteData', { schemaId: req.params.schemaId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update data
router.post('/', async (req, res) => {
  console.log(`📡 [DATA] POST /api/data | Mode: ${storage.isMongoConnected ? 'CLOUD' : 'LOCAL'}`);
  try {
    const { schemaId, uniqueId, data } = req.body;
    
    let result;
    if (uniqueId) {
      result = await storage.save('SiteData', { schemaId, data, updatedAt: new Date() }, uniqueId);
    } else {
      result = await storage.save('SiteData', { schemaId, data });
    }
    
    // Send Confirmation Email if this is an order
    if (!uniqueId && data && data.clientEmail && data.instrument) {
      const fromEmail = process.env.SMTP_USER || 'noreply@inkopia.in';
      const conciergeNumber = process.env.CONCIERGE_PHONE || '+91 98765 43210';
      
      const mailOptions = {
        from: `"Inkopia Concierge" <${fromEmail}>`,
        to: data.clientEmail,
        subject: 'Order Confirmed: Your Concierge Cleaning & Refilling Ritual',
        html: `
          <div style="font-family: serif; color: #004225; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #D5C8AD; background-color: #fcfaf7;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="text-transform: uppercase; letter-spacing: 0.3em; margin: 0; color: #004225;">Order Confirmed</h2>
              <p style="font-style: italic; color: #666;">The Ritual Kit is being prepared.</p>
            </div>
            
            <div style="background: white; padding: 25px; border: 1px solid #eee; border-left: 4px solid #004225; margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Client:</strong> ${data.clientName}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Instrument:</strong> ${data.instrument}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Appointment:</strong> ${data.date} at ${data.bookingTime}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Location:</strong> ${data.location}</p>
              <p style="margin: 0; font-size: 16px; color: #004225;"><strong>Total Payable:</strong> ₹${(data.amount || 2500).toLocaleString()}</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #444;">
              Our specialist will arrive at your location as scheduled. For any coordination or changes, you may contact our <strong>Senior Concierge</strong> directly:
            </p>
            
            <div style="text-align: center; padding: 20px; background: #004225; color: white; border-radius: 4px; margin: 20px 0;">
              <span style="font-size: 18px; letter-spacing: 0.1em;">${conciergeNumber}</span>
            </div>

            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 40px;">
              © 2024 Inkopia Experience • Private & Confidential
            </p>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch(err => console.error('[MAIL] Failed to send order confirmation:', err));
    }
    
    res.status(201).json(result);
  } catch (err) {
    console.error(`❌ [DATA] Save error:`, err);
    res.status(400).json({ 
      error: 'Database rejection', 
      message: err.message,
      details: err.errors // Mongoose validation errors
    });
  }
});

// Delete data
router.delete('/:id', async (req, res) => {
  try {
    await storage.delete('SiteData', req.params.id);
    res.json({ message: 'Data deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
