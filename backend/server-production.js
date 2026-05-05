const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const passport = require('./config/passport');
require('dotenv').config();

const { initDatabase } = require('./config/database-production');

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002', // Alternative frontend port
  'https://biztrack-dusky.vercel.app' // Hardcoded Vercel domain
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or is a vercel.app domain
    if (allowedOrigins.indexOf(origin) !== -1 || (origin && origin.includes('vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport (with error handling)
try {
  app.use(passport.initialize());
  console.log('✓ Passport initialized');
} catch (error) {
  console.error('⚠ Passport initialization failed:', error.message);
  console.log('⚠ OAuth features will be disabled');
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth-production'));
app.use('/api/auth', require('./routes/oauth')); // OAuth routes
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BizTrack API is running',
    timestamp: new Date().toISOString(),
    version: '3.0.0'
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'BizTrack API',
    version: '3.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/password'
      },
      inventory: {
        getAll: 'GET /api/inventory',
        getOne: 'GET /api/inventory/:id',
        create: 'POST /api/inventory',
        update: 'PUT /api/inventory/:id',
        delete: 'DELETE /api/inventory/:id',
        updateQuantity: 'PATCH /api/inventory/:id/quantity',
        getLowStock: 'GET /api/inventory/low-stock',
        getStats: 'GET /api/inventory/stats'
      },
      orders: {
        getAll: 'GET /api/orders',
        getOne: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        update: 'PUT /api/orders/:id',
        delete: 'DELETE /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id/status',
        getStats: 'GET /api/orders/stats'
      },
      sales: {
        getAll: 'GET /api/sales',
        getOne: 'GET /api/sales/:id',
        create: 'POST /api/sales',
        update: 'PUT /api/sales/:id',
        delete: 'DELETE /api/sales/:id',
        getStats: 'GET /api/sales/stats'
      },
      transactions: {
        getAll: 'GET /api/transactions',
        getOne: 'GET /api/transactions/:id',
        create: 'POST /api/transactions',
        update: 'PUT /api/transactions/:id',
        delete: 'DELETE /api/transactions/:id',
        getSummary: 'GET /api/transactions/summary',
        getStatsByType: 'GET /api/transactions/stats/type',
        getStatsByCategory: 'GET /api/transactions/stats/category'
      },
      admin: {
        getAllUsers: 'GET /api/admin/users',
        getUserDetails: 'GET /api/admin/users/:id',
        deleteUser: 'DELETE /api/admin/users/:id',
        getPlatformStats: 'GET /api/admin/stats',
        getRecentActivity: 'GET /api/admin/activity'
      },
      health: 'GET /api/health'
    }
  });
});

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5001;

initDatabase()
  .then(() => {
    const HOST = '0.0.0.0'; // Bind to all interfaces for Railway
    server.listen(PORT, HOST, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log('  🚀 BizTrack API Server');
      console.log('═══════════════════════════════════════════════════');
      console.log(`  ✓ Server running on ${HOST}:${PORT}`);
      console.log(`  ✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  ✓ Database: SQLite (initialized)`);
      console.log(`  ✓ API URL: http://localhost:${PORT}/api`);
      console.log(`  ✓ Health check: http://localhost:${PORT}/api/health`);
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server };
