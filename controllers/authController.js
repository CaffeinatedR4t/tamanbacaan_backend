const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      nik,
      email,
      password,
      addressRtRw,
      addressKelurahan,
      addressKecamatan,
      phoneNumber,
      parentName,
      isChild
    } = req.body;

    // Validation
   if (!fullName || !nik || !email || !password || !addressRtRw || !phoneNumber) {
      return res. status(400).json({
        success: false,
        message:  'All required fields must be filled'
      });
    }

    // Validate NIK length (16 digits)
    if (nik.length !== 16) {
      return res.status(400).json({
        success: false,
        message: 'NIK must be 16 digits'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res. status(400).json({
        success: false,
        message:  'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { nik }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existingUser. nik === nik) {
        return res.status(400).json({
          success: false,
          message: 'NIK already registered'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      fullName,
      nik,
      email,
      password: hashedPassword,
      addressRtRw,
      addressKelurahan,
      addressKecamatan,
      phoneNumber,
      parentName:  isChild ? parentName : null,
      isChild:  isChild || false,
      role: 'MEMBER', // Default role
      isVerified: false, // Needs admin verification
      createdAt: new Date()
    });

    // Generate JWT token
    const token = jwt. sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user response (exclude password)
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      nik: user.nik,
      
      addressRtRw: user.addressRtRw || "",
      addressKelurahan: user.addressKelurahan || "Kelurahan Cipete", 
      addressKecamatan: user.addressKecamatan || "Kecamatan Cilandak", 
      
      phoneNumber: user.phoneNumber || "",
      isChild: user.isChild,
      isVerified: user.isVerified
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful.  Please wait for admin verification.',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message:  'Server error during registration',
      error: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified (optional - comment out if you want to allow unverified users)
    // if (! user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Account pending verification by admin'
    //   });
    // }

    // Generate JWT token
    const token = jwt. sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process. env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user response (exclude password)
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      nik: user.nik,
      
      addressRtRw: user.addressRtRw || "",
      addressKelurahan: user.addressKelurahan || "Kelurahan Cipete", 
      addressKecamatan: user.addressKecamatan || "Kecamatan Cilandak", 
      
      phoneNumber: user.phoneNumber || "",
      isChild: user.isChild,
      isVerified: user.isVerified
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message:  'Server error during login',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user. userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      nik: user.nik,
      
      addressRtRw: user.addressRtRw || "",
      addressKelurahan: user.addressKelurahan || "Kelurahan Cipete", 
      addressKecamatan: user.addressKecamatan || "Kecamatan Cilandak", 
      
      phoneNumber: user.phoneNumber || "",
      isChild: user.isChild,
      isVerified: user.isVerified
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message:  'Server error',
      error: error.message
    });
  }
};

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // JWT is stateless, so logout is handled on client side by removing token
    // This endpoint can be used for logging purposes or if you implement token blacklisting
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 * Requires authentication
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (! currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user. save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: error.message
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.userId; // dari JWT (authMiddleware)
    const { fullName, email, addressRtRw, addressKelurahan, addressKecamatan } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        addressRtRw,
        addressKelurahan,
        addressKecamatan
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};
