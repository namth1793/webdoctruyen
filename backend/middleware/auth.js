const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'truyen123_secret_key';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Chưa đăng nhập' });
  const token = header.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header) {
    try {
      req.user = jwt.verify(header.replace('Bearer ', ''), SECRET);
    } catch {}
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
