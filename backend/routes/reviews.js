const express = require('express');
const db = require('../db');
const { authenticate, requireCustomer } = require('../middleware/auth');

const router = express.Router();

router.get('/truck/:truckId', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.name as customer_name
    FROM reviews r
    JOIN users u ON r.customer_id = u.id
    WHERE r.truck_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.truckId);
  res.json(reviews);
});

router.post('/', authenticate, requireCustomer, (req, res) => {
  const { booking_id, rating, comment } = req.body;
  if (!booking_id || !rating) {
    return res.status(400).json({ error: 'booking_id and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only review your own bookings' });
  }
  if (booking.status !== 'completed') {
    return res.status(400).json({ error: 'You can only review completed bookings' });
  }

  const existing = db.prepare('SELECT id FROM reviews WHERE booking_id = ?').get(booking_id);
  if (existing) return res.status(409).json({ error: 'You already reviewed this booking' });

  const result = db.prepare(`
    INSERT INTO reviews (truck_id, customer_id, booking_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(booking.truck_id, req.user.id, booking_id, Number(rating), comment || null);

  const review = db.prepare(`
    SELECT r.*, u.name as customer_name
    FROM reviews r JOIN users u ON r.customer_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(review);
});

router.delete('/:id', authenticate, requireCustomer, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your review' });
  }
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ message: 'Review deleted' });
});

module.exports = router;
