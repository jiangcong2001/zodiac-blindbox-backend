const { getDb } = require('../config/database');
const axios = require('axios');
const config = require('../config/index');
const { calculateZodiac } = require('../utils/zodiac');

const login = async (req, res) => {
  try {
    const { code, nickname, avatar_url, birthday, gender } = req.body;
    if (!code) {
      return res.status(400).json({ error: '缺少登录凭证' });
    }

    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.APP_ID,
        secret: config.APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, errcode } = wxRes.data;
    if (errcode) {
      return res.status(401).json({ error: '微信登录失败', detail: wxRes.data });
    }

    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);

    if (!user) {
      const zodiac = birthday ? calculateZodiac(birthday) : '';
      db.prepare(
        'INSERT INTO users (openid, nickname, avatar_url, birthday, zodiac, gender) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(openid, nickname || '', avatar_url || '', birthday || '', zodiac || '', gender || '');
      user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
    } else {
      const updates = [];
      const params = [];
      if (nickname) { updates.push('nickname = ?'); params.push(nickname); }
      if (avatar_url) { updates.push('avatar_url = ?'); params.push(avatar_url); }
      if (gender) { updates.push('gender = ?'); params.push(gender); }
      if (birthday) { updates.push('birthday = ?'); params.push(birthday); updates.push("zodiac = ?"); params.push(calculateZodiac(birthday)); }
      if (updates.length > 0) {
        updates.push("updated_at = datetime('now', 'localtime')");
        params.push(openid);
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE openid = ?`).run(...params);
      }
      user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
    }

    res.json({
      token: openid,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        gender: user.gender,
        zodiac: user.zodiac,
        birthday: user.birthday,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '登录服务异常' });
  }
};

const updateProfile = (req, res) => {
  try {
    const db = getDb();
    const { gender, birthday } = req.body;

    const updates = [];
    const params = [];

    if (gender) { updates.push('gender = ?'); params.push(gender); }
    if (birthday) {
      updates.push('birthday = ?'); params.push(birthday);
      updates.push('zodiac = ?'); params.push(calculateZodiac(birthday));
    }

    if (updates.length === 0) return res.status(400).json({ error: '无更新内容' });

    updates.push("updated_at = datetime('now', 'localtime')");
    params.push(req.openid);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE openid = ?`).run(...params);

    const user = db.prepare('SELECT * FROM users WHERE openid = ?').get(req.openid);
    res.json({
      id: user.id,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      gender: user.gender,
      zodiac: user.zodiac,
      birthday: user.birthday,
      is_admin: user.is_admin
    });
  } catch (err) {
    res.status(500).json({ error: '更新失败' });
  }
};

const getUserInfo = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE openid = ?').get(req.openid);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      gender: user.gender,
      zodiac: user.zodiac,
      birthday: user.birthday,
      is_admin: user.is_admin,
      created_at: user.created_at
    });
  } catch (err) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

module.exports = { login, updateProfile, getUserInfo };
