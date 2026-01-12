const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/authController.simple');
// const { authenticate } = require('../../middleware/auth');
// const { authLimiter } = require('../../middleware/rateLimiter');

// Public routes (no rate limiting for now to simplify debugging)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (disabled for now)
// router.get('/profile', authenticate, AuthController.getProfile);
// router.put('/profile', authenticate, AuthController.updateProfile);
// router.post('/logout', authenticate, AuthController.logout);

module.exports = router;
