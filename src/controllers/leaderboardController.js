const Database = require('../config/database');
const { USER_TIERS } = require('../config/constants');

/**
 * Leaderboard Controller
 */
class LeaderboardController {
  /**
   * Get leaderboard rankings
   */
  static async getLeaderboard(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const userTier = req.user ? req.user.tier : USER_TIERS.FREE;

      const leaderboard = await Database.getLeaderboard(limit);

      // Filter based on tier
      let filteredLeaderboard = leaderboard;
      
      if (userTier === USER_TIERS.FREE) {
        // Free tier: Only show photos and basic info
        filteredLeaderboard = leaderboard.map(entry => ({
          rank: entry.rank,
          displayName: entry.displayName,
          photoUrl: entry.photoUrl,
          glowScore: entry.glowScore
        }));
      } else {
        // Premium tier: Show full details
        filteredLeaderboard = leaderboard;
      }

      // Find current user's rank if authenticated
      let userRank = null;
      if (req.user) {
        const userEntry = leaderboard.find(entry => entry.userId === req.userId);
        if (userEntry) {
          userRank = {
            rank: userEntry.rank,
            glowScore: userEntry.glowScore,
            streak: userEntry.streak
          };
        }
      }

      res.json({
        success: true,
        data: {
          leaderboard: filteredLeaderboard,
          userRank,
          total: leaderboard.length,
          tier: userTier,
          message: userTier === USER_TIERS.FREE ? 
            'Upgrade to Premium to see detailed stats and streaks!' : null
        }
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get leaderboard'
      });
    }
  }

  /**
   * Get user's rank
   */
  static async getUserRank(req, res) {
    try {
      const userId = req.userId;
      const leaderboard = await Database.getLeaderboard(1000);

      const userEntry = leaderboard.find(entry => entry.userId === userId);

      if (!userEntry) {
        return res.json({
          success: true,
          data: {
            ranked: false,
            message: 'Complete a scan to appear on the leaderboard!'
          }
        });
      }

      res.json({
        success: true,
        data: {
          ranked: true,
          rank: userEntry.rank,
          glowScore: userEntry.glowScore,
          streak: userEntry.streak,
          totalUsers: leaderboard.length
        }
      });
    } catch (error) {
      console.error('Get user rank error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user rank'
      });
    }
  }

  /**
   * Toggle leaderboard visibility
   */
  static async toggleVisibility(req, res) {
    try {
      const userId = req.userId;
      const { showOnLeaderboard } = req.body;

      if (typeof showOnLeaderboard !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'showOnLeaderboard must be a boolean'
        });
      }

      await Database.updateUser(userId, { showOnLeaderboard });

      res.json({
        success: true,
        message: `Leaderboard visibility ${showOnLeaderboard ? 'enabled' : 'disabled'}`,
        data: { showOnLeaderboard }
      });
    } catch (error) {
      console.error('Toggle visibility error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update visibility'
      });
    }
  }
}

module.exports = LeaderboardController;
