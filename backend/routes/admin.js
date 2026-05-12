const router = require('express').Router();
const db = require('../db/schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const adminAuth = require('../middleware/adminAuth');

const SECRET = process.env.JWT_SECRET || 'truyen123_secret_key';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── Image upload (Cloudinary) ──
router.post('/upload', adminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Không có file' });
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'truyen-huba', resource_type: 'image' },
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ url: result.secure_url });
    }
  );
  stream.end(req.file.buffer);
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
  if (!admin || !bcrypt.compareSync(password, admin.password))
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
  const token = jwt.sign({ id: admin.id, email: admin.email, username: admin.username, isAdmin: true }, SECRET, { expiresIn: '7d' });
  res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
});

// Dashboard stats
router.get('/stats', adminAuth, (req, res) => {
  const stories = db.prepare('SELECT COUNT(*) as c FROM stories').get().c;
  const chapters = db.prepare('SELECT COUNT(*) as c FROM chapters').get().c;
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const comments = db.prepare('SELECT COUNT(*) as c FROM comments').get().c;
  const totalViews = db.prepare('SELECT SUM(views) as t FROM stories').get().t || 0;
  const topStories = db.prepare('SELECT title, views FROM stories ORDER BY views DESC LIMIT 5').all();
  res.json({ stories, chapters, users, comments, totalViews, topStories });
});

// ── Stories ──
router.get('/stories', adminAuth, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const q = req.query.q || '';
  const limit = 20;
  const offset = (page - 1) * limit;
  const where = q ? `WHERE s.title LIKE '%${q}%' OR s.author LIKE '%${q}%'` : '';
  const stories = db.prepare(`SELECT s.*, c.name as category_name FROM stories s LEFT JOIN categories c ON s.category_id = c.id ${where} ORDER BY s.id DESC LIMIT ? OFFSET ?`).all(limit, offset);
  const total = db.prepare(`SELECT COUNT(*) as c FROM stories s ${where}`).get().c;
  res.json({ stories, total, pages: Math.ceil(total / limit) });
});

router.post('/stories', adminAuth, (req, res) => {
  const { title, slug, author, cover_image, description, status, total_chapters, category_id, genres, featured } = req.body;
  try {
    const r = db.prepare(`INSERT INTO stories (title,slug,author,cover_image,description,status,total_chapters,category_id,genres,featured) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      title, slug, author || '', cover_image || '', description || '', status || 'ongoing',
      parseInt(total_chapters) || 0, category_id || null, JSON.stringify(genres || []), featured ? 1 : 0
    );
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/stories/:id', adminAuth, (req, res) => {
  const { title, slug, author, cover_image, description, status, total_chapters, category_id, genres, featured } = req.body;
  try {
    db.prepare(`UPDATE stories SET title=?,slug=?,author=?,cover_image=?,description=?,status=?,total_chapters=?,category_id=?,genres=?,featured=?,updated_at=datetime('now','localtime') WHERE id=?`)
      .run(title, slug, author, cover_image, description, status, parseInt(total_chapters) || 0, category_id || null, JSON.stringify(genres || []), featured ? 1 : 0, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/stories/:id', adminAuth, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM chapters WHERE story_id=?').run(id);
  db.prepare('DELETE FROM comments WHERE story_id=?').run(id);
  db.prepare('DELETE FROM ratings WHERE story_id=?').run(id);
  db.prepare('DELETE FROM bookmarks WHERE story_id=?').run(id);
  db.prepare('DELETE FROM reading_history WHERE story_id=?').run(id);
  db.prepare('DELETE FROM story_tags WHERE story_id=?').run(id);
  db.prepare('DELETE FROM stories WHERE id=?').run(id);
  res.json({ ok: true });
});

// ── Chapters ──
router.get('/chapters/:storyId', adminAuth, (req, res) => {
  const chapters = db.prepare('SELECT * FROM chapters WHERE story_id=? ORDER BY chapter_number').all(req.params.storyId);
  const story = db.prepare('SELECT id,title,slug FROM stories WHERE id=?').get(req.params.storyId);
  res.json({ chapters, story });
});

router.post('/chapters/:storyId', adminAuth, (req, res) => {
  const { chapter_number, title, content } = req.body;
  try {
    const r = db.prepare('INSERT INTO chapters (story_id,chapter_number,title,content) VALUES (?,?,?,?)').run(req.params.storyId, chapter_number, title || '', content || '');
    db.prepare(`UPDATE stories SET total_chapters=(SELECT MAX(chapter_number) FROM chapters WHERE story_id=?),updated_at=datetime('now','localtime') WHERE id=?`).run(req.params.storyId, req.params.storyId);
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/chapters/:id', adminAuth, (req, res) => {
  const { title, content } = req.body;
  const ch = db.prepare('SELECT story_id FROM chapters WHERE id=?').get(req.params.id);
  db.prepare(`UPDATE chapters SET title=?,content=?,updated_at=datetime('now','localtime') WHERE id=?`).run(title, content, req.params.id);
  if (ch) db.prepare(`UPDATE stories SET updated_at=datetime('now','localtime') WHERE id=?`).run(ch.story_id);
  res.json({ ok: true });
});

router.delete('/chapters/:id', adminAuth, (req, res) => {
  const ch = db.prepare('SELECT story_id FROM chapters WHERE id=?').get(req.params.id);
  db.prepare('DELETE FROM chapters WHERE id=?').run(req.params.id);
  if (ch) db.prepare(`UPDATE stories SET total_chapters=COALESCE((SELECT MAX(chapter_number) FROM chapters WHERE story_id=?),0),updated_at=datetime('now','localtime') WHERE id=?`).run(ch.story_id, ch.story_id);
  res.json({ ok: true });
});

// ── Comments ──
router.get('/comments', adminAuth, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;
  const comments = db.prepare(`
    SELECT c.id, c.content, c.created_at, u.username, s.title as story_title, s.slug as story_slug
    FROM comments c JOIN users u ON c.user_id=u.id JOIN stories s ON c.story_id=s.id
    ORDER BY c.id DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM comments').get().c;
  res.json({ comments, total, pages: Math.ceil(total / limit) });
});

router.delete('/comments/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM comments WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Categories ──
router.get('/categories', adminAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY id').all());
});

router.post('/categories', adminAuth, (req, res) => {
  const { name, slug, description, color } = req.body;
  try {
    const r = db.prepare('INSERT INTO categories (name,slug,description,color) VALUES (?,?,?,?)').run(name, slug, description || '', color || '#3b82f6');
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/categories/:id', adminAuth, (req, res) => {
  const { name, slug, description, color } = req.body;
  try {
    db.prepare('UPDATE categories SET name=?,slug=?,description=?,color=? WHERE id=?').run(name, slug, description, color, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/categories/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Tags ──
router.get('/tags', adminAuth, (req, res) => {
  const tags = db.prepare('SELECT t.*, COUNT(st.story_id) as story_count FROM tags t LEFT JOIN story_tags st ON t.id=st.tag_id GROUP BY t.id ORDER BY t.name').all();
  res.json(tags);
});

router.post('/tags', adminAuth, (req, res) => {
  const { name, slug } = req.body;
  try {
    const r = db.prepare('INSERT INTO tags (name,slug) VALUES (?,?)').run(name, slug);
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/tags/:id', adminAuth, (req, res) => {
  const { name, slug } = req.body;
  try {
    db.prepare('UPDATE tags SET name=?,slug=? WHERE id=?').run(name, slug, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/tags/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM story_tags WHERE tag_id=?').run(req.params.id);
  db.prepare('DELETE FROM tags WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Affiliate links ──
router.get('/affiliate', adminAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM affiliate_links ORDER BY id DESC').all());
});

router.post('/affiliate', adminAuth, (req, res) => {
  const { name, url, image_url, description, trigger_after, time_trigger } = req.body;
  try {
    const r = db.prepare('INSERT INTO affiliate_links (name,url,image_url,description,trigger_after,time_trigger) VALUES (?,?,?,?,?,?)').run(
      name, url, image_url || '', description || '', parseInt(trigger_after) || 4, parseInt(time_trigger) ?? 5
    );
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put('/affiliate/:id', adminAuth, (req, res) => {
  const { name, url, image_url, description, trigger_after, time_trigger, active } = req.body;
  db.prepare('UPDATE affiliate_links SET name=?,url=?,image_url=?,description=?,trigger_after=?,time_trigger=?,active=? WHERE id=?')
    .run(name, url, image_url || '', description, parseInt(trigger_after) || 4, parseInt(time_trigger) ?? 5, active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

router.delete('/affiliate/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM affiliate_links WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Site Settings ──────────────────────────────────────────
router.get('/settings', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put('/settings', adminAuth, (req, res) => {
  const upsert = db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now','localtime'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const save = db.transaction((data) => {
    Object.entries(data).forEach(([key, value]) => upsert.run(key, String(value ?? '')));
  });
  save(req.body);
  res.json({ ok: true });
});

module.exports = router;

module.exports = router;
