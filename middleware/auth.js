function authMiddleware(req, res, next) {
  const openid = req.headers['x-openid'] || req.headers['authorization'] || '';
  if (!openid) {
    return res.status(401).json({ error: '未登录，请先授权' });
  }
  req.openid = openid.replace('Bearer ', '');
  next();
}

function adminMiddleware(req, res, next) {
  const { getDb } = require('../config/database');
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE openid = ?').get(req.openid);
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: '无管理员权限' });
  }
  req.user = user;
  next();
}

module.exports = { authMiddleware, adminMiddleware };
