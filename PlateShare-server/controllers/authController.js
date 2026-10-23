const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { cleanText, isSafeImageSource, publicUser } = require('../utils/common');

const googleClient = new OAuth2Client();

async function register(req, res) {
  const name = cleanText(req.body.name);
  const email = cleanText(req.body.email).toLowerCase();
  const password = req.body.password;

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a name and a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const user = {
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    photoURL: '',
    role: 'user',
    createdAt: new Date(),
  };
  const result = await getDb().collection('users').insertOne(user);
  user._id = result.insertedId;
  const safeUser = publicUser(user);
  const token = jwt.sign({ sub: safeUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: safeUser });
}

async function login(req, res) {
  const email = cleanText(req.body.email).toLowerCase();
  const user = await getDb().collection('users').findOne({ email });
  if (!user || typeof req.body.password !== 'string' || !user.passwordHash || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  const safeUser = publicUser(user);
  const token = jwt.sign({ sub: safeUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: safeUser });
}

async function googleLogin(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const credential = req.body.credential;
  if (!clientId) {
    return res.status(503).json({ message: 'Google sign-in is not configured.' });
  }
  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ message: 'Google credential is required.' });
  }

  let profile;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
    profile = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Google sign-in could not be verified.' });
  }

  const email = cleanText(profile?.email).toLowerCase();
  const name = cleanText(profile?.name);
  if (!email || !name || profile.email_verified !== true || !profile.sub) {
    return res.status(401).json({ message: 'Google must provide a verified email address.' });
  }

  const users = getDb().collection('users');
  let user = await users.findOne({ googleId: profile.sub });
  if (!user) {
    user = await users.findOne({ email });
    if (user) {
      if (user.googleId && user.googleId !== profile.sub) {
        return res.status(409).json({ message: 'This email is linked to another Google account.' });
      }
      const updates = { googleId: profile.sub };
      if (!user.photoURL && profile.picture) updates.photoURL = profile.picture;
      await users.updateOne({ _id: user._id }, { $set: updates });
      user = { ...user, ...updates };
    } else {
      user = {
        name,
        email,
        googleId: profile.sub,
        passwordHash: null,
        photoURL: profile.picture || '',
        role: 'user',
        createdAt: new Date(),
      };
      const result = await users.insertOne(user);
      user._id = result.insertedId;
    }
  }

  const safeUser = publicUser(user);
  const token = jwt.sign({ sub: safeUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: safeUser });
}

function current(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res) {
  const updates = {};
  if (req.body.name !== undefined) {
    const name = cleanText(req.body.name);
    if (name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });
    updates.name = name;
  }
  if (req.body.photoURL !== undefined) {
    if (!isSafeImageSource(req.body.photoURL) || req.body.photoURL.length > 2_000_000) {
      return res.status(400).json({ message: 'Profile image must be a safe URL or a supported base64 image under 2 MB.' });
    }
    updates.photoURL = req.body.photoURL;
  }
  if (!Object.keys(updates).length) return res.status(400).json({ message: 'No profile changes were provided.' });

  await getDb().collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: updates });
  res.json({ user: { ...req.user, ...updates } });
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  const users = getDb().collection('users');
  const user = await users.findOne({ _id: new ObjectId(req.user._id) });
  if (!user?.passwordHash) {
    return res.status(400).json({ message: 'This Google account does not have a local password.' });
  }
  if (!(await bcrypt.compare(currentPassword || '', user.passwordHash))) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await users.updateOne({ _id: user._id }, { $set: { passwordHash } });
  res.json({ message: 'Password updated.' });
}

module.exports = { register, login, googleLogin, current, updateProfile, updatePassword };
