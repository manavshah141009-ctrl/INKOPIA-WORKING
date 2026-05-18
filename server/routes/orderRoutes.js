const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  tls: { rejectUnauthorized: false }
});

// GET orders (admin gets all, user gets own based on email or token)
router.get('/', async (req, res) => {
  try {
    const { email, role } = req.query; // Simple query pass for now
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    let params = [];
    
    if (role !== 'admin' && email) {
      query = 'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC';
      params = [email];
    }
    
    const orders = await db.query(query, params);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// CREATE order
router.post('/', async (req, res) => {
  try {
    const { 
      customer_name, customer_email, customer_phone, 
      services, pickup_address, notes 
    } = req.body;

    const order_id = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
    const concierge_name = 'Inkopia Concierge';
    const concierge_phone = '+91 98765 43210';

    // Insert into MySQL
    const result = await db.query(
      `INSERT INTO orders (
        order_id, customer_name, customer_email, customer_phone, 
        services, pickup_address, notes, concierge_name, concierge_phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        order_id, customer_name, customer_email, customer_phone, 
        services || '', pickup_address || '', notes || '', concierge_name, concierge_phone
      ]
    );

    const insertedId = result.insertId;
    const newOrder = await db.query('SELECT * FROM orders WHERE id = ?', [insertedId]);

    // Send emails
    const fromEmail = process.env.SMTP_USER || 'noreply@inkopia.in';
    const adminEmail = 'info@inkopia.in';

    // 1. Customer Email
    const customerMailOptions = {
      from: `"Inkopia Concierge" <${fromEmail}>`,
      to: customer_email,
      subject: 'Your Inkopia Concierge Request Has Been Confirmed',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #E5E7EB; background-color: #000000; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #333333;">
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://via.placeholder.com/150x50/000000/FFFFFF?text=INKOPIA" alt="Inkopia" style="margin-bottom: 20px;" />
            <h1 style="font-weight: 300; letter-spacing: 2px; color: #FFFFFF; font-size: 24px; text-transform: uppercase;">Concierge Confirmed</h1>
          </div>
          
          <div style="background-color: #111111; padding: 30px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #222222;">
            <p style="margin: 0 0 15px 0; font-size: 16px; color: #9CA3AF;">Dear ${customer_name},</p>
            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">Your luxury concierge request has been received. Our team will contact you shortly to coordinate the pickup.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #9CA3AF;">Order ID</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">${order_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #9CA3AF;">Services</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">${services}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #9CA3AF;">Pickup</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">${pickup_address}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9CA3AF;">Timeline</td>
                <td style="padding: 10px 0; text-align: right; color: #FFFFFF;">Contact within 2-4 hours</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #FFFFFF; color: #000000; padding: 14px 32px; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; display: inline-block;">Track Your Concierge Request</a>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #333333;">
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 10px 0;">Your Assigned Concierge: <strong style="color: #FFFFFF;">${concierge_name}</strong></p>
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 10px 0;">Direct Line: <strong style="color: #FFFFFF;">${concierge_phone}</strong></p>
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 20px 0;">Support: info@inkopia.in</p>
            <p style="font-size: 10px; color: #4B5563; text-transform: uppercase; letter-spacing: 1px;">© 2024 Inkopia. The Art of Writing.</p>
          </div>
        </div>
      `
    };

    // 2. Admin Notification Email
    const adminMailOptions = {
      from: `"Inkopia System" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Concierge Order: ${order_id}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${order_id}</p>
        <p><strong>Customer:</strong> ${customer_name}</p>
        <p><strong>Email:</strong> ${customer_email}</p>
        <p><strong>Phone:</strong> ${customer_phone}</p>
        <p><strong>Services Requested:</strong> ${services}</p>
        <p><strong>Pickup Address:</strong> ${pickup_address}</p>
        <p><strong>Notes:</strong> ${notes}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    };

    if (process.env.SMTP_USER) {
      transporter.sendMail(customerMailOptions).catch(e => console.error('[MAIL] Failed to send customer email:', e));
      transporter.sendMail(adminMailOptions).catch(e => console.error('[MAIL] Failed to send admin email:', e));
    }

    res.status(201).json({ success: true, order: newOrder[0] });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// UPDATE order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
