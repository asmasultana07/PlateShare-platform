const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { cleanText, isValidId } = require('../utils/common');

async function list(req, res) {
  const items = await getDb().collection('categories').find().sort({ name: 1 }).toArray();
  res.json({ items: items.map((item) => ({ ...item, _id: item._id.toString() })) });
}

async function create(req, res) {
  const name = cleanText(req.body.name);
  if (name.length < 2 || name.length > 40) {
    return res.status(400).json({ message: 'Category name must be 2 to 40 characters.' });
  }

  const collection = getDb().collection('categories');
  const existing = await collection.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
  if (existing) return res.status(409).json({ message: 'That category already exists.' });

  const category = {
    name,
    slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    createdAt: new Date(),
  };
  const result = await collection.insertOne(category);
  res.status(201).json({ item: { ...category, _id: result.insertedId.toString() } });
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid category ID.' });
  const db = getDb();
  const category = await db.collection('categories').findOne({ _id: new ObjectId(req.params.id) });
  if (!category) return res.status(404).json({ message: 'Category not found.' });

  if (await db.collection('foods').countDocuments({ category: category.name })) {
    return res.status(409).json({ message: 'Move or delete food listings using this category first.' });
  }
  await db.collection('categories').deleteOne({ _id: category._id });
  res.json({ message: 'Category deleted.' });
}

module.exports = { list, create, remove };
