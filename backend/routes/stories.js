const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const { optionalAuth } = require('../middleware/auth');

// GET /api/stories - list with filter/sort/pagination
router.get('/', (req, res) => {
  const { category, status, genre, tag, sort = 'updated', page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let joins = 'LEFT JOIN categories c ON s.category_id = c.id';
  let where = [];
  let params = [];

  if (category) { where.push('c.slug = ?'); params.push(category); }
  if (status)   { where.push('s.status = ?'); params.push(status); }
  if (genre)    { where.push('s.genres LIKE ?'); params.push(`%${genre}%`); }
  if (tag) {
    joins += ' INNER JOIN story_tags st ON s.id = st.story_id INNER JOIN tags tg ON st.tag_id = tg.id';
    where.push('tg.slug = ?');
    params.push(tag);
  }

  const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sortMap = {
    updated: 's.updated_at DESC',
    views: 's.views DESC',
    favorites: 's.favorites DESC',
    chapters: 's.total_chapters DESC',
    new: 's.created_at DESC'
  };
  const orderBy = sortMap[sort] || 's.updated_at DESC';

  const stories = db.prepare(`
    SELECT DISTINCT s.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
    (SELECT MAX(chapter_number) FROM chapters WHERE story_id = s.id) as latest_chapter,
    (SELECT updated_at FROM chapters WHERE story_id = s.id ORDER BY chapter_number DESC LIMIT 1) as chapter_updated
    FROM stories s ${joins}
    ${whereStr}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all([...params, parseInt(limit), offset]);

  const total = db.prepare(`
    SELECT COUNT(DISTINCT s.id) as count FROM stories s ${joins} ${whereStr}
  `).get(params).count;

  res.json({
    stories: stories.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })),
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  });
});

// GET /api/stories/featured
router.get('/featured', (req, res) => {
  const stories = db.prepare(`
    SELECT s.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM stories s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.featured = 1
    ORDER BY s.views DESC
    LIMIT 5
  `).all();
  res.json(stories.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })));
});

// GET /api/stories/latest
router.get('/latest', (req, res) => {
  const stories = db.prepare(`
    SELECT s.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
    (SELECT MAX(chapter_number) FROM chapters WHERE story_id = s.id) as latest_chapter,
    (SELECT updated_at FROM chapters WHERE story_id = s.id ORDER BY chapter_number DESC LIMIT 1) as chapter_updated
    FROM stories s
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.updated_at DESC
    LIMIT 20
  `).all();
  res.json(stories.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })));
});

// GET /api/stories/hot
router.get('/hot', (req, res) => {
  const stories = db.prepare(`
    SELECT s.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM stories s
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.views DESC
    LIMIT 10
  `).all();
  res.json(stories.map(s => ({ ...s, genres: JSON.parse(s.genres || '[]') })));
});

// GET /api/stories/:slug - story detail
router.get('/:slug', optionalAuth, (req, res) => {
  const story = db.prepare(`
    SELECT s.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM stories s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.slug = ?
  `).get(req.params.slug);

  if (!story) return res.status(404).json({ error: 'Không tìm thấy truyện' });

  // increment views
  db.prepare('UPDATE stories SET views = views + 1 WHERE id = ?').run(story.id);

  let bookmarked = false;
  let readingProgress = null;
  if (req.user) {
    const bm = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND story_id = ?').get(req.user.id, story.id);
    bookmarked = !!bm;
    readingProgress = db.prepare('SELECT * FROM reading_history WHERE user_id = ? AND story_id = ?').get(req.user.id, story.id);
  }

  const tags = db.prepare(`
    SELECT t.name, t.slug FROM tags t
    INNER JOIN story_tags st ON t.id = st.tag_id
    WHERE st.story_id = ?
    ORDER BY t.name ASC
  `).all(story.id);

  res.json({ ...story, genres: JSON.parse(story.genres || '[]'), tags, bookmarked, readingProgress });
});

// POST /api/stories/:slug/bookmark
router.post('/:slug/bookmark', require('../middleware/auth').authMiddleware, (req, res) => {
  const story = db.prepare('SELECT id FROM stories WHERE slug = ?').get(req.params.slug);
  if (!story) return res.status(404).json({ error: 'Không tìm thấy truyện' });

  const existing = db.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND story_id = ?').get(req.user.id, story.id);
  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE id = ?').run(existing.id);
    db.prepare('UPDATE stories SET favorites = MAX(0, favorites - 1) WHERE id = ?').run(story.id);
    res.json({ bookmarked: false });
  } else {
    db.prepare('INSERT INTO bookmarks (user_id, story_id) VALUES (?, ?)').run(req.user.id, story.id);
    db.prepare('UPDATE stories SET favorites = favorites + 1 WHERE id = ?').run(story.id);
    res.json({ bookmarked: true });
  }
});

module.exports = router;
