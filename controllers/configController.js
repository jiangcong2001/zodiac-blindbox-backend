const { getDb } = require('../config/database');

const getConfig = (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM configs').all();
    const configMap = {};
    for (const row of rows) {
      configMap[row.key] = row.value;
    }
    res.json(configMap);
  } catch (err) {
    res.status(500).json({ error: '获取配置失败' });
  }
};

const getPublicConfig = (req, res) => {
  try {
    const db = getDb();
    const reviewMode = db.prepare("SELECT value FROM configs WHERE key = 'review_mode'").get();
    res.json({
      review_mode: parseInt(reviewMode?.value || '0')
    });
  } catch (err) {
    res.status(500).json({ error: '获取公开配置失败' });
  }
};

const updateConfig = (req, res) => {
  try {
    const db = getDb();
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: '请提供配置项' });
    }

    const validKeys = ['payment_amount', 'review_mode', 'business_type'];
    const stmt = db.prepare(
      "INSERT INTO configs (key, value, updated_at) VALUES (?, ?, datetime('now', 'localtime')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now', 'localtime')"
    );

    for (const [key, value] of Object.entries(updates)) {
      if (!validKeys.includes(key)) continue;
      if (key === 'payment_amount') {
        const amount = parseInt(value);
        if (isNaN(amount) || amount < 1 || amount > 99900) {
          return res.status(400).json({ error: '支付金额需为 1-99900 之间的整数（单位：分）' });
        }
      }
      stmt.run(key, String(value));
    }

    res.json({ success: true, message: '配置更新成功' });
  } catch (err) {
    res.status(500).json({ error: '更新配置失败' });
  }
};

module.exports = { getConfig, getPublicConfig, updateConfig };
