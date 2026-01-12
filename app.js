const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- 1. YOUR RECOMMENDATION ENGINE LOGIC ---
const MEDICAL_DISCLAIMER = "⚠️ MEDICAL DISCLAIMER: Educational information only. Always consult a dermatologist.";

function makeEducational(text) {
    const replacements = [
        [/^Use this/gi, 'Ingredients like this are often suggested for'],
        [/^Apply/gi, 'Many people find it helpful to apply'],
        [/^You should/gi, 'Some individuals may benefit from']
    ];
    let educational = text;
    replacements.forEach(([pattern, replacement]) => { educational = educational.replace(pattern, replacement); });
    return educational;
}

// --- 2. GEMINI AI CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expert dermatologist AI. Analyze the image and return ONLY a JSON object:
{
  "skinType": "Oily/Dry/Combination/Normal/Sensitive",
  "issues": [{"category": "Acne/Aging/Pigmentation", "severity": "Mild/Moderate/Severe", "details": "..."}],
  "confidence": 95
}`;

// --- 3. THE LIVE API ROUTE ---
app.post('/api/scans/analyze', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: "No image" });

        // A. Call Gemini Vision
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            SYSTEM_PROMPT,
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ]);
        
        const response = await result.response;
        const analysis = JSON.parse(response.text().replace(/```json|```/g, ""));

        // B. Run your Recommendation Logic (Integration)
        const recommendations = {
            skinType: analysis.skinType,
            issues: analysis.issues,
            routine: {
                morning: ["Gentle Cleanser", "Vitamin C Serum", "SPF 50"],
                night: ["Double Cleanse", "Moisturizer"]
            },
            disclaimer: MEDICAL_DISCLAIMER
        };

        // Add Skin Cycling if Acne + Aging found
        const hasAcne = analysis.issues.some(i => i.category.toLowerCase().includes('acne'));
        const hasAging = analysis.issues.some(i => i.category.toLowerCase().includes('aging'));
        
        if (hasAcne && hasAging) {
            recommendations.skinCycling = "Enabled: Alternate Retinol and BHA nights.";
        }

        res.json(recommendations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Analysis failed", details: error.message });
    }
});

module.exports = app;
