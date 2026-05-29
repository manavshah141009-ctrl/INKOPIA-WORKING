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

// ─── Taxes & Pricing System ─────────────────────────────────────
const GST_RATE = 0.18; // 18% GST

// ─── GET orders ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { email, role } = req.query;
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    let params = [];
    
    if (role !== 'admin' && email) {
      query = 'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC';
      params = [email];
    }
    
    const orders = await db.query(query, params);
    const formattedOrders = (orders || []).map(o => ({
      ...o,
      services: (o.services || '').replace(/Maintenance/g, 'Cleaning & Refilling')
    }));
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ─── CREATE order (with voucher + GST) ───────────────────────
router.post('/', async (req, res) => {
  try {
    const { 
      customer_name, customer_email, customer_phone, 
      services, pickup_address, notes,
      voucher_code, base_amount,
      appointment_date, booking_time, payment_method
    } = req.body;

    // ── Geographic Pincode Validation ──
    let pincode = '';
    if (pickup_address) {
      // Extract 6-digit pincode from the end of pickup address
      const match = pickup_address.match(/\b\d{6}\b/);
      if (match) pincode = match[0].trim();
    }

    if (!pincode) {
      return res.status(400).json({ error: 'Validation Error', message: 'A valid 6-digit Mumbai pincode is required for service.' });
    }

    const serviceable = await db.query('SELECT id FROM serviceable_pincodes WHERE pincode = ?', [pincode]);
    if (!serviceable || serviceable.length === 0) {
      return res.status(400).json({ error: 'Out of Service Area', message: 'Sorry, we do not currently service this area.' });
    }

    // ── Price Calculation ──
    const serviceBasePrice = parseFloat(base_amount) || 2500;
    const discountPercent = 0;
    const appliedVoucher = null;
    const discountAmount = 0;
    const gstAmount = Math.round(serviceBasePrice * GST_RATE * 100) / 100;
    const totalPayable = Math.round((serviceBasePrice + gstAmount) * 100) / 100;

    const order_id = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
    const concierge_name = process.env.CONCIERGE_NAME || 'Inkopia Concierge';
    const concierge_phone = process.env.CONCIERGE_PHONE || '+91 97685 35353';

    // Insert into MySQL
    let result = null;
    try {
      result = await db.query(
        `INSERT INTO orders (
          order_id, customer_name, customer_email, customer_phone, 
          services, pickup_address, notes, concierge_name, concierge_phone, status,
          base_amount, discount_percent, discount_amount, gst_amount, total_amount, voucher_code,
          appointment_date, booking_time, payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order_id, customer_name, customer_email, customer_phone, 
          services || '', pickup_address || '', notes || '', concierge_name, concierge_phone,
          serviceBasePrice, discountPercent, discountAmount, gstAmount, totalPayable,
          appliedVoucher || null,
          appointment_date || null, booking_time || null, payment_method || null
        ]
      );
    } catch (err) {
      console.warn('⚠️ Could not insert order into MySQL, falling back to local simulation:', err.message);
    }

    let newOrder = null;
    if (result && result.insertId) {
      const insertedId = result.insertId;
      const orders = await db.query('SELECT * FROM orders WHERE id = ?', [insertedId]);
      if (orders && orders.length > 0) {
        newOrder = orders[0];
      }
    }

    if (!newOrder) {
      newOrder = {
        id: Math.floor(1000 + Math.random() * 9000),
        order_id,
        customer_name,
        customer_email,
        customer_phone,
        services: services || '',
        pickup_address: pickup_address || '',
        notes: notes || '',
        concierge_name,
        concierge_phone,
        status: 'pending',
        base_amount: serviceBasePrice,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        gst_amount: gstAmount,
        total_amount: totalPayable,
        voucher_code: appliedVoucher || null,
        appointment_date: appointment_date || null,
        booking_time: booking_time || null,
        payment_method: payment_method || null,
        created_at: new Date()
      };
    }

    // ── Emails ──
    const fromEmail = process.env.SMTP_USER || 'noreply@inkopia.in';
    const conciergeEmail = 'concierge@inkopia.in';

    // Price breakdown for emails
    const priceBreakdownHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #9CA3AF;">Service Fee</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">₹${serviceBasePrice.toLocaleString()}</td>
        </tr>
        ${discountPercent > 0 ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #4ADE80;">Voucher (${appliedVoucher}) — ${discountPercent}% Off</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; text-align: right; color: #4ADE80;">-₹${discountAmount.toLocaleString()}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; color: #9CA3AF;">GST (18%)</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">₹${gstAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #FFFFFF; font-weight: bold; font-size: 16px;">Total Payable</td>
          <td style="padding: 10px 0; text-align: right; color: #FFFFFF; font-weight: bold; font-size: 16px;">₹${totalPayable.toLocaleString()}</td>
        </tr>
      </table>
    `;

    // 1. Customer Email
    const customerMailOptions = {
      from: `"Inkopia Concierge" <${fromEmail}>`,
      to: customer_email,
      subject: `Order Confirmed: ${order_id} — Your Concierge is Being Prepared`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #E5E7EB; background-color: #000000; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #333333;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-weight: 300; letter-spacing: 2px; color: #FFFFFF; font-size: 24px; text-transform: uppercase;">Concierge Confirmed</h1>
            <p style="color: #9CA3AF; font-size: 13px;">Order ${order_id}</p>
          </div>
          
          <div style="background-color: #111111; padding: 30px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #222222;">
            <p style="margin: 0 0 15px 0; font-size: 16px; color: #9CA3AF;">Dear ${customer_name},</p>
            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">Your luxury concierge request has been received. Our specialist will contact you shortly.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #9CA3AF;">Services</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">${services}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #9CA3AF;">Location</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; color: #FFFFFF;">${pickup_address}</td>
              </tr>
            </table>

            ${priceBreakdownHtml}
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #333333;">
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 10px 0;">Your Concierge: <strong style="color: #FFFFFF;">${concierge_name}</strong></p>
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 10px 0;">Direct Line: <strong style="color: #FFFFFF;">${concierge_phone}</strong></p>
            <p style="font-size: 10px; color: #4B5563; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px;">© 2025 Inkopia. The Art of Writing.</p>
          </div>
        </div>
      `
    };

    // 2. Concierge Notification Email (to concierge@inkopia.in)
    const conciergeMailOptions = {
      from: `"Inkopia System" <${fromEmail}>`,
      to: conciergeEmail,
      subject: `🔔 New Order Arrived: ${order_id} — ${customer_name}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #004225; color: #FFFFFF; border: 2px solid #D4AF37;">
          <h1 style="text-align: center; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; font-size: 20px; margin-bottom: 30px;">New Order Arrived</h1>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Order ID</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${order_id}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Customer</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${customer_name}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Email</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${customer_email}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Phone</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${customer_phone || 'N/A'}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Services</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${services}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Pickup Address</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${pickup_address}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Notes</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">${notes || '—'}</td></tr>
            ${appliedVoucher ? `<tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #4ADE80;">Voucher Applied</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right; color: #4ADE80;">${appliedVoucher} (${discountPercent}% off)</td></tr>` : ''}
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">Base Price</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">₹${serviceBasePrice.toLocaleString()}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #D4AF37;">GST (18%)</td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); text-align: right;">₹${gstAmount.toLocaleString()}</td></tr>
            <tr><td style="padding: 12px; color: #D4AF37; font-weight: bold; font-size: 16px;">Total Amount</td><td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">₹${totalPayable.toLocaleString()}</td></tr>
          </table>

          <p style="text-align: center; margin-top: 20px; font-size: 11px; color: rgba(255,255,255,0.5);">Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      `
    };

    if (process.env.SMTP_USER) {
      transporter.sendMail(customerMailOptions).catch(e => console.error('[MAIL] Customer email failed:', e));
      transporter.sendMail(conciergeMailOptions).catch(e => console.error('[MAIL] Concierge email failed:', e));
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ─── UPDATE order status ─────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    let { status } = req.body;
    // Map capitalized/spaced frontend status to lowercase/underscored MySQL status
    if (status === 'Pending') status = 'pending';
    else if (status === 'In Progress') status = 'in_progress';
    else if (status === 'Completed') status = 'completed';
    
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ─── DELETE order ────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
