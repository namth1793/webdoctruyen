const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const adminAuth = require('../middleware/adminAuth');

// POST /api/contact — gửi liên hệ
router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim())
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(name.trim(), email.trim(), subject?.trim() || '', message.trim());
  res.json({ success: true });
});

// GET /api/contact — admin xem danh sách
router.get('/', adminAuth, (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.json(contacts);
});

// PATCH /api/contact/:id/read — đánh dấu đã đọc
router.patch('/:id/read', adminAuth, (req, res) => {
  db.prepare('UPDATE contacts SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// DELETE /api/contact/:id
router.delete('/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
