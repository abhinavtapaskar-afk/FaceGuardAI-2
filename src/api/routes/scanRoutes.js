const express = require('express');
const router = express.Router();
const ScanController = require('../../controllers/scanController');
const { authenticate } = require('../../middleware/auth');
const { checkScanLimit } = require('../../middleware/tierCheck');
const { scanLimiter } = require('../../middleware/rateLimiter');

// All scan routes require authentication
router.use(authenticate);

// Analyze skin (with tier-based limits)
router.post('/analyze', scanLimiter, checkScanLimit, ScanController.analyzeSkin);

// Get scan history
router.get('/history', ScanController.getScanHistory);

// Get specific scan details
router.get('/:scanId', ScanController.getScanDetails);

// Get progress report
router.get('/progress/report', ScanController.getProgressReport);

// Compare two scans
router.get('/progress/compare', ScanController.compareScans);

// Get statistics
router.get('/stats/overview', ScanController.getStatistics);

module.exports = router;
