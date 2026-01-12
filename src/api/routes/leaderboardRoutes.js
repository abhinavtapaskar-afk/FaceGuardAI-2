const express = require('express');
const router = express.Router();
const LeaderboardController = require('../../controllers/leaderboardController');
const { authenticate, optionalAuth } = require('../../middleware/auth');

// Public leaderboard (with optional auth for personalization)
router.get('/', optionalAuth, LeaderboardController.getLeaderboard);

// Protected routes
router.get('/my-rank', authenticate, LeaderboardController.getUserRank);
router.put('/visibility', authenticate, LeaderboardController.toggleVisibility);

module.exports = router;
