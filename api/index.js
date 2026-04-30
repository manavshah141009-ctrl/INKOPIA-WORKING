console.log('🏁 [API] Function starting...');

let app;
try {
  app = require('../server/index.js');
  console.log('✅ [API] Express app loaded successfully');
} catch (err) {
  console.error('❌ [API] Failed to load Express app:', err.message);
  console.error(err.stack);
}

module.exports = (req, res) => {
  if (!app) {
    return res.status(500).json({ error: 'Express app failed to initialize' });
  }
  return app(req, res);
};
