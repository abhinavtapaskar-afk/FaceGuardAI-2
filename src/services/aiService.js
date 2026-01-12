const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SKIN_TYPES, ISSUE_CATEGORIES, SEVERITY_LEVELS } = require('../config/constants');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Comprehensive AI Skin Analysis Service
 */
class AIService {
  /**
   * Analyze skin image using Gemini Vision API
   */
  static async analyzeSkin(imageBase64) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert dermatologist AI. Analyze this facial skin image in detail.

Return ONLY a valid JSON object with this exact structure:
{
  "skinType": "one of: ${SKIN_TYPES.join(', ')}",
  "issues": [
    {
      "category": "one of: ${Object.values(ISSUE_CATEGORIES).join(', ')}",
      "severity": "one of: ${Object.values(SEVERITY_LEVELS).join(', ')}",
      "details": "specific description of the issue",
      "affectedAreas": ["forehead", "cheeks", "nose", "chin", "under-eyes"],
      "confidence": 85
    }
  ],
  "strengths": ["positive aspects of the skin"],
  "concerns": ["main concerns to address"],
  "glowScore": 75,
  "analysis": {
    "texture": "description of skin texture",
    "hydration": "hydration level assessment",
    "oiliness": "oil production assessment",
    "sensitivity": "sensitivity indicators",
    "aging": "aging signs assessment",
    "pigmentation": "pigmentation assessment"
  },
  "confidence": 90
}

Be thorough and specific. Identify all visible skin concerns. The glowScore should be 0-100 based on overall skin health.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Validate and sanitize response
      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(`Skin analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate and sanitize AI analysis response
   */
  static validateAnalysis(analysis) {
    // Ensure skin type is valid
    if (!SKIN_TYPES.includes(analysis.skinType)) {
      analysis.skinType = 'Normal';
    }

    // Ensure issues array exists
    if (!Array.isArray(analysis.issues)) {
      analysis.issues = [];
    }

    // Validate each issue
    analysis.issues = analysis.issues.map(issue => ({
      category: Object.values(ISSUE_CATEGORIES).includes(issue.category) 
        ? issue.category 
        : ISSUE_CATEGORIES.ACNE,
      severity: Object.values(SEVERITY_LEVELS).includes(issue.severity)
        ? issue.severity
        : SEVERITY_LEVELS.MILD,
      details: issue.details || 'No details provided',
      affectedAreas: Array.isArray(issue.affectedAreas) ? issue.affectedAreas : [],
      confidence: Math.min(100, Math.max(0, issue.confidence || 70))
    }));

    // Ensure arrays exist
    analysis.strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
    analysis.concerns = Array.isArray(analysis.concerns) ? analysis.concerns : [];

    // Validate glow score
    analysis.glowScore = Math.min(100, Math.max(0, analysis.glowScore || 50));

    // Ensure analysis object exists
    if (!analysis.analysis || typeof analysis.analysis !== 'object') {
      analysis.analysis = {
        texture: 'Normal',
        hydration: 'Adequate',
        oiliness: 'Balanced',
        sensitivity: 'Low',
        aging: 'Minimal signs',
        pigmentation: 'Even tone'
      };
    }

    // Validate confidence
    analysis.confidence = Math.min(100, Math.max(0, analysis.confidence || 80));

    return analysis;
  }

  /**
   * Generate progress comparison analysis
   */
  static async compareProgress(previousScan, currentScan) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Compare these two skin analysis results and provide insights:

PREVIOUS SCAN:
${JSON.stringify(previousScan, null, 2)}

CURRENT SCAN:
${JSON.stringify(currentScan, null, 2)}

Return ONLY a valid JSON object:
{
  "improvements": ["list of improvements"],
  "concerns": ["list of new or worsening concerns"],
  "glowScoreChange": 5,
  "recommendations": ["specific recommendations based on progress"],
  "shouldAdjustRoutine": true,
  "adjustmentSuggestions": ["specific routine adjustments"],
  "motivationalMessage": "encouraging message based on progress"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Progress comparison error:', error);
      return {
        improvements: [],
        concerns: [],
        glowScoreChange: 0,
        recommendations: ['Continue with your current routine'],
        shouldAdjustRoutine: false,
        adjustmentSuggestions: [],
        motivationalMessage: 'Keep up the good work!'
      };
    }
  }
}

module.exports = AIService;
