const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all serviceable pincodes
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM serviceable_pincodes ORDER BY pincode ASC');
    res.json(result || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a serviceable pincode
router.post('/', async (req, res) => {
  try {
    const { pincode, region } = req.body;
    if (!pincode || !region) {
      return res.status(400).json({ error: 'Pincode and region are required.' });
    }
    
    // Check if pincode already exists
    const existing = await db.query('SELECT id FROM serviceable_pincodes WHERE pincode = ?', [pincode.trim()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'This pincode is already registered.' });
    }

    await db.query(
      'INSERT INTO serviceable_pincodes (pincode, region) VALUES (?, ?)',
      [pincode.trim(), region.trim()]
    );
    res.status(201).json({ message: 'Pincode added successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a serviceable pincode
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM serviceable_pincodes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pincode removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
