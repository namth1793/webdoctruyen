const express = require('express');
const router = express.Router();
const db = require('../db/schema');

router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(s.id) as story_count
    FROM categories c
    LEFT JOIN stories s ON s.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id ASC
  `).all();
  res.json(categories);
});

router.get('/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
  res.json(cat);
});

module.exports = router;
