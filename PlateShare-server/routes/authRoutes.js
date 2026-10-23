const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/authController');

const router = express.Router();
router.post('/register', asyncRoute(controller.register));
router.post('/login', asyncRoute(controller.login));
router.post('/google', asyncRoute(controller.googleLogin));
router.get('/me', requireAuth, controller.current);
router.patch('/profile', requireAuth, asyncRoute(controller.updateProfile));
router.patch('/password', requireAuth, asyncRoute(controller.updatePassword));

module.exports = router;
