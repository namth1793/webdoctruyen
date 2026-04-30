const express = require('express');
const router = express.Router();
const db = require('../db/schema');

router.get('/', (req, res) => {
  const { q, limit = 20 } = req.query;
  if (!q || q.trim().length < 1) return res.json({ stories: [] });

  const keyword = `%${q.trim()}%`;
  const slugKeyword = `%${q.trim().toLowerCase().replace(/\s+/g, '-')}%`;
  const stories = db.prepare(`
    SELECT s.id, s.title, s.slug, s.cover_image, s.author, s.status, s.total_chapters, s.views, s.genres,
    c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM stories s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.title LIKE ? OR s.author LIKE ? OR s.description LIKE ? OR s.genres LIKE ? OR s.slug LIKE ?
    ORDER BY s.views DESC
    LIMIT ?
  `).all(keyword, keyword, keyword, keyword, slugKeyword, parseInt(limit));

  res.json({ stories: stories.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })) });
});

module.exports = router;
