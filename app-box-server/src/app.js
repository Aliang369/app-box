const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'appbox_super_secret_key_2024';
const app = express();

app.use(cors());
app.use(express.json());

// --- 自动初始化用户表 (省去手动在数据库建表) ---
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(console.error);

// --- 自动初始化礼包领取记录表 ---
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

app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC LIMIT 5');
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '获取轮播图失败' });
  }
});

app.get('/api/games', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      'SELECT * FROM games WHERE status = 1 ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '获取游戏列表失败' });
  }
});

// --- 以下为后台管理系统 (Admin) 专用的 API ---

app.post('/api/games', async (req, res) => {
  const { title, tag, cover, short_desc, rating, downloads, screenshots } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO games (title, tag, cover, short_desc, rating, downloads, screenshots) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title || '未命名游戏', tag || '默认', cover || '', short_desc || '', rating || 5.0, downloads || '0', screenshots ? JSON.stringify(screenshots) : null]
    );
    res.json({ code: 0, message: '添加成功', data: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '添加失败' });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM games WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

app.get('/api/admin/games', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games ORDER BY id DESC LIMIT 100');
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 修改游戏
app.put('/api/games/:id', async (req, res) => {
  const { title, tag, cover, short_desc, rating, downloads, screenshots } = req.body;
  try {
    await db.query(
      'UPDATE games SET title=?, tag=?, cover=?, short_desc=?, rating=?, downloads=?, screenshots=? WHERE id=?',
      [title, tag, cover, short_desc, rating, downloads, screenshots ? JSON.stringify(screenshots) : null, req.params.id]
    );
    res.json({ code: 0, message: '修改成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '修改失败' });
  }
});

// 修改轮播图
app.put('/api/banners/:id', async (req, res) => {
  const { image_url, game_id, sort_order } = req.body;
  try {
    await db.query(
      'UPDATE banners SET image_url=?, game_id=?, sort_order=? WHERE id=?',
      [image_url, game_id || null, sort_order || 0, req.params.id]
    );
    res.json({ code: 0, message: '修改成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '修改失败' });
  }
});

// --- 以下为 C端 (App) 专用的补充 API ---

// 获取单个游戏详情
app.get('/api/games/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      // 假设数据库中 screenshots 字段存储的是 JSON 字符串，如 '["url1", "url2"]'
      // 如果是普通字符串，前端处理也可以
      res.json({ code: 0, message: 'success', data: rows[0] });
    } else {
      res.status(404).json({ code: 404, message: '游戏不存在' });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取详情失败' });
  }
});

// 7. 搜索游戏接口 (支持关键词模糊搜索和分页)
app.get('/api/search', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 模糊匹配 title 或 tag
    const searchQuery = `%${keyword}%`;
    const [rows] = await db.query(
      'SELECT * FROM games WHERE status = 1 AND (title LIKE ? OR tag LIKE ?) ORDER BY id DESC LIMIT ? OFFSET ?',
      [searchQuery, searchQuery, limit, offset]
    );
    
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '搜索失败' });
  }
});

// --- 轮播图管理 (Admin用) API ---

// 8. 获取所有轮播图
app.get('/api/admin/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC, id DESC');
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 9. 新增轮播图
app.post('/api/banners', async (req, res) => {
  const { image_url, game_id, sort_order } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO banners (image_url, game_id, sort_order) VALUES (?, ?, ?)',
      [image_url, game_id || null, sort_order || 0]
    );
    res.json({ code: 0, message: '添加成功', data: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '添加失败' });
  }
});

// 10. 删除轮播图
app.delete('/api/banners/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

// --- 用户登录与注册 API ---
// 11. 账号密码登录 (如果账号不存在，则自动为其注册)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '账号和密码不能为空' });
  }

  // 可爱动物头像数组
  const animalAvatars = [
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Panda',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Bear',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Fox',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Cat',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Dog',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Rabbit',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Owl',
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Penguin'
  ];

  try {
    // 查找用户
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    let user = rows[0];

    if (!user) {
      // 走自动注册逻辑
      const hashedPassword = await bcrypt.hash(password, 10);
      // 从数组中随机选择一个头像
      const randomAvatar = animalAvatars[Math.floor(Math.random() * animalAvatars.length)];
      const [result] = await db.query(
        'INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)',
        [username, hashedPassword, randomAvatar]
      );
      user = { id: result.insertId, username, avatar: randomAvatar };
    } else {
      // 走登录密码校验逻辑
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({ code: 401, message: '密码错误' });
      }
    }

    // 登录成功，签发 Token (有效期7天)
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        userInfo: { id: user.id, username: user.username, avatar: user.avatar }
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

// --- 用户礼包 API ---

// 12. 领取游戏礼包
app.post('/api/gifts/claim', async (req, res) => {
  const { user_id, game_id } = req.body;
  
  if (!user_id || !game_id) {
    return res.status(400).json({ code: 400, message: '参数缺失' });
  }

  try {
    const giftCode = 'GIFT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    await db.query(
      'INSERT INTO user_gifts (user_id, game_id, gift_code) VALUES (?, ?, ?)',
      [user_id, game_id, giftCode]
    );
    
    res.json({ code: 0, message: '领取成功', data: { gift_code: giftCode } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.json({ code: 400, message: '您已经领取过该游戏的礼包啦' });
    } else {
      res.status(500).json({ code: 500, message: '领取失败' });
    }
  }
});

// 13. 获取“我的礼包”列表
app.get('/api/my/gifts', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });

  try {
    const [rows] = await db.query(`
      SELECT ug.gift_code, ug.created_at, g.title, g.cover
      FROM user_gifts ug
      JOIN games g ON ug.game_id = g.id
      WHERE ug.user_id = ?
      ORDER BY ug.id DESC
    `, [user_id]);
    
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});