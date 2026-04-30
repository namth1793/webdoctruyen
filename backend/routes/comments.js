const router = require('express').Router();
const db = require('../db/schema');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/:storySlug', (req, res) => {
  const story = db.prepare('SELECT id FROM stories WHERE slug = ?').get(req.params.storySlug);
  if (!story) return res.status(404).json({ error: 'Không tìm thấy truyện' });
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const comments = db.prepare(`
    SELECT c.id, c.content, c.created_at, u.username, u.avatar, c.user_id
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.story_id = ? ORDER BY c.id DESC LIMIT ? OFFSET ?
  `).all(story.id, limit, offset);
  const total = db.prepare('SELECT COUNT(*) as count FROM comments WHERE story_id = ?').get(story.id).count;
  res.json({ comments, total, page, pages: Math.ceil(total / limit) });
});

router.post('/:storySlug', authMiddleware, (req, res) => {
  const story = db.prepare('SELECT id FROM stories WHERE slug = ?').get(req.params.storySlug);
  if (!story) return res.status(404).json({ error: 'Không tìm thấy truyện' });
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Nội dung không được để trống' });
  const r = db.prepare('INSERT INTO comments (story_id, user_id, content) VALUES (?,?,?)').run(story.id, req.user.id, content.trim());
  const comment = db.prepare(`
    SELECT c.id, c.content, c.created_at, u.username, u.avatar, c.user_id
    FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(r.lastInsertRowid);
  res.json(comment);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Không tìm thấy' });
  if (comment.user_id !== req.user.id) return res.status(403).json({ error: 'Không có quyền' });
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
