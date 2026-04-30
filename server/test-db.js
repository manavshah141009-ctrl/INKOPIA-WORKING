const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uris = [
  process.env.MONGODB_URI,
  process.env.MONGODB_URI.split('?')[0] + '?ssl=true&authSource=admin',
  process.env.MONGODB_URI.replace('ssl=true', 'tls=true'),
  'mongodb+srv://inkopia12725_db_user:INKOPIA%40%40%4012725@ac-j98gjal.j643mvc.mongodb.net/inkopia?retryWrites=true&w=majority'
];

async function test() {
  for (const uri of uris) {
    console.log(`Testing URI: ${uri.split('@')[1]}`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ SUCCESS');
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }
}

test();
