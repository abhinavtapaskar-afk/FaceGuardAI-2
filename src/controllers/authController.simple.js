const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory user storage (temporary - will be replaced with Firebase)
const users = new Map();

/**
 * Simplified Authentication Controller (No Firebase)
 */
class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      const { email, password, displayName } = req.body;

      // Validate input
      if (!email || !password || !displayName) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and display name are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Check if user already exists
      if (users.has(email)) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user ID
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Store user
      const userData = {
        id: userId,
        email,
        password: hashedPassword,
        displayName,
        tier: 'free',
        glowScore: 0,
        streak: 0,
        createdAt: new Date().toISOString()
      };

      users.set(email, userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: userId,
            email,
            displayName,
            tier: 'free'
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        details: error.message
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Get user
      const user = users.get(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            tier: user.tier,
            glowScore: user.glowScore,
            streak: user.streak
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        details: error.message
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          tier: user.tier,
          glowScore: user.glowScore,
          streak: user.streak,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  /**
   * Logout
   */
  static async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
}

module.exports = AuthController;
