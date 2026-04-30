const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['text', 'number', 'image', 'date', 'boolean', 'rich-text'] 
  },
  required: { type: Boolean, default: false }
});

const dynamicSchemaSchema = new mongoose.Schema({
  collectionName: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  fields: [fieldSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.DynamicSchema || mongoose.model('DynamicSchema', dynamicSchemaSchema);
