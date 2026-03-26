const express = require('express');
const db = require('../db');
const { authenticate, requireOwner, requireCustomer } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireCustomer, (req, res) => {
  const { truck_id, start_date, end_date, notes } = req.body;
  if (!truck_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'truck_id, start_date, and end_date are required' });
  }

  const truck = db.prepare('SELECT * FROM trucks WHERE id = ?').get(truck_id);
  if (!truck) return res.status(404).json({ error: 'Truck not found' });
  if (!truck.is_available) return res.status(400).json({ error: 'Truck is not available' });

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (isNaN(start) || isNaN(end) || end <= start) {
    return res.status(400).json({ error: 'Invalid date range' });
  }

  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE truck_id = ? AND status IN ('pending','confirmed')
    AND NOT (end_date <= ? OR start_date >= ?)
  `).get(truck_id, start_date, end_date);
  if (conflict) return res.status(409).json({ error: 'Truck already booked for that period' });

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const total_price = days * truck.price_per_day;

  const result = db.prepare(`
    INSERT INTO bookings (truck_id, customer_id, start_date, end_date, notes, total_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(truck_id, req.user.id, start_date, end_date, notes || null, total_price);

  const booking = db.prepare(`
    SELECT b.*, t.make, t.model, t.license_plate, u.name as owner_name
    FROM bookings b
    JOIN trucks t ON b.truck_id = t.id
    JOIN users u ON t.owner_id = u.id
    WHERE b.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(booking);
});

router.get('/my-bookings', authenticate, requireCustomer, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, t.make, t.model, t.license_plate, t.truck_type, t.price_per_day,
      u.name as owner_name, u.phone as owner_phone,
      r.id as review_id, r.rating, r.comment
    FROM bookings b
    JOIN trucks t ON b.truck_id = t.id
    JOIN users u ON t.owner_id = u.id
    LEFT JOIN reviews r ON r.booking_id = b.id
    WHERE b.customer_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

router.get('/owner-bookings', authenticate, requireOwner, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, t.make, t.model, t.license_plate, t.truck_type,
      u.name as customer_name, u.phone as customer_phone, u.email as customer_email
    FROM bookings b
    JOIN trucks t ON b.truck_id = t.id
    JOIN users u ON b.customer_id = u.id
    WHERE t.owner_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

router.patch('/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  const booking = db.prepare(`
    SELECT b.*, t.owner_id FROM bookings b
    JOIN trucks t ON b.truck_id = t.id
    WHERE b.id = ?
  `).get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const isOwner = req.user.user_type === 'owner' && booking.owner_id === req.user.id;
  const isCustomer = req.user.user_type === 'customer' && booking.customer_id === req.user.id;

  if (!isOwner && !isCustomer) return res.status(403).json({ error: 'Access denied' });

  const allowedOwnerStatuses = ['confirmed', 'cancelled', 'completed'];
  const allowedCustomerStatuses = ['cancelled'];

  if (isOwner && !allowedOwnerStatuses.includes(status)) {
    return res.status(400).json({ error: `Owner can set status to: ${allowedOwnerStatuses.join(', ')}` });
  }
  if (isCustomer && !allowedCustomerStatuses.includes(status)) {
    return res.status(400).json({ error: 'Customers can only cancel bookings' });
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Booking status updated', status });
});

router.get('/:id', authenticate, (req, res) => {
  const booking = db.prepare(`
    SELECT b.*, t.make, t.model, t.license_plate, t.truck_type, t.price_per_day,
      t.owner_id, u_owner.name as owner_name, u_owner.phone as owner_phone,
      u_cust.name as customer_name, u_cust.phone as customer_phone
    FROM bookings b
    JOIN trucks t ON b.truck_id = t.id
    JOIN users u_owner ON t.owner_id = u_owner.id
    JOIN users u_cust ON b.customer_id = u_cust.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const isOwner = req.user.user_type === 'owner' && booking.owner_id === req.user.id;
  const isCustomer = req.user.user_type === 'customer' && booking.customer_id === req.user.id;
  if (!isOwner && !isCustomer) return res.status(403).json({ error: 'Access denied' });

  res.json(booking);
});

module.exports = router;
