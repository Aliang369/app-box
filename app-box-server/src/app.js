const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 创建初始数据库连接（不指定数据库）
const initDb = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let db = null;

// 初始化数据库
const initDatabase = async () => {
  try {
    // 创建数据库
    await initDb.query('CREATE DATABASE IF NOT EXISTS app_box');
    console.log('数据库初始化成功');
    
    // 重新连接到 app_box 数据库
    db = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'app_box',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 创建表
    await db.query(`CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      cover VARCHAR(500),
      tag VARCHAR(50),
      rating DECIMAL(2,1) DEFAULT 0,
      downloads VARCHAR(50) DEFAULT '0',
      short_desc TEXT,
      screenshots TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255),
      avatar VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      game_id INT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS user_gifts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      game_id INT NOT NULL,
      gift_code VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_game (user_id, game_id)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS gift_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id INT NOT NULL UNIQUE,
      gift_name VARCHAR(100) DEFAULT '新手礼包',
      gift_desc TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS user_favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      game_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_game (user_id, game_id)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS user_footprints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      game_id INT NOT NULL,
      view_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_game (user_id, game_id)
    )`);

    // 添加测试数据
    const [gameExists] = await db.query('SELECT COUNT(*) as count FROM games');
    if (gameExists[0].count === 0) {
      await db.query(`INSERT INTO games (title, cover, tag, rating, downloads, short_desc, screenshots) VALUES 
        ('王者荣耀', 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mobile%20game%20hero%20battle%20arena%20fantasy%20game%20cover&image_size=landscape_16_9', '热门竞技', 4.8, '2亿', '国民MOBA手游，5v5公平竞技', '["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=game%20screenshot%20battle%20scene&image_size=landscape_16_9"]'),
        ('和平精英', 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=battle%20royale%20game%20cover%20military%20shooter&image_size=landscape_16_9', '射击游戏', 4.7, '1.5亿', '百人空投，胜者为王', '["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=battle%20royale%20screenshot%20island&image_size=landscape_16_9"]'),
        ('原神', 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20style%20fantasy%20world%20game%20cover&image_size=landscape_16_9', '开放世界', 4.9, '1亿', '提瓦特大陆的奇幻冒险', '["https://neeko-copilot.bytedance.net/api/text_to_image?prompt=anime%20fantasy%20world%20screenshot&image_size=landscape_16_9"]')`);
    }

    console.log('所有表创建成功');
  } catch (err) {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  }
};

// 用户登录
app.post('/api/login', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ code: 400, message: '参数缺失' });
  
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      res.json({ code: 0, data: rows[0] });
    } else {
      await db.query('INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)', 
        [username, password, `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`]);
      const [newUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      res.json({ code: 0, data: newUser[0] });
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: '登录失败' });
  }
});

// 获取游戏列表
app.get('/api/games', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (page - 1) * pageSize;
  try {
    const [rows] = await db.query('SELECT * FROM games ORDER BY id DESC LIMIT ?, ?', [offset, pageSize]);
    const [count] = await db.query('SELECT COUNT(*) as total FROM games');
    res.json({ code: 0, data: { list: rows, total: count[0].total } });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 获取游戏详情
app.get('/api/games/:id', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: '游戏不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '获取失败' });
  }
});

// 获取轮播图列表
app.get('/api/banners', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: '获取失败' });
  }
});

// 领取礼包
app.post('/api/gifts/claim', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { user_id, game_id } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ code: 400, message: '参数缺失' });

  try {
    const [exists] = await db.query('SELECT * FROM user_gifts WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    if (exists.length > 0) {
      return res.status(400).json({ code: 400, message: '已领取过该礼包', gift_code: exists[0].gift_code });
    }
    
    const giftCode = 'BOX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
    await db.query('INSERT INTO user_gifts (user_id, game_id, gift_code) VALUES (?, ?, ?)', [user_id, game_id, giftCode]);
    res.json({ code: 0, message: '领取成功', gift_code: giftCode });
  } catch (error) {
    res.status(500).json({ code: 500, message: '领取失败' });
  }
});

// 获取我的礼包
app.get('/api/my/gifts', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });

  try {
    const [rows] = await db.query(`
      SELECT ug.*, g.title, g.cover 
      FROM user_gifts ug 
      JOIN games g ON ug.game_id = g.id 
      WHERE ug.user_id = ? ORDER BY ug.created_at DESC
    `, [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 切换收藏状态
app.post('/api/favorites/toggle', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
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

// 检查是否已收藏
app.get('/api/favorites/check', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { user_id, game_id } = req.query;
  if (!user_id || !game_id) return res.json({ code: 0, data: { isFavorited: false } });
  try {
    const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    res.json({ code: 0, data: { isFavorited: rows.length > 0 } });
  } catch (error) {
    res.json({ code: 0, data: { isFavorited: false } });
  }
});

// 获取我的收藏列表
app.get('/api/my/favorites', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });
  try {
    const [rows] = await db.query(`
      SELECT g.* FROM user_favorites uf 
      JOIN games g ON uf.game_id = g.id 
      WHERE uf.user_id = ? ORDER BY uf.created_at DESC
    `, [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 记录足迹
app.post('/api/footprints/add', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { user_id, game_id } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ code: 400, message: '参数缺失' });
  try {
    await db.query(`
      INSERT INTO user_footprints (user_id, game_id, view_time) VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE view_time = NOW()
    `, [user_id, game_id]);
    res.json({ code: 0, message: '记录成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '记录失败' });
  }
});

// 获取用户统计数据
app.get('/api/my/stats', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ code: 400, message: '未登录' });
  try {
    const [fav] = await db.query('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', [user_id]);
    const [foot] = await db.query('SELECT COUNT(*) as count FROM user_footprints WHERE user_id = ?', [user_id]);
    const [gift] = await db.query('SELECT COUNT(*) as count FROM user_gifts WHERE user_id = ?', [user_id]);
    res.json({ 
      code: 0, 
      data: { 
        favCount: fav[0].count, 
        footCount: foot[0].count, 
        giftCount: gift[0].count 
      } 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取失败' });
  }
});

// 获取我的足迹列表
app.get('/api/my/footprints', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
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

// ==========================================
// ====== 后台管理系统专用的 API ======
// ==========================================

// 后台：获取游戏列表
app.get('/api/admin/games', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query('SELECT * FROM games ORDER BY id DESC');
    res.json({ code: 0, data: rows });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：新增游戏
app.post('/api/games', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { title, cover, tag, rating, downloads, short_desc, screenshots } = req.body;
  try {
    await db.query('INSERT INTO games (title, cover, tag, rating, downloads, short_desc, screenshots) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, cover, tag, rating, downloads, short_desc, JSON.stringify(screenshots || [])]);
    res.json({ code: 0, message: '添加成功' });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：修改游戏
app.put('/api/games/:id', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { title, cover, tag, rating, downloads, short_desc, screenshots } = req.body;
  try {
    await db.query('UPDATE games SET title=?, cover=?, tag=?, rating=?, downloads=?, short_desc=?, screenshots=? WHERE id=?',
      [title, cover, tag, rating, downloads, short_desc, JSON.stringify(screenshots || []), req.params.id]);
    res.json({ code: 0, message: '修改成功' });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：删除游戏
app.delete('/api/games/:id', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try { await db.query('DELETE FROM games WHERE id=?', [req.params.id]); res.json({ code: 0 }); } catch (e) { res.json({ code: 500 }); }
});

// 后台：获取轮播图列表
app.get('/api/admin/banners', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC, id DESC');
    res.json({ code: 0, data: rows });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：新增轮播图
app.post('/api/banners', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { image_url, game_id, sort_order } = req.body;
  try {
    await db.query('INSERT INTO banners (image_url, game_id, sort_order) VALUES (?, ?, ?)', [image_url, game_id || null, sort_order || 0]);
    res.json({ code: 0 });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：修改轮播图
app.put('/api/banners/:id', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { image_url, game_id, sort_order } = req.body;
  try {
    await db.query('UPDATE banners SET image_url=?, game_id=?, sort_order=? WHERE id=?', [image_url, game_id || null, sort_order || 0, req.params.id]);
    res.json({ code: 0 });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：删除轮播图
app.delete('/api/banners/:id', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try { await db.query('DELETE FROM banners WHERE id=?', [req.params.id]); res.json({ code: 0 }); } catch (e) { res.json({ code: 500 }); }
});

// 后台：获取用户列表
app.get('/api/admin/users', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query('SELECT id, username, avatar, created_at FROM users ORDER BY id DESC');
    res.json({ code: 0, data: rows });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：获取礼包配置列表
app.get('/api/admin/gift-configs', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query(`
      SELECT g.id as game_id, g.title, g.cover, gc.id, gc.gift_name, gc.gift_desc
      FROM games g LEFT JOIN gift_configs gc ON g.id = gc.game_id ORDER BY g.id DESC
    `);
    res.json({ code: 0, data: rows });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：保存/更新礼包配置
app.post('/api/admin/gift-configs', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  const { game_id, gift_name, gift_desc } = req.body;
  try {
    await db.query(`
      INSERT INTO gift_configs (game_id, gift_name, gift_desc) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE gift_name = ?, gift_desc = ?
    `, [game_id, gift_name, gift_desc, gift_name, gift_desc]);
    res.json({ code: 0, message: '配置成功' });
  } catch (e) { res.json({ code: 500 }); }
});

// 后台：获取礼包领取记录
app.get('/api/admin/gift-records', async (req, res) => {
  if (!db) return res.status(500).json({ code: 500, message: '数据库未就绪' });
  
  try {
    const [rows] = await db.query(`
      SELECT ug.id, u.username, g.title, ug.gift_code, ug.created_at
      FROM user_gifts ug JOIN users u ON ug.user_id = u.id JOIN games g ON ug.game_id = g.id ORDER BY ug.id DESC
    `);
    res.json({ code: 0, data: rows });
  } catch (e) { res.json({ code: 500 }); }
});

// ==========================================

const PORT = 3000;

// 先初始化数据库，然后启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('启动失败:', err);
});
