const router = require('express').Router();
const db = require('../db/schema');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/:storySlug', optionalAuth, (req, res) => {
  const story = db.prepare('SELECT id FROM stories WHERE slug = ?').get(req.params.storySlug);
  if (!story) return res.status(404).json({ error: 'Không tìm thấy' });
  const stats = db.prepare(`
    SELECT COUNT(*) as count, AVG(CAST(score AS REAL)) as avg,
      SUM(CASE WHEN score=5 THEN 1 ELSE 0 END) as s5,
      SUM(CASE WHEN score=4 THEN 1 ELSE 0 END) as s4,
      SUM(CASE WHEN score=3 THEN 1 ELSE 0 END) as s3,
      SUM(CASE WHEN score=2 THEN 1 ELSE 0 END) as s2,
      SUM(CASE WHEN score=1 THEN 1 ELSE 0 END) as s1
    FROM ratings WHERE story_id = ?
  `).get(story.id);
  let myScore = null;
  if (req.user) {
    const my = db.prepare('SELECT score FROM ratings WHERE story_id = ? AND user_id = ?').get(story.id, req.user.id);
    myScore = my?.score ?? null;
  }
  res.json({ ...stats, myScore });
});

router.post('/:storySlug', authMiddleware, (req, res) => {
  const story = db.prepare('SELECT id FROM stories WHERE slug = ?').get(req.params.storySlug);
  if (!story) return res.status(404).json({ error: 'Không tìm thấy' });
  const score = parseInt(req.body.score);
  if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Điểm phải từ 1-5' });
  db.prepare('INSERT OR REPLACE INTO ratings (story_id, user_id, score) VALUES (?,?,?)').run(story.id, req.user.id, score);
  res.json({ ok: true });
});

module.exports = router;
