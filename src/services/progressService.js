const Database = require('../config/database');
const AIService = require('./aiService');
const { PROGRESS_METRICS } = require('../config/constants');

/**
 * Progress Tracking Service
 */
class ProgressService {
  /**
   * Save progress data from a scan
   */
  static async saveProgress(userId, scanId, scanAnalysis) {
    const progressData = {
      scanId,
      glowScore: scanAnalysis.glowScore,
      metrics: this.extractMetrics(scanAnalysis),
      issues: scanAnalysis.issues.map(issue => ({
        category: issue.category,
        severity: issue.severity
      })),
      skinType: scanAnalysis.skinType
    };

    return await Database.saveProgress(userId, progressData);
  }

  /**
   * Extract trackable metrics from scan analysis
   */
  static extractMetrics(scanAnalysis) {
    const metrics = {};

    // Acne Severity (0-100, higher = worse)
    const acneIssues = scanAnalysis.issues.filter(i => i.category === 'Acne');
    metrics.acneSeverity = this.calculateSeverityScore(acneIssues);

    // Oiliness Level (0-100)
    metrics.oilinessLevel = this.extractOilinessScore(scanAnalysis);

    // Redness (0-100)
    metrics.redness = this.extractRednessScore(scanAnalysis);

    // Dark Spots (0-100, higher = more spots)
    const pigmentationIssues = scanAnalysis.issues.filter(i => i.category === 'Pigmentation');
    metrics.darkSpots = this.calculateSeverityScore(pigmentationIssues);

    // Texture Smoothness (0-100, higher = smoother)
    metrics.textureSmoothness = this.extractTextureScore(scanAnalysis);

    // Barrier Health (0-100, higher = healthier)
    metrics.barrierHealth = this.extractBarrierHealth(scanAnalysis);

    return metrics;
  }

  /**
   * Calculate severity score from issues
   */
  static calculateSeverityScore(issues) {
    if (issues.length === 0) return 0;

    const severityMap = {
      'Mild': 30,
      'Moderate': 60,
      'Severe': 90
    };

    const totalScore = issues.reduce((sum, issue) => {
      return sum + (severityMap[issue.severity] || 30);
    }, 0);

    return Math.min(100, Math.round(totalScore / issues.length));
  }

  /**
   * Extract oiliness score from analysis
   */
  static extractOilinessScore(analysis) {
    const oilinessMap = {
      'Oily': 80,
      'Combination': 50,
      'Normal': 30,
      'Dry': 10,
      'Dehydrated': 5
    };

    return oilinessMap[analysis.skinType] || 30;
  }

  /**
   * Extract redness score
   */
  static extractRednessScore(analysis) {
    const rednessIssues = analysis.issues.filter(i => 
      i.details.toLowerCase().includes('redness') ||
      i.details.toLowerCase().includes('inflammation') ||
      i.category === 'Sensitivity'
    );

    return this.calculateSeverityScore(rednessIssues);
  }

  /**
   * Extract texture score
   */
  static extractTextureScore(analysis) {
    const textureIssues = analysis.issues.filter(i => i.category === 'Texture Issues');
    
    if (textureIssues.length === 0) return 80; // Good texture

    const severityScore = this.calculateSeverityScore(textureIssues);
    return Math.max(0, 100 - severityScore); // Invert: higher = better
  }

  /**
   * Extract barrier health score
   */
  static extractBarrierHealth(analysis) {
    const barrierIssues = analysis.issues.filter(i => 
      i.category === 'Hydration/Barrier Issues' ||
      i.details.toLowerCase().includes('barrier')
    );

    if (barrierIssues.length === 0) return 85; // Good barrier

    const severityScore = this.calculateSeverityScore(barrierIssues);
    return Math.max(0, 100 - severityScore); // Invert: higher = better
  }

  /**
   * Get user's progress history
   */
  static async getProgressHistory(userId, weeks = 12) {
    const progressData = await Database.getUserProgress(userId, weeks);

    return {
      totalScans: progressData.length,
      timeRange: {
        start: progressData.length > 0 ? progressData[0].createdAt : null,
        end: progressData.length > 0 ? progressData[progressData.length - 1].createdAt : null
      },
      data: progressData.map(p => ({
        date: p.createdAt,
        glowScore: p.glowScore,
        metrics: p.metrics,
        scanId: p.scanId
      }))
    };
  }

  /**
   * Compare two scans for progress analysis
   */
  static async compareScans(userId, previousScanId, currentScanId) {
    const previousScan = await Database.getScan(previousScanId);
    const currentScan = await Database.getScan(currentScanId);

    if (!previousScan || !currentScan) {
      throw new Error('Scan not found');
    }

    // Get AI-powered comparison
    const aiComparison = await AIService.compareProgress(
      previousScan.analysis,
      currentScan.analysis
    );

    // Calculate metric changes
    const metricChanges = this.calculateMetricChanges(
      previousScan.analysis,
      currentScan.analysis
    );

    return {
      timeBetween: this.calculateDaysBetween(previousScan.createdAt, currentScan.createdAt),
      glowScoreChange: currentScan.analysis.glowScore - previousScan.analysis.glowScore,
      metricChanges,
      aiInsights: aiComparison,
      summary: this.generateProgressSummary(metricChanges, aiComparison)
    };
  }

  /**
   * Calculate changes in metrics
   */
  static calculateMetricChanges(previousAnalysis, currentAnalysis) {
    const previousMetrics = this.extractMetrics(previousAnalysis);
    const currentMetrics = this.extractMetrics(currentAnalysis);

    const changes = {};

    Object.keys(currentMetrics).forEach(metric => {
      const previous = previousMetrics[metric] || 0;
      const current = currentMetrics[metric] || 0;
      const change = current - previous;
      const percentChange = previous !== 0 ? ((change / previous) * 100).toFixed(1) : 0;

      changes[metric] = {
        previous,
        current,
        change,
        percentChange: parseFloat(percentChange),
        trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
      };
    });

    return changes;
  }

  /**
   * Calculate days between two dates
   */
  static calculateDaysBetween(date1, date2) {
    const d1 = date1.toDate ? date1.toDate() : new Date(date1);
    const d2 = date2.toDate ? date2.toDate() : new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate progress summary
   */
  static generateProgressSummary(metricChanges, aiInsights) {
    const improvements = [];
    const concerns = [];

    // Analyze metric changes
    Object.entries(metricChanges).forEach(([metric, data]) => {
      if (Math.abs(data.change) > 5) { // Significant change
        if (metric === 'acneSeverity' || metric === 'darkSpots' || metric === 'redness') {
          // Lower is better for these metrics
          if (data.change < 0) {
            improvements.push(`${metric}: Improved by ${Math.abs(data.percentChange)}%`);
          } else {
            concerns.push(`${metric}: Increased by ${data.percentChange}%`);
          }
        } else {
          // Higher is better for these metrics
          if (data.change > 0) {
            improvements.push(`${metric}: Improved by ${data.percentChange}%`);
          } else {
            concerns.push(`${metric}: Decreased by ${Math.abs(data.percentChange)}%`);
          }
        }
      }
    });

    return {
      improvements: improvements.length > 0 ? improvements : aiInsights.improvements,
      concerns: concerns.length > 0 ? concerns : aiInsights.concerns,
      overallTrend: improvements.length > concerns.length ? 'positive' : 
                    concerns.length > improvements.length ? 'needs_attention' : 'stable',
      motivationalMessage: aiInsights.motivationalMessage
    };
  }

  /**
   * Get weekly progress report
   */
  static async getWeeklyReport(userId) {
    const progressData = await Database.getUserProgress(userId, 1); // Last week

    if (progressData.length < 2) {
      return {
        available: false,
        message: 'Not enough data for weekly report. Complete at least 2 scans.'
      };
    }

    const latestScan = progressData[progressData.length - 1];
    const previousScan = progressData[progressData.length - 2];

    const comparison = await this.compareScans(
      userId,
      previousScan.scanId,
      latestScan.scanId
    );

    return {
      available: true,
      weekNumber: Math.ceil(progressData.length / 1),
      comparison,
      recommendations: comparison.aiInsights.recommendations,
      shouldAdjustRoutine: comparison.aiInsights.shouldAdjustRoutine,
      adjustmentSuggestions: comparison.aiInsights.adjustmentSuggestions
    };
  }

  /**
   * Calculate streak
   */
  static async calculateStreak(userId) {
    const scans = await Database.getUserScans(userId, 100);
    
    if (scans.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(scans[0].createdAt.toDate());

    for (let i = 1; i < scans.length; i++) {
      const scanDate = new Date(scans[i].createdAt.toDate());
      const daysDiff = this.calculateDaysBetween(currentDate, scanDate);

      if (daysDiff <= 7) { // Within a week
        streak++;
        currentDate = scanDate;
      } else {
        break;
      }
    }

    return streak;
  }
}

module.exports = ProgressService;
