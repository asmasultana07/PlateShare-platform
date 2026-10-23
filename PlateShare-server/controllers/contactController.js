const { getDb } = require('../config/database');

async function list(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
  const collection = getDb().collection('contacts');
  const [items, total] = await Promise.all([
    collection.find({}, { projection: { name: 1, email: 1, message: 1, createdAt: 1 } })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(),
  ]);
  res.json({
    items: items.map((item) => ({ ...item, _id: item._id.toString() })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

module.exports = { list };
