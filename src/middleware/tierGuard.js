
// Define the allowed limits for each tier
const TIER_CONFIG = {
  FREE: {
    scansAllowed: 1, // 1 scan per week
    features: ['basic_analysis', 'basic_recommendations']
  },
  PREMIUM: {
    scansAllowed: 7, // 1 scan per day
    features: ['full_analysis', 'ingredient_conflict_check', 'progress_tracking']
  }
};

/**
 * Middleware to check if a user has exceeded their tier limits
 */
const checkTierLimit = async (req, res, next) => {
  try {
    // 1. Get user data (This would typically come from your Auth middleware/JWT)
    const user = req.user; 
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: No user found." });
    }

    const tier = user.tier || 'FREE';
    const currentUsage = user.weekly_scans || 0;
    const limit = TIER_CONFIG[tier].scansAllowed;

    // 2. Check if the user has reached their limit
    if (currentUsage >= limit) {
      return res.status(403).json({
        error: "Tier limit reached",
        message: `Your ${tier} plan only allows ${limit} scan(s) per week. Upgrade to Premium for daily scans!`,
        upgradeUrl: "/pricing" 
      });
    }

    // 3. If everything is fine, move to the next step (The AI Analysis)
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error in tier gating." });
  }
};

module.exports = { checkTierLimit };
