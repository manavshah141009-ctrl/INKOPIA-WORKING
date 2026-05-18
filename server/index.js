const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');
const remoteLogger = require('./services/remoteLogger');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy headers from NGINX/load balancers in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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

// CORS Configuration - dynamically set from environment
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://127.0.0.1:3000'];

// Validate that production has CORS origins configured
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.warn('⚠️ WARNING: CORS_ORIGINS not configured for production. API may be inaccessible.');
}

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express 5 payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Async Error Handling Wrapper - catches unhandled promise rejections in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler middleware - must be defined after all other middleware/routes
const errorHandler = (err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  remoteLogger.error('Route Error', { message: err.message, path: req.path, stack: err.stack });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
};

// Routes
const schemaRoutes = require('./routes/schemaRoutes');
const dataRoutes = require('./routes/dataRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/schemas', schemaRoutes);
app.use('/schemas', schemaRoutes);
app.use('/api/data', dataRoutes);
app.use('/data', dataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

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

// Global error handler middleware - must be defined last
app.use(errorHandler);

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
