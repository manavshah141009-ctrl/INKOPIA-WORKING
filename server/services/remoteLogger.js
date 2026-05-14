const axios = require('axios');

const LOG_WEBHOOK_URL = process.env.REMOTE_LOG_URL;

const logToRemote = async (level, message, context = {}) => {
  if (!LOG_WEBHOOK_URL) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
    return;
  }

  try {
    const payload = {
      content: `🚨 **INKOPIA SERVER ALERT** [${level.toUpperCase()}]`,
      embeds: [{
        title: message,
        color: level === 'error' ? 15158332 : 3447003,
        fields: [
          { name: 'Environment', value: process.env.NODE_ENV || 'development', inline: true },
          { name: 'Database', value: 'Hybrid (MySQL/Atlas)', inline: true },
          ...Object.entries(context).map(([key, value]) => ({
            name: key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            inline: false
          }))
        ],
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(LOG_WEBHOOK_URL, payload);
  } catch (err) {
    console.error('❌ Failed to send remote log:', err.message);
  }
};

module.exports = {
  error: (msg, ctx) => logToRemote('error', msg, ctx),
  info: (msg, ctx) => logToRemote('info', msg, ctx)
};
