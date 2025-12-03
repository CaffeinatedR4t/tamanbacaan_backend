require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const { promisify } = require('util');

// Force Node.js to use Google DNS and native resolver
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const app = express();

// Middleware
app.use(cors());
app.use(express. json());

// MongoDB Connection with DNS fix
mongoose.connect(process.env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Taman Bacaan API is running! ',
    status: 'OK',
    timestamp: new Date(). toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message 
  });
});

const PORT = process. env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test it: http://localhost:${PORT}`);
});