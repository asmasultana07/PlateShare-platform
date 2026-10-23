const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/requestController');

const router = express.Router();
router.get('/mine', requireAuth, asyncRoute(controller.listMine));
router.patch('/:id', requireAuth, asyncRoute(controller.updateStatus));

module.exports = router;
