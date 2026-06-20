const { getDb } = require('../config/database');

const create = (req, res) => {
  try {
    const { target_gender } = req.body;
    const validGenders = ['男', '女'];
    if (!target_gender || !validGenders.includes(target_gender)) {
      return res.status(400).json({ error: '请选择匹配对象的性别（男/女）' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE openid = ?').get(req.openid);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    if (!user.gender) return res.status(400).json({ error: '请先设置你的性别' });

    const myGender = user.gender;

    const compatibility = 70 + Math.floor(Math.random() * 30);

    const seedCount = db.prepare(
      'SELECT COUNT(*) as count FROM match_seeds WHERE gender_a = ? AND gender_b = ?'
    ).get(myGender, target_gender);

    let contentIndex = 0;
    let resultJson = '{}';

    if (seedCount && seedCount.count > 0) {
      contentIndex = Math.floor(Math.random() * seedCount.count);
      const seed = db.prepare(
        'SELECT * FROM match_seeds WHERE gender_a = ? AND gender_b = ? LIMIT 1 OFFSET ?'
      ).get(myGender, target_gender, contentIndex);
      if (seed) resultJson = seed.content;
    } else {
      resultJson = JSON.stringify({
        personality: `你与Ta的相遇充满奇妙`,
        destiny: '缘分正在悄悄降临',
        suggestion: '勇敢迈出第一步吧',
        compatibility: compatibility,
        level: '有缘可期'
      });
    }

    const existing = db.prepare(
      'SELECT * FROM match_records WHERE user_id = ? AND my_gender = ? AND target_gender = ?'
    ).get(user.id, myGender, target_gender);

    if (existing) {
      return res.json({
        id: existing.id,
        my_gender: existing.my_gender,
        target_gender: existing.target_gender,
        compatibility: existing.compatibility,
        is_paid: existing.is_paid ? 1 : 0,
        is_new: false
      });
    }

    const result = db.prepare(
      `INSERT INTO match_records (user_id, my_gender, target_gender, compatibility, result_content, content_index)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(user.id, myGender, target_gender, compatibility, resultJson, contentIndex);

    res.json({
      id: result.lastInsertRowid,
      my_gender: myGender,
      target_gender,
      compatibility,
      is_paid: 0,
      is_new: true
    });
  } catch (err) {
    console.error('Create match error:', err);
    res.status(500).json({ error: '创建匹配失败' });
  }
};

const reveal = (req, res) => {
  try {
    const { match_id } = req.body;
    if (!match_id) return res.status(400).json({ error: '缺少匹配记录ID' });

    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE openid = ?').get(req.openid);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const match = db.prepare('SELECT * FROM match_records WHERE id = ? AND user_id = ?').get(match_id, user.id);
    if (!match) return res.status(404).json({ error: '匹配记录不存在' });
    if (!match.is_paid) return res.status(402).json({ error: '请先支付解锁结果' });

    let resultContent;
    try { resultContent = JSON.parse(match.result_content); } catch { resultContent = { personality: match.result_content }; }

    res.json({
      id: match.id,
      my_gender: match.my_gender,
      target_gender: match.target_gender,
      compatibility: match.compatibility,
      result: resultContent,
      is_paid: true,
      created_at: match.created_at
    });
  } catch (err) {
    res.status(500).json({ error: '获取匹配结果失败' });
  }
};

const history = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE openid = ?').get(req.openid);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const records = db.prepare(
      'SELECT * FROM match_records WHERE user_id = ? ORDER BY created_at DESC'
    ).all(user.id);

    res.json({
      records: records.map(r => ({
        id: r.id,
        my_gender: r.my_gender,
        target_gender: r.target_gender,
        compatibility: r.compatibility,
        is_paid: r.is_paid,
        created_at: r.created_at
      }))
    });
  } catch (err) {
    res.status(500).json({ error: '获取历史记录失败' });
  }
};

module.exports = { create, reveal, history };
