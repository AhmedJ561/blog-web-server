const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('MONGO_URI:', process.env.MONGO_URI); // Log the connection string
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
