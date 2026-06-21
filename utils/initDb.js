const { getDb } = require('../config/database');

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      nickname TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      birthday TEXT DEFAULT '',
      zodiac TEXT DEFAULT '',
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS match_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      my_gender TEXT NOT NULL,
      target_gender TEXT NOT NULL,
      compatibility INTEGER NOT NULL,
      result_content TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      content_index INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      match_id INTEGER,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      prepay_id TEXT DEFAULT '',
      transaction_id TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      paid_at TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (match_id) REFERENCES match_records(id)
    );

    CREATE TABLE IF NOT EXISTS configs (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS match_seeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gender_a TEXT NOT NULL,
      gender_b TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_match_seeds_pair ON match_seeds(gender_a, gender_b);
  `);

  const insertConfig = db.prepare('INSERT OR IGNORE INTO configs (key, value) VALUES (?, ?)');
  insertConfig.run('payment_amount', '199');
  insertConfig.run('review_mode', '0');
  insertConfig.run('business_type', 'personal');

  const adminOpenids = (process.env.ADMIN_OPENIDS || 'test_openid_001').split(',').map(s => s.trim()).filter(Boolean);
  const upsertUser = db.prepare('INSERT OR IGNORE INTO users (openid, nickname, is_admin) VALUES (?, ?, 1)');
  for (const oid of adminOpenids) {
    upsertUser.run(oid, '管理员');
  }

  console.log('Database initialized successfully');
}

module.exports = { initDatabase };
