require('dotenv').config();
const mongoose = require('mongoose');
const ErrorLog = require('../models/ErrorLog');

// ✅ Connect without legacy options
mongoose.connect(process.env.MONGO_URI);

async function clearCache() {
  await ErrorLog.deleteMany({});
  console.log('All cached logs cleared!');
  process.exit(0);
}

clearCache();
