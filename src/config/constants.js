// Application Constants

// User Tiers
const USER_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

// Scan Limits
const SCAN_LIMITS = {
  FREE: {
    PER_WEEK: 1,
    COOLDOWN_HOURS: 168 // 7 days
  },
  PREMIUM: {
    PER_DAY: 1,
    COOLDOWN_HOURS: 24
  }
};

// Skin Types
const SKIN_TYPES = [
  'Oily',
  'Dry',
  'Combination',
  'Normal',
  'Sensitive',
  'Dehydrated'
];

// Skin Issue Categories
const ISSUE_CATEGORIES = {
  ACNE: 'Acne',
  ACNE_SCARS: 'Acne Scars',
  PIGMENTATION: 'Pigmentation',
  TEXTURE: 'Texture Issues',
  HYDRATION: 'Hydration/Barrier Issues',
  AGING: 'Aging Signs',
  UNDER_EYE: 'Under-Eye Issues',
  OIL_SEBUM: 'Oil & Sebum Issues',
  SENSITIVITY: 'Sensitivity'
};

// Acne Types
const ACNE_TYPES = [
  'Whiteheads',
  'Blackheads',
  'Papules',
  'Pustules',
  'Nodules',
  'Cystic',
  'Fungal',
  'Hormonal'
];

// Severity Levels
const SEVERITY_LEVELS = {
  MILD: 'Mild',
  MODERATE: 'Moderate',
  SEVERE: 'Severe'
};

// Product Categories
const PRODUCT_CATEGORIES = [
  'Facewash',
  'Toner',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Day Cream',
  'Night Cream',
  'Spot Treatment',
  'Face Mask',
  'Exfoliator (AHA)',
  'Exfoliator (BHA)',
  'Exfoliator (PHA)',
  'Lip Care',
  'Under-Eye Cream'
];

// Active Ingredients
const ACTIVE_INGREDIENTS = {
  RETINOL: 'Retinol',
  VITAMIN_C: 'Vitamin C',
  NIACINAMIDE: 'Niacinamide',
  HYALURONIC_ACID: 'Hyaluronic Acid',
  SALICYLIC_ACID: 'Salicylic Acid',
  GLYCOLIC_ACID: 'Glycolic Acid',
  LACTIC_ACID: 'Lactic Acid',
  BENZOYL_PEROXIDE: 'Benzoyl Peroxide',
  AZELAIC_ACID: 'Azelaic Acid',
  PEPTIDES: 'Peptides',
  CERAMIDES: 'Ceramides',
  ALPHA_ARBUTIN: 'Alpha Arbutin',
  KOJIC_ACID: 'Kojic Acid',
  TRANEXAMIC_ACID: 'Tranexamic Acid'
};

// Ingredient Conflicts (DO NOT USE TOGETHER)
const INGREDIENT_CONFLICTS = [
  ['Retinol', 'AHA'],
  ['Retinol', 'BHA'],
  ['Retinol', 'Vitamin C'],
  ['Vitamin C', 'Niacinamide'], // Debated, but safer to separate
  ['Benzoyl Peroxide', 'Retinol'],
  ['AHA', 'BHA'] // Can be used but not for beginners
];

// Vitamins & Supplements
const VITAMINS = [
  'Vitamin C',
  'Vitamin A',
  'Vitamin E',
  'Vitamin B3 (Niacinamide)',
  'Zinc',
  'Omega-3 Fatty Acids',
  'Collagen Peptides',
  'Selenium'
];

// Progress Tracking Metrics
const PROGRESS_METRICS = [
  'Acne Severity',
  'Oiliness Level',
  'Redness',
  'Dark Spots',
  'Texture Smoothness',
  'Barrier Health',
  'Routine Consistency'
];

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 299, // INR
    duration: 30,
    features: [
      '1 scan per day',
      'Full progress graphs',
      'Full leaderboard access',
      'Enhanced share cards',
      'PDF reports',
      'Streak tracking',
      'Affiliate product recommendations'
    ]
  },
  YEARLY: {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 2999, // INR (save ~17%)
    duration: 365,
    features: [
      'All monthly features',
      'Save 17%',
      'Priority support'
    ]
  }
};

// Medical Disclaimer
const MEDICAL_DISCLAIMER = `⚠️ MEDICAL DISCLAIMER: This application provides educational information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified dermatologist or healthcare provider for personalized skincare recommendations. The AI analysis is for informational purposes and should not be used as the sole basis for medical decisions.`;

// Affiliate Disclaimer
const AFFILIATE_DISCLAIMER = `🔗 AFFILIATE DISCLOSURE: Some product links are affiliate links. We may earn a commission if you purchase through these links at no additional cost to you. This helps support the development of FaceGuard AI.`;

// Privacy Notice
const PRIVACY_NOTICE = `🔒 PRIVACY: Your skin analysis photos are processed securely and are not stored permanently. We respect your privacy and comply with data protection regulations.`;

module.exports = {
  USER_TIERS,
  SCAN_LIMITS,
  SKIN_TYPES,
  ISSUE_CATEGORIES,
  ACNE_TYPES,
  SEVERITY_LEVELS,
  PRODUCT_CATEGORIES,
  ACTIVE_INGREDIENTS,
  INGREDIENT_CONFLICTS,
  VITAMINS,
  PROGRESS_METRICS,
  SUBSCRIPTION_PLANS,
  MEDICAL_DISCLAIMER,
  AFFILIATE_DISCLAIMER,
  PRIVACY_NOTICE
};
