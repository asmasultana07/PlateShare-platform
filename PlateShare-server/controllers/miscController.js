const { getDb } = require('../config/database');
const { cleanText } = require('../utils/common');

async function health(req, res) {
  res.json({ status: 'ok', database: 'connected' });
}

async function stats(req, res) {
  const db = getDb();
  const [foodSummary, requests] = await Promise.all([
    db.collection('foods').aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, totalFoods: { $sum: 1 }, servings: { $sum: '$quantity' }, locations: { $addToSet: '$location' } } },
    ]).next(),
    db.collection('foodRequests').countDocuments(),
  ]);

  res.json({
    totalFoods: foodSummary?.totalFoods || 0,
    servings: foodSummary?.servings || 0,
    neighborhoods: foodSummary?.locations.length || 0,
    requests,
  });
}

async function contact(req, res) {
  const name = cleanText(req.body.name);
  const email = cleanText(req.body.email).toLowerCase();
  const message = cleanText(req.body.message);
  if (name.length < 2 || name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 5_000) {
    return res.status(400).json({ message: 'Enter your name, a valid email, and a message of at least 10 characters.' });
  }

  await getDb().collection('contacts').insertOne({ name, email, message, createdAt: new Date() });
  res.status(201).json({ message: 'Your message has been received.' });
}

module.exports = { health, stats, contact };
