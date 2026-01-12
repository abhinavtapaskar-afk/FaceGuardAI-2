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
        if (!imageBase64) return res.status(400).json({ error: "No image provided" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent([
            SYSTEM_PROMPT,
            { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        const rawText = response.text();
        
        // --- CLEANING LOGIC ---
        // This removes any extra text Gemini might add like "Here is your JSON:"
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI did not return valid JSON");
        
        const analysis = JSON.parse(jsonMatch[0]);

        // Merge AI data with your Recommendation logic
        const finalData = {
            success: true,
            skinType: analysis.skinType || "Unknown",
            issues: analysis.issues || [],
            routine: {
                morning: ["Gentle Cleanser", "Vitamin C", "SPF 50"],
                night: ["Double Cleanse", "Moisturizer"]
            },
            disclaimer: MEDICAL_DISCLAIMER
        };

        res.json(finalData);

    } catch (error) {
        console.error("DETAILED ERROR:", error);
        // This sends the SPECIFIC error to your screen so we can see it
        res.status(500).json({ error: error.message });
    }
});
   

const path = require('path'); // Add this at the very top with other requires

// ... (your existing code) ...

// --- 4. SERVE THE FRONTEND ---
// This tells Express to serve index.html when people visit the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Optional: A health check to test if the API is awake
app.get('/api/health', (req, res) => {
    res.json({ status: "FaceGuard AI Backend is Online" });
});

module.exports = app;
