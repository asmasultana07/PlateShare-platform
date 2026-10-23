const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { escapeRegex, isValidId, publicUser } = require('../utils/common');

function buildUserFilter(search) {
  const value = typeof search === 'string' ? search.trim().slice(0, 100) : '';
  if (!value) return {};
  const pattern = new RegExp(escapeRegex(value), 'i');
  return { $or: [{ name: pattern }, { email: pattern }] };
}

async function listUsers(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const filter = buildUserFilter(req.query.search);
  const collection = getDb().collection('users');
  const [items, total] = await Promise.all([
    collection.find(filter, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);
  res.json({ items: items.map(publicUser), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  if (!isValidId(id)) return res.status(400).json({ message: 'Invalid user ID.' });
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Role must be user or admin.' });
  if (id === req.user._id && role !== 'admin') return res.status(400).json({ message: 'You cannot remove your own admin access.' });

  const result = await getDb().collection('users').updateOne({ _id: new ObjectId(id) }, { $set: { role } });
  if (!result.matchedCount) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User role updated.' });
}

module.exports = { buildUserFilter, listUsers, updateUserRole };
