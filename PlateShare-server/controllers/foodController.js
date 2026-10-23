const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { cleanText, escapeRegex, isValidId, publicFood } = require('../utils/common');
const { validateFood } = require('../utils/validation');

async function list(req, res) {
  const search = cleanText(req.query.search);
  const category = cleanText(req.query.category);
  const location = cleanText(req.query.location);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const filter = { status: 'available' };

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }, { location: pattern }];
  }
  if (category && category !== 'All categories') filter.category = category;
  if (location) filter.location = new RegExp(escapeRegex(location), 'i');

  const sort = req.query.sort === 'quantity'
    ? { quantity: -1, createdAt: -1 }
    : req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
  const collection = getDb().collection('foods');
  const [items, total] = await Promise.all([
    collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);

  res.json({ items: items.map(publicFood), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

async function listMine(req, res) {
  const filter = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
  const items = await getDb().collection('foods').find(filter).sort({ createdAt: -1 }).toArray();
  res.json({ items: items.map(publicFood) });
}

async function getById(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid food ID.' });
  const food = await getDb().collection('foods').findOne({ _id: new ObjectId(req.params.id) });
  if (!food) return res.status(404).json({ message: 'Food listing not found.' });
  res.json({ item: publicFood(food) });
}

async function create(req, res) {
  const categories = await getDb().collection('categories').distinct('name');
  const { food, error } = validateFood(req.body, categories);
  if (error) return res.status(400).json({ message: error });

  const newFood = {
    ...food,
    ownerId: req.user._id,
    ownerName: req.user.name,
    ownerEmail: req.user.email,
    status: 'available',
    createdAt: new Date(),
  };
  const result = await getDb().collection('foods').insertOne(newFood);
  res.status(201).json({ item: publicFood({ ...newFood, _id: result.insertedId }) });
}

async function update(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid food ID.' });
  const collection = getDb().collection('foods');
  const existing = await collection.findOne({ _id: new ObjectId(req.params.id) });
  if (!existing) return res.status(404).json({ message: 'Food listing not found.' });
  if (req.user.role !== 'admin' && existing.ownerId !== req.user._id) {
    return res.status(403).json({ message: 'Only the food owner can update this listing.' });
  }

  const categories = await getDb().collection('categories').distinct('name');
  const { food, error } = validateFood({ ...existing, ...req.body }, categories);
  if (error) return res.status(400).json({ message: error });
  await collection.updateOne({ _id: existing._id }, { $set: food });
  res.json({ item: publicFood({ ...existing, ...food }) });
}

async function remove(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid food ID.' });
  const db = getDb();
  const collection = db.collection('foods');
  const food = await collection.findOne({ _id: new ObjectId(req.params.id) });
  if (!food) return res.status(404).json({ message: 'Food listing not found.' });
  if (req.user.role !== 'admin' && food.ownerId !== req.user._id) {
    return res.status(403).json({ message: 'Only the food owner can delete this listing.' });
  }

  await Promise.all([
    collection.deleteOne({ _id: food._id }),
    db.collection('foodRequests').deleteMany({ foodId: food._id.toString() }),
  ]);
  res.json({ message: 'Food listing deleted.' });
}

module.exports = { list, listMine, getById, create, update, remove };
