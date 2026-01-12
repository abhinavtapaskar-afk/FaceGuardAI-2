const AIService = require('../services/aiService');
const RecommendationService = require('../services/recommendationService');
const SafetyService = require('../services/safetyService');
const ProgressService = require('../services/progressService');
const Database = require('../config/database');
const { MEDICAL_DISCLAIMER, PRIVACY_NOTICE } = require('../config/constants');

/**
 * Scan Controller - Handles skin analysis
 */
class ScanController {
  /**
   * Analyze skin from uploaded image
   */
  static async analyzeSkin(req, res) {
    try {
      const { imageBase64 } = req.body;
      const userId = req.userId;

      // Validate image
      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: 'No image provided'
        });
      }

      // Perform AI analysis
      console.log('Starting AI skin analysis...');
      const analysis = await AIService.analyzeSkin(imageBase64);

      // Generate personalized recommendations
      console.log('Generating recommendations...');
      const routine = RecommendationService.generateRoutine(analysis);
      const dietRecommendations = RecommendationService.getDietRecommendations(analysis.issues);
      const lifestyleRecommendations = RecommendationService.getLifestyleRecommendations(
        analysis.skinType,
        analysis.issues
      );

      // Check for safety issues
      console.log('Checking safety...');
      const safetyCheck = SafetyService.checkRoutineConflicts(routine);

      // Save scan to database
      const scanData = {
        userId,
        analysis,
        routine,
        dietRecommendations,
        lifestyleRecommendations,
        safetyCheck,
        imageUrl: null // We're not storing images for privacy
      };

      const scanId = await Database.createScan(scanData);

      // Save progress metrics
      await ProgressService.saveProgress(userId, scanId, analysis);

      // Update user's glow score and streak
      const streak = await ProgressService.calculateStreak(userId);
      await Database.updateUser(userId, {
        glowScore: analysis.glowScore,
        streak,
        lastScanDate: new Date()
      });

      // Get previous scan for comparison (if exists)
      const previousScans = await Database.getUserScans(userId, 2);
      let progressComparison = null;

      if (previousScans.length > 1) {
        try {
          progressComparison = await ProgressService.compareScans(
            userId,
            previousScans[1].id,
            scanId
          );
        } catch (error) {
          console.error('Progress comparison error:', error);
        }
      }

      // Prepare response
      const response = {
        success: true,
        data: {
          scanId,
          analysis: {
            skinType: analysis.skinType,
            glowScore: analysis.glowScore,
            issues: analysis.issues,
            strengths: analysis.strengths,
            concerns: analysis.concerns,
            detailedAnalysis: analysis.analysis,
            confidence: analysis.confidence
          },
          recommendations: {
            routine,
            diet: dietRecommendations,
            lifestyle: lifestyleRecommendations
          },
          safety: safetyCheck,
          progress: progressComparison,
          userStats: {
            glowScore: analysis.glowScore,
            streak,
            totalScans: previousScans.length
          },
          disclaimers: {
            medical: MEDICAL_DISCLAIMER,
            privacy: PRIVACY_NOTICE
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Scan analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Skin analysis failed',
        details: error.message
      });
    }
  }

  /**
   * Get scan history for user
   */
  static async getScanHistory(req, res) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 10;

      const scans = await Database.getUserScans(userId, limit);

      res.json({
        success: true,
        data: {
          total: scans.length,
          scans: scans.map(scan => ({
            id: scan.id,
            date: scan.createdAt,
            glowScore: scan.analysis.glowScore,
            skinType: scan.analysis.skinType,
            issuesCount: scan.analysis.issues.length,
            topConcerns: scan.analysis.concerns.slice(0, 3)
          }))
        }
      });
    } catch (error) {
      console.error('Get scan history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scan history'
      });
    }
  }

  /**
   * Get detailed scan by ID
   */
  static async getScanDetails(req, res) {
    try {
      const { scanId } = req.params;
      const userId = req.userId;

      const scan = await Database.getScan(scanId);

      if (!scan) {
        return res.status(404).json({
          success: false,
          error: 'Scan not found'
        });
      }

      // Verify ownership
      if (scan.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: scan
      });
    } catch (error) {
      console.error('Get scan details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scan details'
      });
    }
  }

  /**
   * Get progress report
   */
  static async getProgressReport(req, res) {
    try {
      const userId = req.userId;
      const weeks = parseInt(req.query.weeks) || 12;

      const progressHistory = await ProgressService.getProgressHistory(userId, weeks);
      const weeklyReport = await ProgressService.getWeeklyReport(userId);

      res.json({
        success: true,
        data: {
          history: progressHistory,
          weeklyReport
        }
      });
    } catch (error) {
      console.error('Get progress report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get progress report'
      });
    }
  }

  /**
   * Compare two scans
   */
  static async compareScans(req, res) {
    try {
      const userId = req.userId;
      const { scan1Id, scan2Id } = req.query;

      if (!scan1Id || !scan2Id) {
        return res.status(400).json({
          success: false,
          error: 'Both scan IDs are required'
        });
      }

      const comparison = await ProgressService.compareScans(userId, scan1Id, scan2Id);

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Compare scans error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare scans',
        details: error.message
      });
    }
  }

  /**
   * Get scan statistics
   */
  static async getStatistics(req, res) {
    try {
      const userId = req.userId;

      const scans = await Database.getUserScans(userId, 100);
      const progressHistory = await ProgressService.getProgressHistory(userId, 52);

      if (scans.length === 0) {
        return res.json({
          success: true,
          data: {
            totalScans: 0,
            message: 'No scans yet. Complete your first scan to see statistics!'
          }
        });
      }

      // Calculate statistics
      const glowScores = scans.map(s => s.analysis.glowScore);
      const avgGlowScore = glowScores.reduce((a, b) => a + b, 0) / glowScores.length;
      const maxGlowScore = Math.max(...glowScores);
      const minGlowScore = Math.min(...glowScores);

      // Most common skin type
      const skinTypes = scans.map(s => s.analysis.skinType);
      const skinTypeCount = {};
      skinTypes.forEach(type => {
        skinTypeCount[type] = (skinTypeCount[type] || 0) + 1;
      });
      const mostCommonSkinType = Object.keys(skinTypeCount).reduce((a, b) => 
        skinTypeCount[a] > skinTypeCount[b] ? a : b
      );

      // Most common issues
      const allIssues = scans.flatMap(s => s.analysis.issues.map(i => i.category));
      const issueCount = {};
      allIssues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
      const topIssues = Object.entries(issueCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count }));

      res.json({
        success: true,
        data: {
          totalScans: scans.length,
          glowScore: {
            current: scans[0].analysis.glowScore,
            average: Math.round(avgGlowScore),
            highest: maxGlowScore,
            lowest: minGlowScore,
            trend: scans.length > 1 ? 
              (scans[0].analysis.glowScore > scans[1].analysis.glowScore ? 'improving' : 'declining') : 
              'stable'
          },
          skinType: {
            current: scans[0].analysis.skinType,
            mostCommon: mostCommonSkinType
          },
          topIssues,
          streak: await ProgressService.calculateStreak(userId),
          firstScanDate: scans[scans.length - 1].createdAt,
          lastScanDate: scans[0].createdAt
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics'
      });
    }
  }
}

module.exports = ScanController;
