const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
const remoteLogger = require('./services/remoteLogger');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize MySQL
db.initDB();

// Better Error Logging for Serverless
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.message);
  remoteLogger.error('Uncaught Exception', { message: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  remoteLogger.error('Unhandled Rejection', { reason: reason?.toString() });
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

// Basic API Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Serve static files from the React app (dist folder)
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// The "catchall" handler: for any request that doesn't
// match an API route or a static file, send back React's index.html file.
app.use((req, res) => {
  // If the request looks like a file (has an extension) but wasn't caught by express.static
  if (path.extname(req.path)) {
    return res.status(404).send('File not found');
  }

  // If it's an API route that wasn't found, don't send index.html
  if (req.path.startsWith('/api/') || req.path.startsWith('/data/') || req.path.startsWith('/auth/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  const distIndex = path.join(__dirname, '../dist/index.html');
  const rootIndex = path.join(__dirname, '../index.html');
  
  res.sendFile(distIndex, (err) => {
    if (err) {
      res.sendFile(rootIndex);
    }
  });
});

// Storage service initialization is automatic

// Database initialized via MySQL pool

// Keep alive timer
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {}, 1000 * 60 * 60);
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server is actively listening on port ${PORT}`);
  });
}

module.exports = app;
