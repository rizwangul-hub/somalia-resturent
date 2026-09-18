const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;
let mongodInstance = null;

const connectDB = async () => {
  // If already connected, return existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is already in progress, await it
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI;

  // Option 1: Configured MONGODB_URI (e.g. MongoDB Atlas or production DB)
  if (uri && uri.trim() !== '') {
    try {
      cachedPromise = mongoose
        .connect(uri.trim(), {
          serverSelectionTimeoutMS: 5000,
          bufferCommands: false,
        })
        .then((conn) => {
          cachedConnection = conn;
          console.log(`✅ MongoDB Connected to host: ${conn.connection.host}`);
          return conn;
        });

      const conn = await cachedPromise;
      return conn;
    } catch (error) {
      cachedPromise = null;
      console.error(`❌ MongoDB connection error: ${error.message}`);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  // In production (e.g. Vercel, Railway), require explicit MONGODB_URI
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URI environment variable is not configured. Please add MONGODB_URI to your Vercel Project Settings (Environment Variables).'
    );
  }

  // Option 2: Fallback in-memory MongoDB for local development and testing
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
    throw err;
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
  cachedConnection = null;
  cachedPromise = null;
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;

