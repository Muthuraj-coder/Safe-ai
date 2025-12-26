const mongoose = require("mongoose");

const ErrorLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  fingerprint: {
    type: String,
    required: true,
    index: true
  },
  maskedLog: {
    type: String,
    required: true
  },
  aiSolution: {
    type: String,
    default: null
  },
  hitCount: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model("ErrorLog", ErrorLogSchema);
