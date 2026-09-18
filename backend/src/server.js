require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // In production, enforce configured client origin; in dev, allow fallback
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', routes);

// Serve static frontend build and SPA routing in production if frontend/dist exists
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler for undefined API routes
app.use(notFoundHandler);

// Central Error Handler
app.use(errorHandler);

// Initialize Server and Database
let server = null;

const startServer = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      throw new Error('Database connection failed. Server cannot start.');
    }

    // Auto-seed only runs in development if database is completely empty
    if (process.env.NODE_ENV !== 'production') {
      try {
        const MenuItem = require('./models/MenuItem');
        const count = await MenuItem.countDocuments();
        if (count === 0) {
          console.log('📦 Database is empty. Running initial AFLAX menu seed...');
          const seedDatabase = require('./scripts/seed');
          await seedDatabase();
        }

        // Ensure initial admin user exists
        const seedAdmin = require('./scripts/seedAdmin');
        await seedAdmin();
      } catch (seedErr) {
        console.warn('⚠️ Auto-seed check notice:', seedErr.message);
      }
    }

    server = app.listen(PORT, () => {
      console.log(`🚀 AFLAX Restaurant API running on http://localhost:${PORT}`);
      console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📋 Categories:   http://localhost:${PORT}/api/categories`);
      console.log(`🍽️ Menu:         http://localhost:${PORT}/api/menu`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
