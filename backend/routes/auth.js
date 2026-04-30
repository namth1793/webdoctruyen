const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'truyen123_secret_key';

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  if (password.length < 6) return res.status(400).json({ error: 'Mật khẩu tối thiểu 6 ký tự' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) return res.status(400).json({ error: 'Email hoặc tên đăng nhập đã tồn tại' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, username, email }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: result.lastInsertRowid, username, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  res.json(user);
});

router.get('/bookmarks', authMiddleware, (req, res) => {
  const bookmarks = db.prepare(`
    SELECT s.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
    b.created_at as bookmarked_at,
    (SELECT MAX(chapter_number) FROM chapters WHERE story_id = s.id) as latest_chapter
    FROM bookmarks b
    JOIN stories s ON b.story_id = s.id
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookmarks.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })));
});

module.exports = router;
