const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/authController.simple');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Debug route (remove in production!)
router.get('/debug', AuthController.debug);

module.exports = router;
