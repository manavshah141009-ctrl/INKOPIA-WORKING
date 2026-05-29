const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all brand pricings
router.get('/', async (req, res) => {
  try {
    const pricings = await db.query('SELECT * FROM InkBrandPricing ORDER BY brand ASC');
    res.json(pricings || []);
  } catch (err) {
    console.error('Error fetching brand pricings:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new brand pricing
router.post('/', async (req, res) => {
  try {
    const { brand, price } = req.body;
    await db.query(`
      INSERT INTO InkBrandPricing (id, brand, price, createdAt, updatedAt)
      VALUES (UUID(), ?, ?, NOW(), NOW())
    `, [brand, parseFloat(price)]);
    
    const [newPricing] = await db.query('SELECT * FROM InkBrandPricing WHERE brand = ?', [brand]);
    res.status(201).json(newPricing);
  } catch (err) {
    console.error('Error creating brand pricing:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update a brand pricing
router.put('/:id', async (req, res) => {
  try {
    const { brand, price } = req.body;
    await db.query(`
      UPDATE InkBrandPricing 
      SET brand = ?, price = ?, updatedAt = NOW() 
      WHERE id = ?
    `, [brand, parseFloat(price), req.params.id]);
    
    const [updatedPricing] = await db.query('SELECT * FROM InkBrandPricing WHERE id = ?', [req.params.id]);
    res.json(updatedPricing);
  } catch (err) {
    console.error('Error updating brand pricing:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a brand pricing
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM InkBrandPricing WHERE id = ?', [req.params.id]);
    res.json({ message: 'Brand pricing deleted' });
  } catch (err) {
    console.error('Error deleting brand pricing:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
