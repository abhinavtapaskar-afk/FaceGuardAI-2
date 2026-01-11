const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API Key from Vercel Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeSkinImage = async (imageBuffer) => {
  // Use the gemini-1.5-flash model (It's fast and has a great free tier)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Act as a professional skincare expert. Analyze this face image. Identify skin type (Oily/Dry/Comb), major concerns (Acne, Redness, Aging), and give a 'Glow Score' from 1-100. Return only JSON format.";

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg"
      },
    },
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  return JSON.parse(response.text()); // This returns the AI's "Eyes"
};
