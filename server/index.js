const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Better Error Logging for Serverless
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const schemaRoutes = require('./routes/schemaRoutes');
const dataRoutes = require('./routes/dataRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/schemas', schemaRoutes);
app.use('/schemas', schemaRoutes);
app.use('/api/data', dataRoutes);
app.use('/data', dataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

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
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('ℹ️ MONGODB_URI not found. Working in Local JSON Storage mode.');
      return;
    }
    
    console.log('📡 Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('ℹ️  Working in Local JSON Storage mode.');
  }
};

connectDB();

// Keep alive timer
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {}, 1000 * 60 * 60);
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
