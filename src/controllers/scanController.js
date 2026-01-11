const skinService = require('../services/skinService');
const recService = require('../services/recommendationService');

exports.performAnalysis = async (req, res) => {
  try {
    const { concerns } = req.body; // Concerns sent from AI analysis

    // 1. Get Recommendations (Feature 2 & 10)
    const recommendations = recService.getRecommendations(concerns || ['Acne']);

    // 2. Mock AI Analysis
    const analysisResults = {
      skinType: 'Oily',
      glowScore: 82,
      concerns: concerns || ['Acne']
    };

    // 3. Safety Check
    const safetyWarnings = skinService.analyzeRoutineSafety([]);

    res.json({
      success: true,
      analysis: analysisResults,
      recommendation: recommendations,
      warnings: safetyWarnings
    });
  } catch (error) {
    res.status(500).json({ error: "Analysis and Recommendation failed" });
  }
};
