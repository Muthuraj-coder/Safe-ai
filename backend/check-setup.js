// Quick diagnostic script to check backend setup
require("dotenv").config();

console.log("=== Backend Setup Check ===\n");

// Check environment variables
console.log("Environment Variables:");
console.log("  PORT:", process.env.PORT || "3000 (default)");
console.log("  MONGO_URI:", process.env.MONGO_URI || "❌ NOT SET (will use default)");
console.log("  JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET (will use default)");
console.log("  NVIDIA_NIM_API_KEY:", process.env.NVIDIA_NIM_API_KEY ? "✅ SET" : "⚠️  NOT SET (AI features won't work)");

// Check MongoDB connection
const mongoose = require("mongoose");
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/safe-log-ai";

console.log("\n=== Testing MongoDB Connection ===");
mongoose.connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB connection successful!");
    console.log("   Database:", mongoose.connection.db.databaseName);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed!");
    console.log("   Error:", err.message);
    console.log("\n💡 Solutions:");
    console.log("   1. Make sure MongoDB is running");
    console.log("   2. Check MONGO_URI in .env file");
    console.log("   3. Default URI: mongodb://localhost:27017/safe-log-ai");
    process.exit(1);
  });

