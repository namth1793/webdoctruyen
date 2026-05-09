require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const db = require('./db/schema');

// Auto-seed on first run (Railway ephemeral filesystem)
const storyCount = db.prepare('SELECT COUNT(*) as c FROM stories').get().c;
if (storyCount === 0) {
  console.log('🌱 Database trống — đang seed dữ liệu mẫu...');
  require('./db/seed');
  console.log('✅ Seed xong!');
}

const app = express();
const PORT = process.env.PORT || 5020;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/stories', require('./routes/stories'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/search', require('./routes/search'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reading-history', require('./routes/readingHistory'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
