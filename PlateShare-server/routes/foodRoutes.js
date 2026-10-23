const express = require('express');
const asyncRoute = require('../middleware/asyncRoute');
const { requireAuth } = require('../middleware/auth');
const foods = require('../controllers/foodController');
const requests = require('../controllers/requestController');

const router = express.Router();
router.get('/', asyncRoute(foods.list));
router.get('/mine', requireAuth, asyncRoute(foods.listMine));
router.post('/', requireAuth, asyncRoute(foods.create));
router.get('/:id/requests', requireAuth, asyncRoute(requests.listForFood));
router.post('/:id/requests', requireAuth, asyncRoute(requests.create));
router.get('/:id', asyncRoute(foods.getById));
router.patch('/:id', requireAuth, asyncRoute(foods.update));
router.delete('/:id', requireAuth, asyncRoute(foods.remove));

module.exports = router;
