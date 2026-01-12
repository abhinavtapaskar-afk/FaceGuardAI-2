const { USER_TIERS } = require('../config/constants');

/**
 * Tier Check Middleware
 * Ensures user has required tier to access endpoint
 */
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.tier !== USER_TIERS.PREMIUM) {
    return res.status(403).json({
      success: false,
      error: 'Premium subscription required',
      message: 'This feature is only available for Premium members. Upgrade to unlock!',
      upgradeUrl: '/api/subscriptions/plans'
    });
  }

  next();
};

/**
 * Check if user can perform scan based on tier limits
 */
const checkScanLimit = async (req, res, next) => {
  try {
    const { user } = req;
    const { SCAN_LIMITS } = require('../config/constants');
    const Database = require('../config/database');

    // Get user's recent scans
    const recentScans = await Database.getUserScans(user.id, 10);

    if (user.tier === USER_TIERS.FREE) {
      // Free tier: 1 scan per week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const scansThisWeek = recentScans.filter(scan => 
        scan.createdAt.toDate() > oneWeekAgo
      );

      if (scansThisWeek.length >= SCAN_LIMITS.FREE.PER_WEEK) {
        const nextScanDate = new Date(scansThisWeek[0].createdAt.toDate());
        nextScanDate.setDate(nextScanDate.getDate() + 7);

        return res.status(429).json({
          success: false,
          error: 'Scan limit reached',
          message: 'Free tier allows 1 scan per week. Upgrade to Premium for daily scans!',
          nextScanAvailable: nextScanDate,
          upgradeUrl: '/api/subscriptions/plans'
        });
      }
    } else if (user.tier === USER_TIERS.PREMIUM) {
      // Premium tier: 1 scan per day
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const scansToday = recentScans.filter(scan => 
        scan.createdAt.toDate() > oneDayAgo
      );

      if (scansToday.length >= SCAN_LIMITS.PREMIUM.PER_DAY) {
        const nextScanDate = new Date(scansToday[0].createdAt.toDate());
        nextScanDate.setDate(nextScanDate.getDate() + 1);

        return res.status(429).json({
          success: false,
          error: 'Scan limit reached',
          message: 'Premium tier allows 1 scan per day. Please try again tomorrow!',
          nextScanAvailable: nextScanDate
        });
      }
    }

    next();
  } catch (error) {
    console.error('Scan limit check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check scan limits'
    });
  }
};

module.exports = {
  requirePremium,
  checkScanLimit
};
