const mongoose = require('mongoose');

const siteDataSchema = new mongoose.Schema({
  schemaId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DynamicSchema', 
    required: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.SiteData || mongoose.model('SiteData', siteDataSchema);
