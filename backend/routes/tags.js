const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// GET /api/tags — danh sách tất cả tags kèm số lượng truyện
router.get('/', (req, res) => {
  const tags = db.prepare(`
    SELECT t.id, t.name, t.slug, COUNT(st.story_id) as count
    FROM tags t
    LEFT JOIN story_tags st ON t.id = st.tag_id
    GROUP BY t.id
    ORDER BY count DESC, t.name ASC
  `).all();
  res.json(tags);
});

module.exports = router;
