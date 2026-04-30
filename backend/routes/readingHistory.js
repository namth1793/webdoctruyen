const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const history = db.prepare(`
    SELECT rh.*, s.title, s.slug, s.cover_image, s.total_chapters,
    c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM reading_history rh
    JOIN stories s ON rh.story_id = s.id
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE rh.user_id = ?
    ORDER BY rh.updated_at DESC
    LIMIT 20
  `).all(req.user.id);
  res.json(history);
});

module.exports = router;
