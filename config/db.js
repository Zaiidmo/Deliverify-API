const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Load Environment Variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI_ATLAS);
    console.log(`MongoDB Connected: ${process.env.DB_URI_ATLAS}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
