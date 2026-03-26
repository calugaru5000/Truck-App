const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'truck_app_secret_key_2024';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requireOwner(req, res, next) {
  if (req.user.user_type !== 'owner') {
    return res.status(403).json({ error: 'Owner account required' });
  }
  next();
}

function requireCustomer(req, res, next) {
  if (req.user.user_type !== 'customer') {
    return res.status(403).json({ error: 'Customer account required' });
  }
  next();
}

module.exports = { authenticate, requireOwner, requireCustomer, JWT_SECRET };
