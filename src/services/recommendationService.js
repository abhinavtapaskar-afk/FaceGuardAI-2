const PRODUCT_CATALOG = require('../utils/productData');

exports.getRecommendations = (concerns) => {
  // Take the first concern found by AI and find a matching product
  const primaryConcern = concerns[0]?.toUpperCase() || 'DRYNESS';
  const product = PRODUCT_CATALOG[primaryConcern] || PRODUCT_CATALOG.DRYNESS;

  return {
    ...product,
    usage: "Apply at night after cleansing.",
    disclaimer: "Always patch test before full application."
  };
};
