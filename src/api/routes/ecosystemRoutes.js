const express = require('express');
const router = express.Router();
const leaderboardController = require('../../controllers/leaderboardController');

router.get('/leaderboard', leaderboardController.getTopUsers);

module.exports = router;
