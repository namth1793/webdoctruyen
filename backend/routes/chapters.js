const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const { optionalAuth } = require('../middleware/auth');

// GET /api/chapters/:storySlug - list chapters
router.get('/:storySlug', (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const story = db.prepare('SELECT id FROM stories WHERE slug = ?').get(req.params.storySlug);
  if (!story) return res.status(404).json({ error: 'Không tìm thấy truyện' });

  const chapters = db.prepare(`
    SELECT id, chapter_number, title, views, created_at, updated_at
    FROM chapters
    WHERE story_id = ?
    ORDER BY chapter_number ASC
    LIMIT ? OFFSET ?
  `).all(story.id, parseInt(limit), offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM chapters WHERE story_id = ?').get(story.id).count;

  res.json({ chapters, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/chapters/:storySlug/:chapterNum - read chapter
router.get('/:storySlug/:chapterNum', optionalAuth, (req, res) => {
  const story = db.prepare(`
    SELECT s.*, c.name as category_name, c.slug as category_slug
    FROM stories s LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.slug = ?
  `).get(req.params.storySlug);

  if (!story) return res.status(404).json({ error: 'Không tìm thấy truyện' });

  const chapter = db.prepare(`
    SELECT * FROM chapters WHERE story_id = ? AND chapter_number = ?
  `).get(story.id, parseInt(req.params.chapterNum));

  if (!chapter) return res.status(404).json({ error: 'Không tìm thấy chương' });

  db.prepare('UPDATE chapters SET views = views + 1 WHERE id = ?').run(chapter.id);

  const prev = db.prepare('SELECT chapter_number, title FROM chapters WHERE story_id = ? AND chapter_number < ? ORDER BY chapter_number DESC LIMIT 1').get(story.id, chapter.chapter_number);
  const next = db.prepare('SELECT chapter_number, title FROM chapters WHERE story_id = ? AND chapter_number > ? ORDER BY chapter_number ASC LIMIT 1').get(story.id, chapter.chapter_number);

  if (req.user) {
    db.prepare(`
      INSERT INTO reading_history (user_id, story_id, chapter_id, chapter_number, updated_at)
      VALUES (?, ?, ?, ?, datetime('now','localtime'))
      ON CONFLICT(user_id, story_id) DO UPDATE SET
        chapter_id = excluded.chapter_id,
        chapter_number = excluded.chapter_number,
        updated_at = excluded.updated_at
    `).run(req.user.id, story.id, chapter.id, chapter.chapter_number);
  }

  res.json({ chapter, story: { ...story, genres: JSON.parse(story.genres || '[]') }, prev, next });
});

module.exports = router;
