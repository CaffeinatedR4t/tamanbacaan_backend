const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token, authentication failed'
    });
  }
};

module.exports = (req, res, next) => {
  try {
    // Ambil header Authorization (Format: "Bearer <token>")
    const token = req.headers.authorization.split(' ')[1];
    
    // Verifikasi token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simpan data user ke request agar bisa dipakai di controller
    req.user = { userId: decodedToken.userId, role: decodedToken.role };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed!' });
  }
};

module.exports = authMiddleware;