const router = require('express').Router();
const db = require('../db/schema');

router.get('/active', (req, res) => {
  const link = db.prepare('SELECT * FROM affiliate_links WHERE active = 1 ORDER BY id DESC LIMIT 1').get();
  res.json(link || null);
});

router.post('/click/:id', (req, res) => {
  db.prepare('UPDATE affiliate_links SET clicks = clicks + 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
