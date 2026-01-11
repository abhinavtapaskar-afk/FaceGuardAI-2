const aiService = require('../services/aiService');
const { db } = require('../config/firebase');

exports.performAnalysis = async (req, res) => {
  try {
    // 1. Get the image data from the request (sent as base64)
    const { imageBase64, userId, hasConsented } = req.body;

    if (!hasConsented) return res.status(400).json({ error: "Consent required" });

    // 2. Convert base64 to Buffer for the AI
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // 3. Call the Gemini AI Service (The Free Brain)
    const aiResults = await aiService.analyzeSkinImage(imageBuffer);

    // 4. Save the results to Firebase for history
    const scanRecord = {
      userId,
      ...aiResults,
      timestamp: new Date().toISOString()
    };
    
    await db.collection('scans').add(scanRecord);

    // 5. Return results to the user
    res.json({ success: true, ...aiResults });
    
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "AI failed to process image." });
  }
};
