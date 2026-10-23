const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const controller = require('../controllers/adminController');
const analytics = require('../controllers/analyticsController');
const contacts = require('../controllers/contactController');

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.get('/users', asyncRoute(controller.listUsers));
router.patch('/users/:id/role', asyncRoute(controller.updateUserRole));
router.get('/analytics', asyncRoute(analytics.admin));
router.get('/contacts', asyncRoute(contacts.list));

module.exports = router;
