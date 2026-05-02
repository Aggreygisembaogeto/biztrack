const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const passport = require('./backend/config/passport');
require('dotenv').config();

const { initDatabase } = require('./backend/config/database-production');

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5001',
  'http://localhost:3000',
  'http://localhost:5001'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes (must come before static files)
app.use('/api/auth', require('./backend/routes/auth-production'));
app.use('/api/auth', require('./backend/routes/oauth')); // OAuth routes
app.use('/api/inventory', require('./backend/routes/inventory'));
app.use('/api/orders', require('./backend/routes/orders'));
app.use('/api/sales', require('./backend/routes/sales'));
app.use('/api/transactions', require('./backend/routes/transactions'));
app.use('/api/admin', require('./backend/routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BizTrack Unified Server is running',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    mode: 'unified'
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'BizTrack API',
    version: '3.0.0',
    mode: 'unified',
    endpoints: {
      auth: 'POST /api/auth/register, POST /api/auth/login',
      inventory: 'GET /api/inventory, POST /api/inventory',
      orders: 'GET /api/orders, POST /api/orders',
      sales: 'GET /api/sales, POST /api/sales',
      transactions: 'GET /api/transactions, POST /api/transactions',
      admin: 'GET /api/admin/users, GET /api/admin/stats',
      health: 'GET /api/health'
    }
  });
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation error',
      errors: err.errors 
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access' 
    });
  }

  // Default error response
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// Initialize database and start server
const PORT = process.env.PORT || 5001;

initDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log('  🚀 BizTrack Unified Server');
      console.log('═══════════════════════════════════════════════════');
      console.log(`  ✓ Server running on port ${PORT}`);
      console.log(`  ✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ✓ Database: SQLite (initialized)`);
      console.log(`  ✓ Frontend: http://localhost:${PORT}`);
      console.log(`  ✓ API: http://localhost:${PORT}/api`);
      console.log(`  ✓ Health: http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════════════');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server };
