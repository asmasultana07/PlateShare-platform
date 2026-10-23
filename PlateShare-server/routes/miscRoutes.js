const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/miscController');
const analytics = require('../controllers/analyticsController');

const router = express.Router();
router.get('/health', controller.health);
router.get('/stats', asyncRoute(controller.stats));
router.post('/contact', asyncRoute(controller.contact));
router.get('/analytics', requireAuth, asyncRoute(analytics.user));

module.exports = router;
