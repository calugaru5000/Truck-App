const express = require('express');
const db = require('../db');
const { authenticate, requireOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { type, min_price, max_price, location, available } = req.query;
  let query = `
    SELECT t.*, u.name as owner_name, u.phone as owner_phone,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as review_count
    FROM trucks t
    JOIN users u ON t.owner_id = u.id
    LEFT JOIN reviews r ON r.truck_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (type) { query += ' AND t.truck_type = ?'; params.push(type); }
  if (min_price) { query += ' AND t.price_per_day >= ?'; params.push(Number(min_price)); }
  if (max_price) { query += ' AND t.price_per_day <= ?'; params.push(Number(max_price)); }
  if (location) { query += ' AND t.location LIKE ?'; params.push(`%${location}%`); }
  if (available !== undefined) { query += ' AND t.is_available = ?'; params.push(available === 'true' ? 1 : 0); }

  query += ' GROUP BY t.id ORDER BY t.created_at DESC';

  const trucks = db.prepare(query).all(...params);
  res.json(trucks);
});

router.get('/:id', (req, res) => {
  const truck = db.prepare(`
    SELECT t.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as review_count
    FROM trucks t
    JOIN users u ON t.owner_id = u.id
    LEFT JOIN reviews r ON r.truck_id = t.id
    WHERE t.id = ?
    GROUP BY t.id
  `).get(req.params.id);
  if (!truck) return res.status(404).json({ error: 'Truck not found' });
  res.json(truck);
});

router.post('/', authenticate, requireOwner, (req, res) => {
  const { make, model, year, license_plate, capacity_tons, truck_type, price_per_day, description, location } = req.body;
  if (!make || !model || !year || !license_plate || !capacity_tons || !truck_type || !price_per_day) {
    return res.status(400).json({ error: 'make, model, year, license_plate, capacity_tons, truck_type, and price_per_day are required' });
  }

  const existing = db.prepare('SELECT id FROM trucks WHERE license_plate = ?').get(license_plate);
  if (existing) return res.status(409).json({ error: 'License plate already registered' });

  const result = db.prepare(`
    INSERT INTO trucks (owner_id, make, model, year, license_plate, capacity_tons, truck_type, price_per_day, description, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, make, model, Number(year), license_plate, Number(capacity_tons), truck_type, Number(price_per_day), description || null, location || null);

  const truck = db.prepare('SELECT * FROM trucks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(truck);
});

router.put('/:id', authenticate, requireOwner, (req, res) => {
  const truck = db.prepare('SELECT * FROM trucks WHERE id = ?').get(req.params.id);
  if (!truck) return res.status(404).json({ error: 'Truck not found' });
  if (truck.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your truck' });

  const { make, model, year, license_plate, capacity_tons, truck_type, price_per_day, description, location, is_available } = req.body;

  db.prepare(`
    UPDATE trucks SET
      make = COALESCE(?, make),
      model = COALESCE(?, model),
      year = COALESCE(?, year),
      license_plate = COALESCE(?, license_plate),
      capacity_tons = COALESCE(?, capacity_tons),
      truck_type = COALESCE(?, truck_type),
      price_per_day = COALESCE(?, price_per_day),
      description = COALESCE(?, description),
      location = COALESCE(?, location),
      is_available = COALESCE(?, is_available)
    WHERE id = ?
  `).run(make, model, year ? Number(year) : null, license_plate, capacity_tons ? Number(capacity_tons) : null,
    truck_type, price_per_day ? Number(price_per_day) : null, description, location,
    is_available !== undefined ? (is_available ? 1 : 0) : null, req.params.id);

  const updated = db.prepare('SELECT * FROM trucks WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', authenticate, requireOwner, (req, res) => {
  const truck = db.prepare('SELECT * FROM trucks WHERE id = ?').get(req.params.id);
  if (!truck) return res.status(404).json({ error: 'Truck not found' });
  if (truck.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your truck' });

  db.prepare('DELETE FROM trucks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Truck deleted' });
});

router.get('/owner/my-trucks', authenticate, requireOwner, (req, res) => {
  const trucks = db.prepare(`
    SELECT t.*,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count,
      COUNT(DISTINCT b.id) as booking_count
    FROM trucks t
    LEFT JOIN reviews r ON r.truck_id = t.id
    LEFT JOIN bookings b ON b.truck_id = t.id
    WHERE t.owner_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all(req.user.id);
  res.json(trucks);
});

module.exports = router;
