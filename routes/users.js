const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users (Admin needs this)
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// [BARU] Get Single User by ID (Dibutuhkan untuk Logic Force Logout di Android)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get pending verification users
router.get('/pending', async (req, res) => {
  try {
    const users = await User.find({ isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// [DIPERBAIKI] Update User Status (Verify OR Unverify)
// Menggantikan route '/:id/verify' agar bisa handle true/false dari Android
router.put('/:id/status', async (req, res) => {
  try {
    // Ambil status dari body yang dikirim Android
    const { isVerified } = req.body; 
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: isVerified }, // Update sesuai input (bisa true atau false)
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: `User status updated to ${isVerified}`,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;