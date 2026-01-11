const { db } = require('../config/firebase');

exports.performAnalysis = async (req, res) => {
  try {
    const { userId, concerns, imageUrl } = req.body;

    const analysisData = {
      timestamp: new Date().toISOString(),
      concerns: concerns || ["General"],
      glowScore: Math.floor(Math.random() * 20) + 70, // Mock score for now
      imageUrl: imageUrl
    };

    // SAVE TO FIREBASE FIRESTORE
    await db.collection('users').doc(userId).collection('scans').add(analysisData);

    res.json({
      success: true,
      message: "Scan saved to Firebase!",
      results: analysisData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
