const { 
  PRODUCT_CATEGORIES, 
  ACTIVE_INGREDIENTS, 
  ISSUE_CATEGORIES,
  MEDICAL_DISCLAIMER 
} = require('../config/constants');

/**
 * Personalized Product Recommendation Service
 */
class RecommendationService {
  /**
   * Generate comprehensive skincare routine based on analysis
   */
  static generateRoutine(skinAnalysis) {
    const { skinType, issues } = skinAnalysis;
    
    const routine = {
      morning: this.getMorningRoutine(skinType, issues),
      night: this.getNightRoutine(skinType, issues),
      weekly: this.getWeeklyTreatments(skinType, issues),
      disclaimer: MEDICAL_DISCLAIMER
    };

    return routine;
  }

  /**
   * Morning skincare routine
   */
  static getMorningRoutine(skinType, issues) {
    const routine = [];

    // Step 1: Cleanser
    routine.push({
      step: 1,
      category: 'Facewash',
      product: this.getCleanserRecommendation(skinType, 'morning'),
      timing: 'AM',
      instructions: 'Gently massage onto damp skin for 30-60 seconds, then rinse with lukewarm water'
    });

    // Step 2: Toner (if needed)
    if (['Oily', 'Combination', 'Acne-prone'].includes(skinType) || 
        issues.some(i => i.category === ISSUE_CATEGORIES.ACNE)) {
      routine.push({
        step: 2,
        category: 'Toner',
        product: this.getTonerRecommendation(skinType, issues),
        timing: 'AM',
        instructions: 'Apply to clean skin with cotton pad or pat in with hands'
      });
    }

    // Step 3: Treatment Serum
    const treatmentSerum = this.getTreatmentSerum(issues, 'morning');
    if (treatmentSerum) {
      routine.push({
        step: 3,
        category: 'Serum',
        product: treatmentSerum,
        timing: 'AM',
        instructions: 'Apply 2-3 drops to face and neck, pat gently until absorbed'
      });
    }

    // Step 4: Moisturizer
    routine.push({
      step: 4,
      category: 'Moisturizer',
      product: this.getMoisturizerRecommendation(skinType, 'morning'),
      timing: 'AM',
      instructions: 'Apply evenly to face and neck while skin is still slightly damp'
    });

    // Step 5: Sunscreen (MANDATORY)
    routine.push({
      step: 5,
      category: 'Sunscreen',
      product: {
        name: 'Broad Spectrum SPF 50+ Sunscreen',
        activeIngredients: ['Zinc Oxide', 'Titanium Dioxide'],
        strength: 'SPF 50+',
        suitableFor: [skinType],
        precautions: ['Reapply every 2 hours', 'Apply 15 minutes before sun exposure'],
        expectedResults: 'Prevents sun damage, premature aging, and hyperpigmentation',
        priority: 'CRITICAL'
      },
      timing: 'AM',
      instructions: 'Apply generously (2 finger lengths) as the last step. Reapply every 2 hours if outdoors'
    });

    return routine;
  }

  /**
   * Night skincare routine
   */
  static getNightRoutine(skinType, issues) {
    const routine = [];

    // Step 1: Double Cleanse
    routine.push({
      step: 1,
      category: 'Oil Cleanser',
      product: {
        name: 'Oil-based Makeup Remover/Cleansing Oil',
        activeIngredients: ['Jojoba Oil', 'Grapeseed Oil'],
        suitableFor: [skinType],
        instructions: 'First cleanse to remove makeup, sunscreen, and oil-based impurities'
      },
      timing: 'PM',
      instructions: 'Massage onto dry skin for 1 minute, add water to emulsify, then rinse'
    });

    routine.push({
      step: 2,
      category: 'Facewash',
      product: this.getCleanserRecommendation(skinType, 'night'),
      timing: 'PM',
      instructions: 'Second cleanse to remove water-based impurities'
    });

    // Step 3: Treatment (Exfoliation or Active)
    const nightTreatment = this.getNightTreatment(issues, skinType);
    if (nightTreatment) {
      routine.push({
        step: 3,
        category: nightTreatment.category,
        product: nightTreatment.product,
        timing: 'PM',
        instructions: nightTreatment.instructions,
        frequency: nightTreatment.frequency
      });
    }

    // Step 4: Hydrating Serum
    routine.push({
      step: 4,
      category: 'Serum',
      product: {
        name: 'Hydrating Serum',
        activeIngredients: [ACTIVE_INGREDIENTS.HYALURONIC_ACID, ACTIVE_INGREDIENTS.NIACINAMIDE],
        strength: 'Niacinamide 5-10%',
        suitableFor: [skinType],
        benefits: 'Deep hydration, barrier repair, reduces inflammation'
      },
      timing: 'PM',
      instructions: 'Apply to damp skin for better absorption'
    });

    // Step 5: Night Moisturizer
    routine.push({
      step: 5,
      category: 'Night Cream',
      product: this.getMoisturizerRecommendation(skinType, 'night'),
      timing: 'PM',
      instructions: 'Apply as the last step to seal in all treatments'
    });

    // Step 6: Spot Treatment (if needed)
    if (issues.some(i => i.category === ISSUE_CATEGORIES.ACNE)) {
      routine.push({
        step: 6,
        category: 'Spot Treatment',
        product: {
          name: 'Acne Spot Treatment',
          activeIngredients: [ACTIVE_INGREDIENTS.SALICYLIC_ACID, ACTIVE_INGREDIENTS.BENZOYL_PEROXIDE],
          strength: 'Salicylic Acid 2% or Benzoyl Peroxide 2.5%',
          suitableFor: ['Acne-prone skin'],
          precautions: ['Apply only to active breakouts', 'Start with lower strength']
        },
        timing: 'PM',
        instructions: 'Dab directly onto active pimples after moisturizer',
        frequency: 'As needed'
      });
    }

    return routine;
  }

  /**
   * Weekly treatments
   */
  static getWeeklyTreatments(skinType, issues) {
    const treatments = [];

    // Face mask
    treatments.push({
      category: 'Face Mask',
      product: this.getFaceMaskRecommendation(skinType, issues),
      frequency: '1-2 times per week',
      instructions: 'Apply to clean skin, leave for 10-15 minutes, rinse thoroughly'
    });

    // Exfoliation (if not using daily actives)
    treatments.push({
      category: 'Exfoliator',
      product: this.getExfoliatorRecommendation(skinType, issues),
      frequency: '2-3 times per week',
      instructions: 'Use on clean skin, avoid eye area, follow with moisturizer',
      precautions: ['Do not use on same night as retinol', 'Start with once per week']
    });

    return treatments;
  }

  /**
   * Get cleanser recommendation
   */
  static getCleanserRecommendation(skinType, timing) {
    const cleansers = {
      'Oily': {
        name: 'Foaming Gel Cleanser',
        activeIngredients: [ACTIVE_INGREDIENTS.SALICYLIC_ACID, 'Tea Tree Oil'],
        strength: 'Salicylic Acid 0.5-2%'
      },
      'Dry': {
        name: 'Creamy Hydrating Cleanser',
        activeIngredients: [ACTIVE_INGREDIENTS.CERAMIDES, ACTIVE_INGREDIENTS.HYALURONIC_ACID],
        strength: 'Gentle, non-foaming'
      },
      'Combination': {
        name: 'Balanced Gel Cleanser',
        activeIngredients: [ACTIVE_INGREDIENTS.NIACINAMIDE, 'Glycerin'],
        strength: 'pH-balanced'
      },
      'Sensitive': {
        name: 'Gentle Micellar Cleanser',
        activeIngredients: ['Micellar Water', 'Allantoin'],
        strength: 'Fragrance-free, hypoallergenic'
      },
      'Normal': {
        name: 'Gentle Foaming Cleanser',
        activeIngredients: ['Glycerin', 'Panthenol'],
        strength: 'Balanced formula'
      }
    };

    const cleanser = cleansers[skinType] || cleansers['Normal'];
    return {
      ...cleanser,
      suitableFor: [skinType],
      benefits: 'Removes impurities without stripping natural oils'
    };
  }

  /**
   * Get toner recommendation
   */
  static getTonerRecommendation(skinType, issues) {
    const hasAcne = issues.some(i => i.category === ISSUE_CATEGORIES.ACNE);
    const hasPigmentation = issues.some(i => i.category === ISSUE_CATEGORIES.PIGMENTATION);

    if (hasAcne) {
      return {
        name: 'BHA Clarifying Toner',
        activeIngredients: [ACTIVE_INGREDIENTS.SALICYLIC_ACID, 'Witch Hazel'],
        strength: 'Salicylic Acid 0.5-2%',
        benefits: 'Unclogs pores, reduces breakouts'
      };
    }

    if (hasPigmentation) {
      return {
        name: 'Brightening Toner',
        activeIngredients: [ACTIVE_INGREDIENTS.NIACINAMIDE, ACTIVE_INGREDIENTS.ALPHA_ARBUTIN],
        strength: 'Niacinamide 5%',
        benefits: 'Evens skin tone, reduces dark spots'
      };
    }

    return {
      name: 'Hydrating Toner',
      activeIngredients: [ACTIVE_INGREDIENTS.HYALURONIC_ACID, 'Rose Water'],
      strength: 'Alcohol-free',
      benefits: 'Balances pH, preps skin for treatments'
    };
  }

  /**
   * Get treatment serum for morning
   */
  static getTreatmentSerum(issues, timing) {
    if (timing === 'morning') {
      const hasPigmentation = issues.some(i => i.category === ISSUE_CATEGORIES.PIGMENTATION);
      const hasAging = issues.some(i => i.category === ISSUE_CATEGORIES.AGING);

      if (hasPigmentation || hasAging) {
        return {
          name: 'Vitamin C Serum',
          activeIngredients: [ACTIVE_INGREDIENTS.VITAMIN_C, 'Ferulic Acid'],
          strength: 'L-Ascorbic Acid 10-20%',
          benefits: 'Brightens skin, antioxidant protection, boosts collagen',
          precautions: ['Use in morning only', 'Store in cool, dark place', 'Follow with sunscreen'],
          expectedResults: 'Visible brightening in 4-8 weeks'
        };
      }
    }

    return null;
  }

  /**
   * Get night treatment
   */
  static getNightTreatment(issues, skinType) {
    const hasAging = issues.some(i => i.category === ISSUE_CATEGORIES.AGING);
    const hasAcne = issues.some(i => i.category === ISSUE_CATEGORIES.ACNE);
    const hasTexture = issues.some(i => i.category === ISSUE_CATEGORIES.TEXTURE);

    if (hasAging) {
      return {
        category: 'Serum',
        product: {
          name: 'Retinol Serum',
          activeIngredients: [ACTIVE_INGREDIENTS.RETINOL, ACTIVE_INGREDIENTS.PEPTIDES],
          strength: 'Start with 0.25%, gradually increase to 1%',
          benefits: 'Reduces fine lines, improves texture, boosts collagen',
          precautions: [
            'Start 2x per week, gradually increase',
            'Always use sunscreen next morning',
            'May cause initial purging',
            'Avoid if pregnant/nursing'
          ],
          expectedResults: 'Visible improvement in 8-12 weeks'
        },
        instructions: 'Apply pea-sized amount to dry skin, wait 20 minutes before moisturizer',
        frequency: 'Start 2x per week, increase to nightly as tolerated'
      };
    }

    if (hasAcne || hasTexture) {
      return {
        category: 'Exfoliator',
        product: {
          name: 'AHA/BHA Exfoliating Serum',
          activeIngredients: [ACTIVE_INGREDIENTS.GLYCOLIC_ACID, ACTIVE_INGREDIENTS.SALICYLIC_ACID],
          strength: 'Glycolic Acid 5-10% + Salicylic Acid 2%',
          benefits: 'Exfoliates dead skin, unclogs pores, smooths texture',
          precautions: ['Start 2x per week', 'May cause tingling', 'Use sunscreen']
        },
        instructions: 'Apply to clean, dry skin, wait 10 minutes before next step',
        frequency: '2-3 times per week'
      };
    }

    return null;
  }

  /**
   * Get moisturizer recommendation
   */
  static getMoisturizerRecommendation(skinType, timing) {
    const moisturizers = {
      'Oily': {
        morning: {
          name: 'Lightweight Gel Moisturizer',
          activeIngredients: [ACTIVE_INGREDIENTS.NIACINAMIDE, ACTIVE_INGREDIENTS.HYALURONIC_ACID],
          texture: 'Gel, oil-free'
        },
        night: {
          name: 'Oil-Control Night Gel',
          activeIngredients: [ACTIVE_INGREDIENTS.NIACINAMIDE, 'Zinc PCA'],
          texture: 'Gel-cream'
        }
      },
      'Dry': {
        morning: {
          name: 'Rich Hydrating Cream',
          activeIngredients: [ACTIVE_INGREDIENTS.CERAMIDES, ACTIVE_INGREDIENTS.HYALURONIC_ACID, 'Squalane'],
          texture: 'Cream'
        },
        night: {
          name: 'Intensive Repair Night Cream',
          activeIngredients: [ACTIVE_INGREDIENTS.CERAMIDES, ACTIVE_INGREDIENTS.PEPTIDES, 'Shea Butter'],
          texture: 'Rich cream'
        }
      },
      'Combination': {
        morning: {
          name: 'Balanced Lotion',
          activeIngredients: [ACTIVE_INGREDIENTS.NIACINAMIDE, 'Glycerin'],
          texture: 'Lightweight lotion'
        },
        night: {
          name: 'Hydrating Night Cream',
          activeIngredients: [ACTIVE_INGREDIENTS.HYALURONIC_ACID, ACTIVE_INGREDIENTS.CERAMIDES],
          texture: 'Medium cream'
        }
      },
      'Sensitive': {
        morning: {
          name: 'Soothing Barrier Cream',
          activeIngredients: [ACTIVE_INGREDIENTS.CERAMIDES, 'Centella Asiatica', 'Colloidal Oatmeal'],
          texture: 'Gentle cream'
        },
        night: {
          name: 'Calming Night Cream',
          activeIngredients: [ACTIVE_INGREDIENTS.CERAMIDES, 'Allantoin', 'Bisabolol'],
          texture: 'Rich, soothing cream'
        }
      }
    };

    const skinTypeMoisturizers = moisturizers[skinType] || moisturizers['Combination'];
    const moisturizer = skinTypeMoisturizers[timing] || skinTypeMoisturizers.morning;

    return {
      ...moisturizer,
      suitableFor: [skinType],
      benefits: 'Locks in hydration, strengthens skin barrier'
    };
  }

  /**
   * Get face mask recommendation
   */
  static getFaceMaskRecommendation(skinType, issues) {
    const hasAcne = issues.some(i => i.category === ISSUE_CATEGORIES.ACNE);
    const hasPigmentation = issues.some(i => i.category === ISSUE_CATEGORIES.PIGMENTATION);

    if (hasAcne) {
      return {
        name: 'Clay Purifying Mask',
        activeIngredients: ['Kaolin Clay', 'Bentonite Clay', 'Tea Tree Oil'],
        benefits: 'Draws out impurities, controls oil, prevents breakouts'
      };
    }

    if (hasPigmentation) {
      return {
        name: 'Brightening Vitamin C Mask',
        activeIngredients: [ACTIVE_INGREDIENTS.VITAMIN_C, ACTIVE_INGREDIENTS.KOJIC_ACID],
        benefits: 'Brightens complexion, fades dark spots'
      };
    }

    return {
      name: 'Hydrating Sheet Mask',
      activeIngredients: [ACTIVE_INGREDIENTS.HYALURONIC_ACID, ACTIVE_INGREDIENTS.NIACINAMIDE],
      benefits: 'Intense hydration boost, plumps skin'
    };
  }

  /**
   * Get exfoliator recommendation
   */
  static getExfoliatorRecommendation(skinType, issues) {
    if (skinType === 'Sensitive') {
      return {
        name: 'Gentle PHA Exfoliator',
        activeIngredients: ['Gluconolactone (PHA)', 'Lactobionic Acid'],
        strength: 'PHA 8%',
        benefits: 'Gentle exfoliation without irritation'
      };
    }

    return {
      name: 'AHA/BHA Exfoliating Solution',
      activeIngredients: [ACTIVE_INGREDIENTS.GLYCOLIC_ACID, ACTIVE_INGREDIENTS.SALICYLIC_ACID],
      strength: 'AHA 7% + BHA 2%',
      benefits: 'Deep exfoliation, unclogs pores, smooths texture'
    };
  }

  /**
   * Get diet recommendations
   */
  static getDietRecommendations(issues) {
    const recommendations = {
      general: [
        'Drink 8-10 glasses of water daily',
        'Eat antioxidant-rich foods (berries, leafy greens)',
        'Include omega-3 fatty acids (salmon, walnuts, flaxseeds)',
        'Limit sugar and processed foods',
        'Eat probiotic-rich foods (yogurt, kimchi, sauerkraut)'
      ],
      vitamins: []
    };

    const hasAcne = issues.some(i => i.category === ISSUE_CATEGORIES.ACNE);
    const hasPigmentation = issues.some(i => i.category === ISSUE_CATEGORIES.PIGMENTATION);
    const hasAging = issues.some(i => i.category === ISSUE_CATEGORIES.AGING);

    if (hasAcne) {
      recommendations.general.push(
        'Reduce dairy intake (may trigger acne)',
        'Avoid high-glycemic foods',
        'Increase zinc-rich foods (pumpkin seeds, chickpeas)'
      );
      recommendations.vitamins.push('Zinc 15-30mg', 'Vitamin A', 'Omega-3');
    }

    if (hasPigmentation) {
      recommendations.general.push(
        'Eat vitamin C-rich foods (citrus, bell peppers)',
        'Include vitamin E sources (almonds, avocado)'
      );
      recommendations.vitamins.push('Vitamin C 1000mg', 'Vitamin E', 'Glutathione');
    }

    if (hasAging) {
      recommendations.general.push(
        'Increase collagen-boosting foods (bone broth, citrus)',
        'Eat antioxidant-rich foods',
        'Include healthy fats (avocado, olive oil)'
      );
      recommendations.vitamins.push('Collagen Peptides', 'Vitamin C', 'Vitamin E', 'Selenium');
    }

    // Always recommend these
    recommendations.vitamins.push('Vitamin B3 (Niacinamide)');

    return recommendations;
  }

  /**
   * Get lifestyle recommendations
   */
  static getLifestyleRecommendations(skinType, issues) {
    return {
      sleep: {
        recommendation: '7-9 hours of quality sleep',
        tips: [
          'Sleep on silk/satin pillowcase to reduce friction',
          'Keep bedroom cool and dark',
          'Establish consistent sleep schedule'
        ]
      },
      hydration: {
        recommendation: '8-10 glasses of water daily',
        tips: [
          'Drink water first thing in morning',
          'Keep water bottle with you',
          'Eat water-rich foods (cucumber, watermelon)'
        ]
      },
      sunProtection: {
        recommendation: 'Daily SPF 50+ sunscreen',
        tips: [
          'Reapply every 2 hours when outdoors',
          'Wear hat and sunglasses',
          'Seek shade during peak hours (10am-4pm)',
          'Use SPF even on cloudy days'
        ]
      },
      stress: {
        recommendation: 'Manage stress levels',
        tips: [
          'Practice meditation or yoga',
          'Regular exercise (30 min daily)',
          'Take breaks from screens',
          'Engage in hobbies you enjoy'
        ]
      },
      hygiene: {
        recommendation: 'Maintain good skincare hygiene',
        tips: [
          'Change pillowcases weekly',
          'Clean phone screen daily',
          'Wash makeup brushes weekly',
          'Don\'t touch face unnecessarily',
          'Remove makeup before bed'
        ]
      }
    };
  }
}

module.exports = RecommendationService;
