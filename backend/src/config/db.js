const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  // Option 1: User-configured MONGODB_URI (e.g. Atlas or local daemon)
  if (uri && uri.trim() !== '') {
    try {
      const conn = await mongoose.connect(uri.trim());
      console.log(`✅ MongoDB Connected to host: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Production database connection failed: ${error.message}`);
      }
      return null;
    }
  }

  // In production, require explicit MONGODB_URI (do not use in-memory fallback)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI environment variable is required in production environment.');
  }

  // Option 2: Fallback in-memory MongoDB for development and API testing
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!mongodInstance) {
      mongodInstance = await MongoMemoryServer.create();
    }
    const memUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memUri);
    console.log('✅ Connected to in-memory MongoDB database (development fallback)');
    return conn;
  } catch (err) {
    console.warn('⚠️ Could not start in-memory MongoDB fallback:', err.message);
    return null;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
