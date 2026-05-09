const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // 确保引用的是你的配置文件
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'appbox_super_secret_key_2024';

// ==========================================
// ====== 1. C端 (手机App) 业务接口 =======
// ==========================================

// 获取轮播图
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC, id DESC');
    res.json({ code: 0, data: rows });
  } catch (e) { res.status(500).json({ code: 500 }); }
});

// 获取游戏列表
app.get('/api/games', async (req, res) => {
  const keyword = req.query.keyword || '';
  try {
    let sql = 'SELECT * FROM games';
    let params = [];
    if (keyword) {
      sql += ' WHERE title LIKE ?';
      params.push(`%${keyword}%`);
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ code: 0, data: { list: rows, total: rows.length } });
  } catch (e) { res.status(500).json({ code: 500 }); }
});

// 获取游戏详情
app.get('/api/games/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    res.json({ code: 0, data: rows[0] });
  } catch (e) { res.status(500).json({ code: 500 }); }
});

// 登录注册
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    let user = rows[0];
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
      const [result] = await db.query('INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)', [username, hashedPassword, randomAvatar]);
      user = { id: result.insertId, username, avatar: randomAvatar };
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.json({ code: 401, message: '密码错误' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ code: 0, data: { token, userInfo: user } });
  } catch (e) { res.status(500).json({ code: 500 }); }
});

// 礼包领取
app.post('/api/gifts/claim', async (req, res) => {
  const { user_id, game_id } = req.body;
  const giftCode = 'GIFT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  try {
    await db.query('INSERT INTO user_gifts (user_id, game_id, gift_code) VALUES (?, ?, ?)', [user_id, game_id, giftCode]);
    res.json({ code: 0, data: { gift_code: giftCode } });
  } catch (e) { res.json({ code: 400, message: '已领取或领取失败' }); }
});

// 获取统计数据 (收藏、足迹、礼包数)
app.get('/api/my/stats', async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const [[fav]] = await db.query('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', [user_id]);
    const [[foot]] = await db.query('SELECT COUNT(*) as count FROM user_footprints WHERE user_id = ?', [user_id]);
    const [[gift]] = await db.query('SELECT COUNT(*) as count FROM user_gifts WHERE user_id = ?', [user_id]);
    res.json({ code: 0, data: { favCount: fav.count, footCount: foot.count, giftCount: gift.count } });
  } catch (e) { res.json({ code: 0, data: { favCount: 0, footCount: 0, giftCount: 0 } }); }
});

// 记录足迹
app.post('/api/footprints/add', async (req, res) => {
  const { user_id, game_id } = req.body;
  try {
    await db.query('INSERT INTO user_footprints (user_id, game_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE view_time = CURRENT_TIMESTAMP', [user_id, game_id]);
    res.json({ code: 0 });
  } catch (e) { res.json({ code: 500 }); }
});

// ==========================================
// ====== 2. B端 (Admin后台) 管理接口 =======
// ==========================================

app.get('/api/admin/games', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM games ORDER BY id DESC');
  res.json({ code: 0, data: rows });
});

app.get('/api/admin/banners', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC');
  res.json({ code: 0, data: rows });
});

app.get('/api/admin/users', async (req, res) => {
  const [rows] = await db.query('SELECT id, username, avatar, created_at FROM users');
  res.json({ code: 0, data: rows });
});

app.get('/api/admin/gift-records', async (req, res) => {
  const [rows] = await db.query('SELECT ug.*, u.username, g.title FROM user_gifts ug JOIN users u ON ug.user_id = u.id JOIN games g ON ug.game_id = g.id');
  res.json({ code: 0, data: rows });
});

app.listen(3000, () => console.log('Server running on 3000'));