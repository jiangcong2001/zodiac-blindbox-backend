const { getDb } = require('../config/database');

const dashboard = (req, res) => {
  try {
    const db = getDb();

    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const todayNew = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now', 'localtime')"
    ).get();
    const todayPayments = db.prepare(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as amount FROM payments WHERE status = 'success' AND date(paid_at) = date('now', 'localtime')"
    ).get();

    res.json({
      total_users: totalUsers.count,
      today_new: todayNew.count,
      today_payments: todayPayments.count,
      today_income: todayPayments.amount
    });
  } catch (err) {
    res.status(500).json({ error: '获取仪表盘数据失败' });
  }
};

const users = (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const total = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const list = db.prepare(
      `SELECT u.*, COUNT(p.id) as payment_count
       FROM users u
       LEFT JOIN payments p ON u.id = p.user_id AND p.status = 'success'
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(pageSize, offset);

    res.json({
      total: total.count,
      page,
      pageSize,
      list: list.map(u => ({
        id: u.id,
        nickname: u.nickname,
        avatar_url: u.avatar_url,
        zodiac: u.zodiac,
        created_at: u.created_at,
        payment_count: u.payment_count
      }))
    });
  } catch (err) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

const payments = (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const { start_date, end_date } = req.query;

    let whereClause = "WHERE p.status = 'success'";
    const params = [];

    if (start_date) {
      whereClause += ' AND date(p.paid_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND date(p.paid_at) <= ?';
      params.push(end_date);
    }

    const countSql = `SELECT COUNT(*) as count FROM payments p ${whereClause}`;
    const total = db.prepare(countSql).get(...params);

    const listSql = `
      SELECT p.*, u.nickname, u.avatar_url
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    const list = db.prepare(listSql).all(...params);

    const incomeSql = `SELECT COALESCE(SUM(p.amount), 0) as total FROM payments p ${whereClause}`;
    const totalIncome = db.prepare(incomeSql).get(...params.slice(0, -2));

    res.json({
      total: total.count,
      total_income: totalIncome.total,
      page,
      pageSize,
      list: list.map(p => ({
        id: p.id,
        user_id: p.user_id,
        nickname: p.nickname,
        avatar_url: p.avatar_url,
        amount: p.amount,
        transaction_id: p.transaction_id,
        created_at: p.created_at,
        paid_at: p.paid_at
      }))
    });
  } catch (err) {
    console.error('Payments list error:', err);
    res.status(500).json({ error: '获取支付明细失败' });
  }
};

module.exports = { dashboard, users, payments };
