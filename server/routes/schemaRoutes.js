const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Get all schemas
router.get('/', async (req, res) => {
  console.log('📬 [API] GET /api/schemas hit');
  try {
    const schemas = await storage.find('DynamicSchema');
    res.json(schemas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new schema
router.post('/', async (req, res) => {
  try {
    const newSchema = await storage.save('DynamicSchema', {
      collectionName: req.body.collectionName,
      displayName: req.body.displayName,
      fields: req.body.fields
    });
    res.status(201).json(newSchema);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a schema
router.put('/:id', async (req, res) => {
  try {
    const updatedSchema = await storage.save('DynamicSchema', {
      displayName: req.body.displayName,
      fields: req.body.fields
    }, req.params.id);
    
    if (!updatedSchema) return res.status(404).json({ message: 'Schema not found' });
    res.json(updatedSchema);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a schema
router.delete('/:id', async (req, res) => {
  try {
    await storage.delete('DynamicSchema', req.params.id);
    res.json({ message: 'Schema deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
