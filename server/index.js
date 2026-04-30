const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const schemaRoutes = require('./routes/schemaRoutes');
const dataRoutes = require('./routes/dataRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/schemas', schemaRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('INKOPIA API is running...');
});

// Pre-register models for Storage service
require('./models/DynamicSchema');
require('./models/SiteData');

// Database Connection (Background)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inkopia', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('⚠️ MongoDB connection error:', err.message);
    console.log('ℹ️  Working in Local JSON Storage mode.');
  }
};

connectDB();

// Keep alive timer
setInterval(() => {}, 1000 * 60 * 60);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
