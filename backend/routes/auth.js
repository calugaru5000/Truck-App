const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, name, phone, user_type } = req.body;
  if (!email || !password || !name || !user_type) {
    return res.status(400).json({ error: 'email, password, name, and user_type are required' });
  }
  if (!['owner', 'customer'].includes(user_type)) {
    return res.status(400).json({ error: 'user_type must be owner or customer' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, phone, user_type) VALUES (?, ?, ?, ?, ?)'
  ).run(email, password_hash, name, phone || null, user_type);

  const token = jwt.sign(
    { id: result.lastInsertRowid, email, name, user_type },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.status(201).json({ token, user: { id: result.lastInsertRowid, email, name, phone, user_type } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, user_type: user.user_type },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, user_type: user.user_type } });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, email, name, phone, user_type, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
