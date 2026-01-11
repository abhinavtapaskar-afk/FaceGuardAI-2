/**
 * FaceGuard AI - Lifestyle & Diet Coaching
 * Features 3 & 4: Contextual advice for skin health.
 */

const ADVICE_MAP = {
  ACNE: {
    diet: "Reduce dairy and high-glycemic sugar. Increase Zinc-rich foods.",
    lifestyle: "Change your pillowcase every 2 days and sanitize your phone screen."
  },
  DEHYDRATION: {
    diet: "Increase intake of Omega-3 (Walnuts, Chia seeds) and Watermelon.",
    lifestyle: "Use a humidifier and avoid washing face with very hot water."
  },
  AGING: {
    diet: "Focus on Collagen-boosting Vitamin C and antioxidants (Berries).",
    lifestyle: "Prioritize 7-9 hours of sleep; skin repair peaks at night."
  }
};

exports.getLifestyleTips = (primaryConcern) => {
  return ADVICE_MAP[primaryConcern.toUpperCase()] || ADVICE_MAP.DEHYDRATION;
};
