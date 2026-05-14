const express = require('express');
const router = express.Router();
const db = require('../db/schema');

router.get('/', (req, res) => {
  const { q, limit = 20 } = req.query;
  if (!q || q.trim().length < 1) return res.json({ stories: [] });

  // Normalize NFC để tránh lỗi so sánh Unicode tiếng Việt (NFC vs NFD)
  // rồi toLowerCase() để tìm kiếm không phân biệt hoa/thường.
  const norm = str => (str || '').normalize('NFC').toLowerCase();
  const keyword = norm(q.trim());

  const all = db.prepare(`
    SELECT s.id, s.title, s.slug, s.cover_image, s.author, s.status,
           s.total_chapters, s.views, s.genres,
           c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM stories s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE (s.hidden = 0 OR s.hidden IS NULL)
    ORDER BY s.views DESC
  `).all();

  const stories = all
    .filter(s =>
      norm(s.title).includes(keyword) ||
      norm(s.author).includes(keyword) ||
      norm(s.description).includes(keyword) ||
      norm(s.genres).includes(keyword) ||
      norm(s.slug).includes(keyword)
    )
    .slice(0, parseInt(limit));

  res.json({ stories: stories.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })) });
});

module.exports = router;
