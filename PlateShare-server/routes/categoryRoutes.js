const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const controller = require('../controllers/categoryController');

const router = express.Router();
router.get('/', asyncRoute(controller.list));
router.post('/', requireAuth, requireAdmin, asyncRoute(controller.create));
router.delete('/:id', requireAuth, requireAdmin, asyncRoute(controller.remove));

module.exports = router;
