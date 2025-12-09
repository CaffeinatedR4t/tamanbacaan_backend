require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Force Node.js to use Google DNS and native resolver
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const app = express();

// Middleware
app.use(cors());
app.use(express. json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with DNS fix
mongoose.connect(process.env. MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:  45000,
  connectTimeoutMS: 30000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic route for testing
app. get('/', (req, res) => {
  res.json({ 
    message: 'Taman Bacaan API is running! ',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const eventRoutes = require('./routes/events');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/events', eventRoutes);

// 404 handler - must come AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:  `Route ${req.method} ${req.url} not found`
  });
});

// Error handling middleware - must be LAST
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message :  'Internal server error'
  });
});

const PORT = process. env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base:  http://localhost:${PORT}/api`);
  console.log(`📋 Health check: http://localhost:${PORT}`);
});