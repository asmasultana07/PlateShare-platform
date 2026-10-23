const { ObjectId } = require('mongodb');

const cleanText = (value) => typeof value === 'string' ? value.trim() : '';
const isValidId = (id) => ObjectId.isValid(id);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isSafeImageSource = (value) =>
  typeof value === 'string' &&
  ( /^https?:\/\//i.test(value) || /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(value) );

function publicFood(food) {
  const { legacyId, ownerEmail, ...safeFood } = food;
  return { ...safeFood, _id: food._id.toString() };
}

function publicRequest(request) {
  return { ...request, _id: request._id.toString() };
}

function publicUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || '',
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { cleanText, isValidId, escapeRegex, isSafeImageSource, publicFood, publicRequest, publicUser };
