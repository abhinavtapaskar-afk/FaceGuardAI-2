const { INGREDIENT_CONFLICTS, ACTIVE_INGREDIENTS } = require('../config/constants');

/**
 * Safety Service for Ingredient Conflict Detection
 */
class SafetyService {
  /**
   * Check for ingredient conflicts in a routine
   */
  static checkRoutineConflicts(routine) {
    const conflicts = [];
    const warnings = [];

    // Extract all ingredients from routine
    const morningIngredients = this.extractIngredients(routine.morning);
    const nightIngredients = this.extractIngredients(routine.night);

    // Check morning routine conflicts
    const morningConflicts = this.findConflicts(morningIngredients);
    if (morningConflicts.length > 0) {
      conflicts.push({
        timing: 'Morning',
        conflicts: morningConflicts
      });
    }

    // Check night routine conflicts
    const nightConflicts = this.findConflicts(nightIngredients);
    if (nightConflicts.length > 0) {
      conflicts.push({
        timing: 'Night',
        conflicts: nightConflicts
      });
    }

    // Check cross-timing conflicts (e.g., Retinol at night + Vitamin C in morning)
    const crossConflicts = this.checkCrossTimingConflicts(morningIngredients, nightIngredients);
    if (crossConflicts.length > 0) {
      warnings.push(...crossConflicts);
    }

    // Check for over-exfoliation
    const exfoliationWarning = this.checkExfoliationFrequency(routine);
    if (exfoliationWarning) {
      warnings.push(exfoliationWarning);
    }

    // Check for missing sunscreen
    const sunscreenWarning = this.checkSunscreen(routine.morning);
    if (sunscreenWarning) {
      warnings.push(sunscreenWarning);
    }

    return {
      safe: conflicts.length === 0,
      conflicts,
      warnings,
      recommendations: this.generateSafetyRecommendations(conflicts, warnings)
    };
  }

  /**
   * Extract ingredients from routine steps
   */
  static extractIngredients(routineSteps) {
    const ingredients = [];
    
    routineSteps.forEach(step => {
      if (step.product && step.product.activeIngredients) {
        step.product.activeIngredients.forEach(ingredient => {
          ingredients.push({
            name: ingredient,
            category: step.category,
            step: step.step
          });
        });
      }
    });

    return ingredients;
  }

  /**
   * Find conflicts between ingredients
   */
  static findConflicts(ingredients) {
    const conflicts = [];

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const ingredient1 = ingredients[i].name;
        const ingredient2 = ingredients[j].name;

        const conflict = this.checkIngredientPair(ingredient1, ingredient2);
        if (conflict) {
          conflicts.push({
            ingredient1: {
              name: ingredient1,
              category: ingredients[i].category,
              step: ingredients[i].step
            },
            ingredient2: {
              name: ingredient2,
              category: ingredients[j].category,
              step: ingredients[j].step
            },
            severity: conflict.severity,
            reason: conflict.reason,
            solution: conflict.solution
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two ingredients conflict
   */
  static checkIngredientPair(ingredient1, ingredient2) {
    // Normalize ingredient names for comparison
    const normalize = (ing) => ing.toLowerCase().trim();
    const ing1 = normalize(ingredient1);
    const ing2 = normalize(ingredient2);

    // Retinol + AHA/BHA
    if ((ing1.includes('retinol') && (ing2.includes('aha') || ing2.includes('glycolic') || ing2.includes('lactic'))) ||
        (ing2.includes('retinol') && (ing1.includes('aha') || ing1.includes('glycolic') || ing1.includes('lactic')))) {
      return {
        severity: 'HIGH',
        reason: 'Retinol and AHA can cause severe irritation when used together',
        solution: 'Use Retinol on different nights than AHA. Alternate: Retinol Mon/Wed/Fri, AHA Tue/Thu/Sat'
      };
    }

    if ((ing1.includes('retinol') && ing2.includes('salicylic')) ||
        (ing2.includes('retinol') && ing1.includes('salicylic'))) {
      return {
        severity: 'HIGH',
        reason: 'Retinol and BHA (Salicylic Acid) can cause irritation and dryness',
        solution: 'Use on alternate nights or use BHA in morning and Retinol at night'
      };
    }

    // Retinol + Vitamin C
    if ((ing1.includes('retinol') && ing2.includes('vitamin c')) ||
        (ing2.includes('retinol') && ing1.includes('vitamin c'))) {
      return {
        severity: 'MEDIUM',
        reason: 'Different pH requirements may reduce effectiveness',
        solution: 'Use Vitamin C in morning and Retinol at night for best results'
      };
    }

    // Benzoyl Peroxide + Retinol
    if ((ing1.includes('benzoyl') && ing2.includes('retinol')) ||
        (ing2.includes('benzoyl') && ing1.includes('retinol'))) {
      return {
        severity: 'HIGH',
        reason: 'Benzoyl Peroxide can oxidize and deactivate Retinol',
        solution: 'Use Benzoyl Peroxide in morning and Retinol at night, or on alternate days'
      };
    }

    // Vitamin C + Niacinamide (debated, but safer to separate)
    if ((ing1.includes('vitamin c') && ing2.includes('niacinamide')) ||
        (ing2.includes('vitamin c') && ing1.includes('niacinamide'))) {
      return {
        severity: 'LOW',
        reason: 'May cause flushing in sensitive skin (though modern formulations are usually fine)',
        solution: 'If irritation occurs, use Vitamin C in morning and Niacinamide at night'
      };
    }

    // Multiple AHAs
    if ((ing1.includes('glycolic') || ing1.includes('lactic')) && 
        (ing2.includes('glycolic') || ing2.includes('lactic')) &&
        ing1 !== ing2) {
      return {
        severity: 'MEDIUM',
        reason: 'Using multiple AHAs can cause over-exfoliation',
        solution: 'Choose one AHA product and use it consistently'
      };
    }

    // AHA + BHA for beginners
    if ((ing1.includes('glycolic') || ing1.includes('lactic')) && ing2.includes('salicylic')) {
      return {
        severity: 'MEDIUM',
        reason: 'Combining AHA and BHA can be too strong for beginners',
        solution: 'Start with one exfoliant, add the other after 4-6 weeks if needed'
      };
    }

    return null;
  }

  /**
   * Check for cross-timing conflicts
   */
  static checkCrossTimingConflicts(morningIngredients, nightIngredients) {
    const warnings = [];

    // Check if using strong actives both AM and PM
    const morningActives = morningIngredients.filter(i => 
      i.name.toLowerCase().includes('retinol') ||
      i.name.toLowerCase().includes('aha') ||
      i.name.toLowerCase().includes('bha') ||
      i.name.toLowerCase().includes('vitamin c')
    );

    const nightActives = nightIngredients.filter(i => 
      i.name.toLowerCase().includes('retinol') ||
      i.name.toLowerCase().includes('aha') ||
      i.name.toLowerCase().includes('bha')
    );

    if (morningActives.length > 0 && nightActives.length > 1) {
      warnings.push({
        type: 'OVER_EXFOLIATION',
        severity: 'MEDIUM',
        message: 'Using multiple strong actives both morning and night may cause irritation',
        recommendation: 'Consider reducing frequency or alternating actives on different days'
      });
    }

    return warnings;
  }

  /**
   * Check exfoliation frequency
   */
  static checkExfoliationFrequency(routine) {
    let exfoliationCount = 0;

    // Count exfoliation in morning routine
    routine.morning.forEach(step => {
      if (step.product && step.product.activeIngredients) {
        const hasExfoliant = step.product.activeIngredients.some(ing => 
          ing.toLowerCase().includes('aha') ||
          ing.toLowerCase().includes('bha') ||
          ing.toLowerCase().includes('glycolic') ||
          ing.toLowerCase().includes('salicylic') ||
          ing.toLowerCase().includes('lactic')
        );
        if (hasExfoliant) exfoliationCount++;
      }
    });

    // Count exfoliation in night routine
    routine.night.forEach(step => {
      if (step.product && step.product.activeIngredients) {
        const hasExfoliant = step.product.activeIngredients.some(ing => 
          ing.toLowerCase().includes('aha') ||
          ing.toLowerCase().includes('bha') ||
          ing.toLowerCase().includes('glycolic') ||
          ing.toLowerCase().includes('salicylic') ||
          ing.toLowerCase().includes('lactic') ||
          ing.toLowerCase().includes('retinol')
        );
        if (hasExfoliant) exfoliationCount++;
      }
    });

    // Count weekly treatments
    if (routine.weekly) {
      routine.weekly.forEach(treatment => {
        if (treatment.category === 'Exfoliator') {
          exfoliationCount += 2; // Assuming 2x per week
        }
      });
    }

    if (exfoliationCount > 7) {
      return {
        type: 'OVER_EXFOLIATION',
        severity: 'HIGH',
        message: 'Your routine includes too much exfoliation, which can damage your skin barrier',
        recommendation: 'Reduce exfoliation to 3-4 times per week maximum. Start slow and increase gradually.'
      };
    }

    return null;
  }

  /**
   * Check for sunscreen in morning routine
   */
  static checkSunscreen(morningRoutine) {
    const hasSunscreen = morningRoutine.some(step => 
      step.category === 'Sunscreen' || 
      (step.product && step.product.name && step.product.name.toLowerCase().includes('sunscreen'))
    );

    if (!hasSunscreen) {
      return {
        type: 'MISSING_SUNSCREEN',
        severity: 'CRITICAL',
        message: 'Sunscreen is MANDATORY, especially when using active ingredients',
        recommendation: 'Always apply SPF 50+ broad spectrum sunscreen as the last step of your morning routine'
      };
    }

    return null;
  }

  /**
   * Generate safety recommendations
   */
  static generateSafetyRecommendations(conflicts, warnings) {
    const recommendations = [];

    if (conflicts.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Ingredient Conflicts Detected',
        message: 'Your routine contains ingredients that should not be used together. Please review the conflicts and adjust your routine.',
        action: 'Separate conflicting ingredients by time of day or alternate days'
      });
    }

    if (warnings.length > 0) {
      warnings.forEach(warning => {
        if (warning.severity === 'CRITICAL') {
          recommendations.push({
            priority: 'CRITICAL',
            title: warning.type.replace(/_/g, ' '),
            message: warning.message,
            action: warning.recommendation
          });
        }
      });
    }

    // General safety tips
    recommendations.push({
      priority: 'INFO',
      title: 'Patch Test New Products',
      message: 'Always patch test new products on your inner arm for 24-48 hours before applying to your face',
      action: 'Test one new product at a time'
    });

    recommendations.push({
      priority: 'INFO',
      title: 'Start Slow with Actives',
      message: 'When introducing active ingredients (Retinol, AHA, BHA), start with lower concentrations and use 2-3 times per week',
      action: 'Gradually increase frequency as your skin builds tolerance'
    });

    recommendations.push({
      priority: 'INFO',
      title: 'Listen to Your Skin',
      message: 'If you experience persistent redness, burning, or irritation, stop using the product and consult a dermatologist',
      action: 'Take breaks from actives if your skin feels sensitive'
    });

    return recommendations;
  }

  /**
   * Validate product safety for skin type
   */
  static validateProductSafety(product, skinType, existingConditions = []) {
    const warnings = [];

    // Check if product is suitable for skin type
    if (product.suitableFor && !product.suitableFor.includes(skinType)) {
      warnings.push({
        severity: 'MEDIUM',
        message: `This product may not be ideal for ${skinType} skin`,
        recommendation: 'Consider alternatives specifically formulated for your skin type'
      });
    }

    // Check for common irritants in sensitive skin
    if (skinType === 'Sensitive' && product.activeIngredients) {
      const potentialIrritants = ['Fragrance', 'Alcohol', 'Essential Oils', 'Retinol'];
      const foundIrritants = product.activeIngredients.filter(ing => 
        potentialIrritants.some(irritant => ing.toLowerCase().includes(irritant.toLowerCase()))
      );

      if (foundIrritants.length > 0) {
        warnings.push({
          severity: 'HIGH',
          message: `Product contains potential irritants for sensitive skin: ${foundIrritants.join(', ')}`,
          recommendation: 'Patch test carefully or choose fragrance-free, gentle alternatives'
        });
      }
    }

    // Check for pregnancy/nursing warnings
    if (product.activeIngredients) {
      const pregnancyWarnings = ['Retinol', 'Retinoid', 'Salicylic Acid'];
      const foundWarnings = product.activeIngredients.filter(ing => 
        pregnancyWarnings.some(warning => ing.toLowerCase().includes(warning.toLowerCase()))
      );

      if (foundWarnings.length > 0) {
        warnings.push({
          severity: 'CRITICAL',
          message: `Product contains ingredients not recommended during pregnancy/nursing: ${foundWarnings.join(', ')}`,
          recommendation: 'Consult your healthcare provider before use if pregnant or nursing'
        });
      }
    }

    return {
      safe: warnings.filter(w => w.severity === 'HIGH' || w.severity === 'CRITICAL').length === 0,
      warnings
    };
  }
}

module.exports = SafetyService;
