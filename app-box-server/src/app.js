const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'appbox_super_secret_key_2024';

// --- 数据库初始化 (自动建表) ---
db.query(`
  CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    cover VARCHAR(255) NOT NULL,
    tag VARCHAR(50),
    rating DECIMAL(3, 1),
    downloads VARCHAR(50),
    short_desc TEXT,
    screenshots TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    game_id INT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS user_gifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    gift_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_game (user_id, game_id)
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS gift_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL UNIQUE,
    gift_name VARCHAR(100) DEFAULT '新手礼包',
    gift_desc TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_game (user_id, game_id)
  )
`).catch(console.error);

// 核心：新增足迹表
db.query(`
  CREATE TABLE IF NOT EXISTS user_footprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    view_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_game (user_id, game_id)
  )
`).catch(console.error);


// --- API 路由 ---

// 1. 获取轮播图
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC, id DESC');
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取轮播图失败' });
  }
});

// 2. 获取游戏列表 (支持分页和搜索)
app.get('/api/games', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const keyword = req.query.keyword || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM games';
    let countQuery = 'SELECT COUNT(*) as total FROM games';
    let params = [];

    if (keyword) {
      query += ' WHERE title LIKE ?';
      countQuery += ' WHERE title LIKE ?';
      params.push(`%${keyword}%`);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    
    const [rows] = await db.query(query, [...params, limit, offset]);
    const [countRows] = await db.query(countQuery, params);

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows,
        total: countRows[0].total,
        page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取游戏列表失败' });
  }
});

// 3. 获取游戏详情
app.get('/api/games/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json({ code: 0, message: 'success', data: rows[0] });
    } else {
      res.status(404).json({ code: 404, message: '游戏不存在' });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取游戏详情失败' });
  }
});

// --- 用户系统 API ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ code: 400, message: '账号和密码不能为空' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    let user = rows[0];

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const randomAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${username}`; 
      const [result] = await db.query(
        'INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)',
        [username, hashedPassword, randomAvatar]
      );
      user = { id: result.insertId, username, avatar: randomAvatar };
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.json({ code: 401, message: '密码错误' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ code: 0, message: '登录成功', data: { token, userInfo: { id: user.id, username: user.username, avatar: user.avatar } }});
  } catch (error) {
    res.status(500).json({ code: 500, message: '内部错误' });
  }
});

// --- 业务交互 API ---

app.post('/api/gifts/claim', async (req, res) => {
  const { user_id, game_id } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ code: 400, message: '参数缺失' });
  try {
    const giftCode = 'GIFT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    await db.query('INSERT INTO user_gifts (user_id, game_id, gift_code) VALUES (?, ?, ?)', [user_id, game_id, giftCode]);
    res.json({ code: 0, message: '领取成功', data: { gift_code: giftCode } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.json({ code: 400, message: '您已经领取过啦' });
    } else {
      res.status(500).json({ code: 500, message: '领取失败' });
    }
  }
});

app.get('/api/my/gifts', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });
  try {
    const [rows] = await db.query(`
      SELECT ug.gift_code, ug.created_at, g.title, g.cover 
      FROM user_gifts ug JOIN games g ON ug.game_id = g.id 
      WHERE ug.user_id = ? ORDER BY ug.id DESC
    `, [user_id]);
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

app.post('/api/favorites/toggle', async (req, res) => {
  const { user_id, game_id } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ code: 400, message: '参数缺失' });
  try {
    const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    if (rows.length > 0) {
      await db.query('DELETE FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
      res.json({ code: 0, message: '已取消收藏', data: { isFavorited: false } });
    } else {
      await db.query('INSERT INTO user_favorites (user_id, game_id) VALUES (?, ?)', [user_id, game_id]);
      res.json({ code: 0, message: '收藏成功', data: { isFavorited: true } });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
});

app.get('/api/favorites/check', async (req, res) => {
  const { user_id, game_id } = req.query;
  if (!user_id || !game_id) return res.json({ code: 0, data: { isFavorited: false } });
  try {
    const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    res.json({ code: 0, data: { isFavorited: rows.length > 0 } });
  } catch (error) {
    res.json({ code: 0, data: { isFavorited: false } });
  }
});

// 新增：记录足迹
app.post('/api/footprints/add', async (req, res) => {
  const { user_id, game_id } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ code: 400, message: '参数缺失' });
  try {
    await db.query(`
      INSERT INTO user_footprints (user_id, game_id) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE view_time = CURRENT_TIMESTAMP
    `, [user_id, game_id]);
    res.json({ code: 0, message: '记录成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '记录失败' });
  }
});

// 新增：获取用户统计数据 (收藏、足迹、礼包数量)
app.get('/api/my/stats', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.json({ code: 0, data: { favCount: 0, footCount: 0, giftCount: 0 } });
  try {
    const [[fav]] = await db.query('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', [user_id]);
    const [[foot]] = await db.query('SELECT COUNT(*) as count FROM user_footprints WHERE user_id = ?', [user_id]);
    const [[gift]] = await db.query('SELECT COUNT(*) as count FROM user_gifts WHERE user_id = ?', [user_id]);
    res.json({ code: 0, data: { favCount: fav.count, footCount: foot.count, giftCount: gift.count } });
  } catch (error) {
    res.json({ code: 0, data: { favCount: 0, footCount: 0, giftCount: 0 } });
  }
});

// 新增：获取我的收藏列表
app.get('/api/my/favorites', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });
  try {
    const [rows] = await db.query(`
      SELECT g.* FROM user_favorites uf 
      JOIN games g ON uf.game_id = g.id 
      WHERE uf.user_id = ? ORDER BY uf.created_at DESC
    `, [user_id]);
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 新增：获取我的足迹列表
app.get('/api/my/footprints', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });
  try {
    const [rows] = await db.query(`
      SELECT g.*, uf.view_time FROM user_footprints uf 
      JOIN games g ON uf.game_id = g.id 
      WHERE uf.user_id = ? ORDER BY uf.view_time DESC
    `, [user_id]);
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});