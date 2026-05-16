const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (Safe for Serverless)
const uploadDir = path.join(__dirname, '../uploads');
try {
    if (!fs.existsSync(uploadDir) && !process.env.VERCEL) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create uploads directory:', err.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // Generate the URL for the uploaded file
    // In production with NGINX reverse proxy, respect X-Forwarded-* headers
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
