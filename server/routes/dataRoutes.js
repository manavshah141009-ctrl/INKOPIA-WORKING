const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

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
  try {
    const { schemaId, uniqueId, data } = req.body;
    
    let result;
    if (uniqueId) {
      result = await storage.save('SiteData', { schemaId, data, updatedAt: new Date() }, uniqueId);
    } else {
      result = await storage.save('SiteData', { schemaId, data });
    }
    
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
