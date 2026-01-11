/**
 * FaceGuard AI - Skin Brain
 * Handles: Ingredient Conflicts & Routine Logic
 */

const INGREDIENT_CONFLICTS = {
  'Retinol': ['AHA', 'BHA', 'Vitamin C', 'Benzoyl Peroxide'],
  'Vitamin C': ['AHA', 'BHA', 'Retinol'],
  'AHA': ['Retinol', 'Vitamin C', 'BHA'],
  'BHA': ['Retinol', 'Vitamin C', 'AHA']
};

exports.analyzeRoutineSafety = (products) => {
  const conflicts = [];
  const activeIngredients = products.map(p => p.activeIngredient);

  activeIngredients.forEach(ingredient => {
    if (INGREDIENT_CONFLICTS[ingredient]) {
      const forbidden = INGREDIENT_CONFLICTS[ingredient];
      const foundConflict = activeIngredients.find(i => forbidden.includes(i));
      
      if (foundConflict) {
        conflicts.push(`⚠️ Conflict Found: Do not use ${ingredient} and ${foundConflict} in the same routine.`);
      }
    }
  });

  return conflicts;
};

exports.getGlowScore = (analysis) => {
  // Logic to calculate 1-100 score based on AI data
  return Math.min(100, (analysis.hydration * 2) + (analysis.clarity * 3));
};
