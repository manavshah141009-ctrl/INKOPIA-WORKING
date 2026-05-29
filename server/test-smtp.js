const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT == '465',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS
};

console.log('SMTP Config Loaded:', {
  host: dbConfig.host,
  port: dbConfig.port,
  secure: dbConfig.secure,
  user: dbConfig.user,
  pass: dbConfig.pass ? '***PROVIDED***' : '***MISSING***'
});

const transporter = nodemailer.createTransport({
  host: dbConfig.host,
  port: dbConfig.port,
  secure: dbConfig.secure,
  auth: {
    user: dbConfig.user,
    pass: dbConfig.pass
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function runTest() {
  console.log('Testing SMTP connection...');
  try {
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully!');

    // Test sending email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Inkopia Test" <${dbConfig.user}>`,
      to: dbConfig.user, // Send to self
      subject: 'Inkopia SMTP Connection Test',
      text: 'If you are reading this, your SMTP connection is fully operational!'
    });
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP Test Failed:', err);
  }
}

runTest();
