const skinService = require('../services/skinService');

exports.performAnalysis = async (req, res) => {
  try {
    const { imageUrl, currentProducts } = req.body;

    // 1. Safety Check (Feature 6)
    const safetyWarnings = skinService.analyzeRoutineSafety(currentProducts);

    // 2. Mock AI Analysis (Feature 1)
    // We will integrate real OpenAI Vision here in the next step
    const mockAnalysis = {
      skinType: 'Combination',
      concerns: ['Mild Acne', 'Dehydration'],
      glowScore: 78
    };

    res.json({
      success: true,
      analysis: mockAnalysis,
      warnings: safetyWarnings,
      advice: "Drink 2L of water today and use a ceramide moisturizer."
    });
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
};
