const express = require('express');
const router = express.Router();
const scanController = require('../../controllers/scanController');
const { checkTierLimit } = require('../../middleware/tierGuard');
const { trackConsent } = require('../../middleware/compliance');

// This route uses Tier Gating AND Compliance Tracking!
router.post('/analyze', trackConsent, checkTierLimit, scanController.performAnalysis);

module.exports = router;
