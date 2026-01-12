const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In-memory user storage (temporary - will be replaced with database)
const users = new Map();

/**
 * Ultra-Simplified Authentication Controller
 * No external dependencies except jwt and bcrypt
 */
class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      console.log('Register request received:', { body: req.body });
      
      const { email, password, displayName } = req.body;

      // Validate input
      if (!email || !password || !displayName) {
        console.log('Validation failed: missing fields');
        return res.status(400).json({
          success: false,
          error: 'Email, password, and display name are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Validation failed: invalid email');
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate password length
      if (password.length < 6) {
        console.log('Validation failed: password too short');
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Check if user already exists
      if (users.has(email.toLowerCase())) {
        console.log('User already exists:', email);
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      console.log('Hashing password...');
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user ID
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Store user
      const userData = {
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        displayName,
        tier: 'free',
        glowScore: 0,
        streak: 0,
        createdAt: new Date().toISOString()
      };

      users.set(email.toLowerCase(), userData);
      console.log('User created successfully:', userId);
      console.log('Total users:', users.size);

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production-please';
      console.log('Generating JWT token...');
      
      const token = jwt.sign(
        { userId, email: email.toLowerCase() },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('Registration successful!');
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: userId,
            email: email.toLowerCase(),
            displayName,
            tier: 'free'
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      console.log('Login request received:', { email: req.body.email });
      
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        console.log('Validation failed: missing fields');
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Get user
      const user = users.get(email.toLowerCase());
      if (!user) {
        console.log('User not found:', email);
        console.log('Available users:', Array.from(users.keys()));
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      console.log('User found, verifying password...');
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      console.log('Password verified, generating token...');

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production-please';
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      console.log('Login successful!');

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
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        error: 'Failed to get profile',
        details: error.message
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

  /**
   * Debug endpoint - list all users (remove in production!)
   */
  static async debug(req, res) {
    try {
      const userList = Array.from(users.values()).map(u => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        createdAt: u.createdAt
      }));

      res.json({
        success: true,
        totalUsers: users.size,
        users: userList
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
