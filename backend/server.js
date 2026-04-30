const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/schema');

const app = express();
const PORT = process.env.PORT || 5020;

app.use(cors());
app.use(express.json());

app.use('/api/stories', require('./routes/stories'));
app.use('/api/chapters', require('./routes/chapters'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/search', require('./routes/search'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reading-history', require('./routes/readingHistory'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
