const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { isValidId } = require('../utils/common');

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }

  if (!isValidId(payload.sub)) {
    return res.status(401).json({ message: 'Your session is invalid. Please log in again.' });
  }

  const user = await getDb().collection('users').findOne({ _id: new ObjectId(payload.sub) });
  if (!user) return res.status(401).json({ message: 'Your account could not be found.' });

  req.user = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || '',
    role: user.role,
    createdAt: user.createdAt,
  };
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access is required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
