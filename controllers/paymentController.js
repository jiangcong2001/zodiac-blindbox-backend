const { getDb } = require('../config/database');
const config = require('../config/index');

const prepay = async (req, res) => {
  try {
    const { match_id } = req.body;
    if (!match_id) {
      return res.status(400).json({ error: '缺少匹配记录ID' });
    }

    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE openid = ?').get(req.openid);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const match = db.prepare(
      'SELECT * FROM match_records WHERE id = ? AND user_id = ?'
    ).get(match_id, user.id);
    if (!match) return res.status(404).json({ error: '匹配记录不存在' });
    if (match.is_paid) return res.status(400).json({ error: '该匹配已支付' });

    const amountConfig = db.prepare('SELECT value FROM configs WHERE key = ?').get('payment_amount');
    const amount = parseInt(amountConfig?.value || '199');

    const businessType = db.prepare('SELECT value FROM configs WHERE key = ?').get('business_type');
    const isEnterprise = businessType?.value === 'enterprise';

    if (isEnterprise) {
      res.json({
        enterprise: true,
        message: '企业模式：需配置微信支付商户信息后使用统一下单API',
        confirm_url: '/api/payment/confirm',
        match_id,
        amount
      });
    } else {
      db.prepare(
        'INSERT INTO payments (user_id, match_id, amount, status) VALUES (?, ?, ?, ?)'
      ).run(user.id, match_id, amount, 'success');

      db.prepare('UPDATE match_records SET is_paid = 1 WHERE id = ?').run(match_id);

      res.json({
        success: true,
        match_id,
        amount,
        message: '解锁成功（非企业模式自动完成）'
      });
    }
  } catch (err) {
    console.error('Prepay error:', err);
    res.status(500).json({ error: '支付处理失败' });
  }
};

const notify = (req, res) => {
  try {
    const { transaction_id, match_id, openid } = req.body;

    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE openid = ?').get(openid);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    db.prepare(
      "UPDATE payments SET status = 'success', transaction_id = ?, paid_at = datetime('now', 'localtime') WHERE match_id = ? AND user_id = ? AND status = 'pending'"
    ).run(transaction_id, match_id, user.id);

    db.prepare('UPDATE match_records SET is_paid = 1 WHERE id = ? AND is_paid = 0').run(match_id);

    res.json({ success: true });
  } catch (err) {
    console.error('Payment notify error:', err);
    res.status(500).json({ error: '回调处理失败' });
  }
};

module.exports = { prepay, notify };
