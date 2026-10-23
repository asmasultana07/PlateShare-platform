const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { cleanText, isValidId, publicRequest } = require('../utils/common');

async function listMine(req, res) {
  const filter = req.user.role === 'admin'
    ? {}
    : { $or: [{ userId: req.user._id }, { foodOwnerId: req.user._id }] };
  const items = await getDb().collection('foodRequests').find(filter).sort({ createdAt: -1 }).toArray();
  res.json({ items: items.map(publicRequest) });
}

async function listForFood(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid food ID.' });
  const db = getDb();
  const food = await db.collection('foods').findOne({ _id: new ObjectId(req.params.id) });
  if (!food) return res.status(404).json({ message: 'Food listing not found.' });
  if (req.user.role !== 'admin' && food.ownerId !== req.user._id) {
    return res.status(403).json({ message: 'Only the food owner can view these requests.' });
  }

  const items = await db.collection('foodRequests').find({ foodId: food._id.toString() }).sort({ createdAt: -1 }).toArray();
  res.json({ items: items.map(publicRequest) });
}

async function create(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid food ID.' });
  const db = getDb();
  const food = await db.collection('foods').findOne({ _id: new ObjectId(req.params.id), status: 'available' });
  if (!food) return res.status(404).json({ message: 'This food is no longer available.' });
  if (food.ownerId === req.user._id) return res.status(400).json({ message: 'You cannot request your own food.' });

  const requests = db.collection('foodRequests');
  const existing = await requests.findOne({ foodId: food._id.toString(), userId: req.user._id, status: 'pending' });
  if (existing) return res.status(409).json({ message: 'You already have a pending request for this food.' });

  const request = {
    foodId: food._id.toString(),
    foodTitle: food.title,
    foodOwnerId: food.ownerId,
    userId: req.user._id,
    userEmail: req.user.email,
    name: req.user.name,
    photoURL: req.user.photoURL,
    message: cleanText(req.body.message).slice(0, 500),
    status: 'pending',
    createdAt: new Date(),
  };
  const result = await requests.insertOne(request);
  res.status(201).json({ item: publicRequest({ ...request, _id: result.insertedId }) });
}

async function updateStatus(req, res) {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID.' });
  const status = req.body.status;
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be accepted or rejected.' });
  }

  const collection = getDb().collection('foodRequests');
  const request = await collection.findOne({ _id: new ObjectId(req.params.id) });
  if (!request) return res.status(404).json({ message: 'Food request not found.' });
  if (req.user.role !== 'admin' && request.foodOwnerId !== req.user._id) {
    return res.status(403).json({ message: 'Only the food owner can update this request.' });
  }

  await collection.updateOne({ _id: request._id }, { $set: { status, updatedAt: new Date() } });
  res.json({ item: publicRequest({ ...request, status }) });
}

module.exports = { listMine, listForFood, create, updateStatus };
