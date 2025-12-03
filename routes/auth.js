const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, email, password, nik, 
      addressRtRw, addressKelurahan, addressKecamatan, 
      phoneNumber, isChild, parentName 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { nik }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email or NIK already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      nik,
      addressRtRw,
      addressKelurahan,
      addressKecamatan,
      phoneNumber,
      isChild: isChild || false,
      parentName
    });

    await user.save();

    res.status(201).json({ 
      message: 'Registration successful.  Awaiting admin verification.',
      userId: user._id 
    });

  } catch (error) {
    console.error('Register error:', error);
    res. status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Login endpoint
router. post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin login
    if (email === 'admin@tbm.com' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 'admin', role: 'ADMIN' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: 'admin',
          fullName: 'Kevin Gunawan',
          email: 'admin@tbm.com',
          role: 'ADMIN',
          nik: 'ADMIN',
          address: 'Taman Bacaan Masyarakat'
        }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401). json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res. status(403).json({ 
        message: 'Account not verified by admin yet' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user. fullName,
        email: user.email,
        role: user.role,
        nik: user.nik,
        address: `${user.addressRtRw}, ${user.addressKelurahan}, ${user.addressKecamatan}`
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res. status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;