/**
 * FaceGuard AI - Product & Affiliate Catalog
 * Maps concerns to recommended active ingredients and links.
 */

const PRODUCT_CATALOG = {
  ACNE: {
    recommendation: "Salicylic Acid Cleanser",
    active: "BHA",
    amazonLink: "https://amazon.com/example-bha",
    flipkartLink: "https://flipkart.com/example-bha"
  },
  DARK_SPOTS: {
    recommendation: "Niacinamide Serum",
    active: "Vitamin B3",
    amazonLink: "https://amazon.com/example-niacinamide",
    flipkartLink: "https://flipkart.com/example-niacinamide"
  },
  DRYNESS: {
    recommendation: "Hyaluronic Acid Moisturizer",
    active: "Hyaluronic Acid",
    amazonLink: "https://amazon.com/example-ha",
    flipkartLink: "https://flipkart.com/example-ha"
  }
};

module.exports = PRODUCT_CATALOG;
