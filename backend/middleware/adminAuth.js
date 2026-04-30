const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'truyen123_secret_key';

module.exports = function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Chưa đăng nhập' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, SECRET);
    if (!payload.isAdmin) return res.status(403).json({ error: 'Không có quyền admin' });
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
};
