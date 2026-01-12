const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('../config/database');
const { auth } = require('../config/firebase');
const { USER_TIERS } = require('../config/constants');

/**
 * Authentication Controller
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

      // Check if user already exists
      const existingUser = await Database.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Create Firebase user
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName
      });

      // Hash password for our database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in database
      const userData = {
        email,
        password: hashedPassword,
        displayName,
        firebaseUid: firebaseUser.uid,
        tier: USER_TIERS.FREE,
        glowScore: 0,
        streak: 0,
        showOnLeaderboard: true,
        photoUrl: null,
        scansRemaining: 1
      };

      await Database.createUser(firebaseUser.uid, userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId: firebaseUser.uid, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: firebaseUser.uid,
            email,
            displayName,
            tier: USER_TIERS.FREE
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

      // Get user from database
      const user = await Database.getUserByEmail(email);
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
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      });

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
          photoUrl: user.photoUrl,
          showOnLeaderboard: user.showOnLeaderboard,
          createdAt: user.createdAt,
          lastScanDate: user.lastScanDate
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
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const { displayName, photoUrl, showOnLeaderboard } = req.body;

      const updates = {};
      if (displayName !== undefined) updates.displayName = displayName;
      if (photoUrl !== undefined) updates.photoUrl = photoUrl;
      if (showOnLeaderboard !== undefined) updates.showOnLeaderboard = showOnLeaderboard;

      await Database.updateUser(userId, updates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updates
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Logout (client-side token removal, but we can track it)
   */
  static async logout(req, res) {
    try {
      // In a more complex system, you might want to blacklist the token
      // For now, we just send a success response
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
