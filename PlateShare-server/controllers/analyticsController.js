const { getDb } = require('../config/database');

function monthPipeline(match) {
  return [
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        value: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', value: 1 } },
  ];
}

function labelPipeline(match, field) {
  return [
    { $match: match },
    { $group: { _id: `$${field}`, value: { $sum: 1 } } },
    { $sort: { value: -1, _id: 1 } },
    { $project: { _id: 0, label: '$_id', value: 1 } },
  ];
}

async function user(req, res) {
  const db = getDb();
  const userId = req.user._id;
  const ownedFoodFilter = { ownerId: userId };
  const requestFilter = { $or: [{ userId }, { foodOwnerId: userId }] };
  const [foodByCategory, foodTrend, requestStatus, totals] = await Promise.all([
    db.collection('foods').aggregate(labelPipeline(ownedFoodFilter, 'category')).toArray(),
    db.collection('foods').aggregate(monthPipeline(ownedFoodFilter)).toArray(),
    db.collection('foodRequests').aggregate(labelPipeline(requestFilter, 'status')).toArray(),
    db.collection('foods').aggregate([
      { $match: ownedFoodFilter },
      { $group: { _id: null, foods: { $sum: 1 }, servings: { $sum: '$quantity' } } },
    ]).next(),
  ]);

  res.json({
    scope: 'user',
    totals: {
      foods: totals?.foods || 0,
      servings: totals?.servings || 0,
      requests: requestStatus.reduce((sum, item) => sum + item.value, 0),
    },
    charts: { foodByCategory, foodTrend, requestStatus },
  });
}

async function admin(req, res) {
  const db = getDb();
  const [totalUsers, totalFoods, availableFoods, totalRequests, foodByCategory, foodTrend, requestStatus, userRoles] = await Promise.all([
    db.collection('users').countDocuments(),
    db.collection('foods').countDocuments(),
    db.collection('foods').countDocuments({ status: 'available' }),
    db.collection('foodRequests').countDocuments(),
    db.collection('foods').aggregate(labelPipeline({}, 'category')).toArray(),
    db.collection('foods').aggregate(monthPipeline({})).toArray(),
    db.collection('foodRequests').aggregate(labelPipeline({}, 'status')).toArray(),
    db.collection('users').aggregate(labelPipeline({}, 'role')).toArray(),
  ]);

  res.json({
    scope: 'admin',
    totals: { users: totalUsers, foods: totalFoods, availableFoods, requests: totalRequests },
    charts: { foodByCategory, foodTrend, requestStatus, userRoles },
  });
}

module.exports = { user, admin };
