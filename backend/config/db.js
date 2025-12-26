const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/safe-log-ai";
    if (!process.env.MONGO_URI) {
      console.warn("⚠️  MONGO_URI not set in .env, using default: mongodb://localhost:27017/safe-log-ai");
    }
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Make sure MongoDB is running and MONGO_URI is correct in .env");
    // Don't exit in development - allow server to start but operations will fail
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
