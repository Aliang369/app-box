const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // 确保引用的是你的配置文件
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'appbox_super_secret_key_2024';

// 保证金刚区配置表存在（首次启动自动建表）
const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS home_navs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      icon VARCHAR(100) NOT NULL,
      link_url VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_visible TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS gift_configs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      game_id INT NOT NULL UNIQUE,
      gift_name VARCHAR(100) NOT NULL DEFAULT '',
      gift_desc VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS gift_code_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      game_id INT NOT NULL,
      gift_code VARCHAR(120) NOT NULL UNIQUE,
      is_claimed TINYINT(1) NOT NULL DEFAULT 0,
      claimed_by INT NULL,
      claimed_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 兼容历史库：为 games 表补充 size 字段（用于前端“大小”展示）
  try {
    await db.query(`ALTER TABLE games ADD COLUMN size VARCHAR(30) NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  // 兼容历史库：为 games 表补充 size_mb 数值字段（后台只填数字）
  try {
    await db.query(`ALTER TABLE games ADD COLUMN size_mb INT NOT NULL DEFAULT 0`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }
};
ensureTables().catch(err => console.error('初始化数据表失败:', err));

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

// 新增轮播图
app.post('/api/banners', async (req, res) => {
  const { image_url, game_id = null, sort_order = 0 } = req.body || {};
  if (!image_url) return res.json({ code: 400, message: '图片URL不能为空' });
  try {
    const [result] = await db.query(
      'INSERT INTO banners (image_url, game_id, sort_order) VALUES (?, ?, ?)',
      [image_url, game_id || null, Number(sort_order) || 0]
    );
    res.json({ code: 0, data: { id: result.insertId }, message: '添加成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '添加失败' });
  }
});

// 修改轮播图
app.put('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  const { image_url, game_id = null, sort_order = 0 } = req.body || {};
  if (!image_url) return res.json({ code: 400, message: '图片URL不能为空' });
  try {
    const [result] = await db.query(
      'UPDATE banners SET image_url = ?, game_id = ?, sort_order = ? WHERE id = ?',
      [image_url, game_id || null, Number(sort_order) || 0, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '轮播图不存在' });
    res.json({ code: 0, message: '修改成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '修改失败' });
  }
});

// 删除轮播图
app.delete('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '轮播图不存在' });
    res.json({ code: 0, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

// 获取首页金刚区（仅返回已展示配置）
app.get('/api/home-navs', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, icon, link_url, sort_order, is_visible FROM home_navs WHERE is_visible = 1 ORDER BY sort_order DESC, id DESC'
    );
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, message: '获取金刚区失败' });
  }
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
    const [rows] = await db.query(`
      SELECT
        g.*,
        gc.gift_name,
        gc.gift_desc
      FROM games g
      LEFT JOIN gift_configs gc ON g.id = gc.game_id
      WHERE g.id = ?
    `, [req.params.id]);
    res.json({ code: 0, data: rows[0] });
  } catch (e) { res.status(500).json({ code: 500 }); }
});

// 新增游戏
app.post('/api/games', async (req, res) => {
  const { title, cover, tag = '', short_desc = '', rating = 5, downloads = '', size = '', size_mb = 0, screenshots = [] } = req.body || {};
  if (!title || !cover) return res.json({ code: 400, message: '名称和封面不能为空' });
  try {
    const normalizedSizeMb = Number(size_mb) > 0 ? Number(size_mb) : (Number(size) > 0 ? Number(size) : 0);
    const screenshotsValue = Array.isArray(screenshots) ? JSON.stringify(screenshots) : (screenshots || '[]');
    const [result] = await db.query(
      'INSERT INTO games (title, cover, tag, short_desc, rating, downloads, size, size_mb, screenshots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, cover, tag, short_desc, Number(rating) || 0, downloads, size, normalizedSizeMb, screenshotsValue]
    );
    res.json({ code: 0, data: { id: result.insertId }, message: '添加成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '添加失败' });
  }
});

// 修改游戏
app.put('/api/games/:id', async (req, res) => {
  const { id } = req.params;
  const { title, cover, tag = '', short_desc = '', rating = 5, downloads = '', size = '', size_mb = 0, screenshots = [] } = req.body || {};
  if (!title || !cover) return res.json({ code: 400, message: '名称和封面不能为空' });
  try {
    const normalizedSizeMb = Number(size_mb) > 0 ? Number(size_mb) : (Number(size) > 0 ? Number(size) : 0);
    const screenshotsValue = Array.isArray(screenshots) ? JSON.stringify(screenshots) : (screenshots || '[]');
    const [result] = await db.query(
      'UPDATE games SET title = ?, cover = ?, tag = ?, short_desc = ?, rating = ?, downloads = ?, size = ?, size_mb = ?, screenshots = ? WHERE id = ?',
      [title, cover, tag, short_desc, Number(rating) || 0, downloads, size, normalizedSizeMb, screenshotsValue, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '游戏不存在' });
    res.json({ code: 0, message: '修改成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '修改失败' });
  }
});

// 删除游戏
app.delete('/api/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM games WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '游戏不存在' });
    res.json({ code: 0, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
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

// ==========================================
// 补回的缺失接口：礼包、收藏、足迹相关
// ==========================================

// 礼包领取
app.post('/api/gifts/claim', async (req, res) => {
  const { user_id, game_id } = req.body;
  try {
    const [configRows] = await db.query('SELECT id FROM gift_configs WHERE game_id = ?', [game_id]);
    if (!configRows.length) return res.json({ code: 404, message: '该游戏暂未配置礼包' });

    const [claimedRows] = await db.query('SELECT gift_code FROM user_gifts WHERE user_id = ? AND game_id = ? LIMIT 1', [user_id, game_id]);
    if (claimedRows.length) return res.json({ code: 400, message: '你已领取过该礼包', data: { gift_code: claimedRows[0].gift_code } });

    const [codeRows] = await db.query(
      'SELECT id, gift_code FROM gift_code_items WHERE game_id = ? AND is_claimed = 0 ORDER BY id ASC LIMIT 1',
      [game_id]
    );
    if (!codeRows.length) return res.json({ code: 410, message: '礼包已领完，请联系管理员补充激活码' });

    const giftCodeRow = codeRows[0];
    await db.query(
      'UPDATE gift_code_items SET is_claimed = 1, claimed_by = ?, claimed_at = NOW() WHERE id = ? AND is_claimed = 0',
      [user_id, giftCodeRow.id]
    );
    await db.query('INSERT INTO user_gifts (user_id, game_id, gift_code) VALUES (?, ?, ?)', [user_id, game_id, giftCodeRow.gift_code]);
    res.json({ code: 0, data: { gift_code: giftCodeRow.gift_code } });
  } catch (e) { res.json({ code: 500, message: '礼包领取失败' }); }
});

// 补回：获取我的礼包列表
app.get('/api/my/gifts', async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const [rows] = await db.query(`
      SELECT ug.gift_code, ug.created_at, g.title, g.cover 
      FROM user_gifts ug JOIN games g ON ug.game_id = g.id 
      WHERE ug.user_id = ? ORDER BY ug.id DESC
    `, [user_id]);
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) { res.status(500).json({ code: 500 }); }
});

// 补回：切换收藏状态
app.post('/api/favorites/toggle', async (req, res) => {
  const { user_id, game_id } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    if (rows.length > 0) {
      await db.query('DELETE FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
      res.json({ code: 0, message: '已取消收藏', data: { isFavorited: false } });
    } else {
      await db.query('INSERT INTO user_favorites (user_id, game_id) VALUES (?, ?)', [user_id, game_id]);
      res.json({ code: 0, message: '收藏成功', data: { isFavorited: true } });
    }
  } catch (error) { res.status(500).json({ code: 500 }); }
});

// 补回：检查是否收藏
app.get('/api/favorites/check', async (req, res) => {
  const { user_id, game_id } = req.query;
  try {
    const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    res.json({ code: 0, data: { isFavorited: rows.length > 0 } });
  } catch (error) { res.json({ code: 0, data: { isFavorited: false } }); }
});

// 补回：获取我的收藏列表
app.get('/api/my/favorites', async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const [rows] = await db.query(`
      SELECT g.* FROM user_favorites uf 
      JOIN games g ON uf.game_id = g.id 
      WHERE uf.user_id = ? ORDER BY uf.created_at DESC
    `, [user_id]);
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) { res.status(500).json({ code: 500 }); }
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

// 补回：获取我的足迹列表
app.get('/api/my/footprints', async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const [rows] = await db.query(`
      SELECT g.*, uf.view_time FROM user_footprints uf 
      JOIN games g ON uf.game_id = g.id 
      WHERE uf.user_id = ? ORDER BY uf.view_time DESC
    `, [user_id]);
    res.json({ code: 0, message: 'success', data: rows });
  } catch (error) { res.status(500).json({ code: 500 }); }
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

app.get('/api/admin/gift-configs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        gc.game_id,
        g.title,
        g.cover,
        gc.gift_name,
        gc.gift_desc,
        COUNT(gci.id) AS code_total,
        SUM(CASE WHEN gci.is_claimed = 0 THEN 1 ELSE 0 END) AS code_unused,
        gc.updated_at
      FROM gift_configs gc
      JOIN games g ON g.id = gc.game_id
      LEFT JOIN gift_code_items gci ON gci.game_id = gc.game_id
      GROUP BY gc.id, gc.game_id, g.title, g.cover, gc.gift_name, gc.gift_desc, gc.updated_at
      ORDER BY gc.updated_at DESC, gc.id DESC
    `);
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, message: '获取礼包配置失败' });
  }
});

app.post('/api/admin/gift-configs', async (req, res) => {
  const { game_id, gift_name = '', gift_desc = '' } = req.body || {};
  if (!game_id) return res.json({ code: 400, message: '游戏ID不能为空' });
  try {
    const [gameRows] = await db.query('SELECT id FROM games WHERE id = ?', [game_id]);
    if (!gameRows.length) return res.json({ code: 404, message: '游戏ID不存在，请先到游戏管理确认ID' });

    await db.query(
      `
      INSERT INTO gift_configs (game_id, gift_name, gift_desc)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        gift_name = VALUES(gift_name),
        gift_desc = VALUES(gift_desc)
    `,
      [game_id, gift_name, gift_desc]
    );
    res.json({ code: 0, message: '配置保存成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '保存礼包配置失败' });
  }
});

app.get('/api/admin/gift-code-items', async (req, res) => {
  const { game_id } = req.query;
  if (!game_id) return res.json({ code: 400, message: '游戏ID不能为空' });
  try {
    const [rows] = await db.query(
      `
      SELECT id, gift_code, is_claimed, claimed_by, claimed_at, created_at
      FROM gift_code_items
      WHERE game_id = ?
      ORDER BY is_claimed ASC, id DESC
    `,
      [game_id]
    );
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, message: '获取激活码列表失败' });
  }
});

app.post('/api/admin/gift-code-items/batch', async (req, res) => {
  const { game_id, codes = [] } = req.body || {};
  if (!game_id) return res.json({ code: 400, message: '游戏ID不能为空' });
  try {
    const [gameRows] = await db.query('SELECT id FROM games WHERE id = ?', [game_id]);
    if (!gameRows.length) return res.json({ code: 404, message: '游戏ID不存在，请先到游戏管理确认ID' });

    const normalizedCodes = Array.from(
      new Set(
        (Array.isArray(codes) ? codes : [])
          .map(code => String(code || '').trim())
          .filter(Boolean)
      )
    );
    if (!normalizedCodes.length) return res.json({ code: 400, message: '请至少填写一个激活码' });

    let addedCount = 0;
    for (const giftCode of normalizedCodes) {
      try {
        await db.query('INSERT INTO gift_code_items (game_id, gift_code) VALUES (?, ?)', [game_id, giftCode]);
        addedCount += 1;
      } catch (err) {
        if (!err || err.code !== 'ER_DUP_ENTRY') throw err;
      }
    }

    res.json({ code: 0, data: { addedCount }, message: `成功新增 ${addedCount} 个激活码` });
  } catch (e) {
    res.status(500).json({ code: 500, message: '保存激活码失败' });
  }
});

app.delete('/api/admin/gift-code-items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, is_claimed FROM gift_code_items WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '激活码不存在' });
    if (Number(rows[0].is_claimed) === 1) return res.json({ code: 400, message: '已发放激活码不允许删除' });

    await db.query('DELETE FROM gift_code_items WHERE id = ? AND is_claimed = 0', [id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '删除激活码失败' });
  }
});

// 金刚区配置列表（后台）
app.get('/api/admin/home-navs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM home_navs ORDER BY sort_order DESC, id DESC');
    res.json({ code: 0, data: rows });
  } catch (e) {
    res.status(500).json({ code: 500, message: '获取金刚区配置失败' });
  }
});

// 新增金刚区配置
app.post('/api/admin/home-navs', async (req, res) => {
  const { name, icon, link_url, sort_order = 0, is_visible = 1 } = req.body || {};
  if (!name || !icon || !link_url) {
    return res.json({ code: 400, message: '名称、图标、跳转链接不能为空' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO home_navs (name, icon, link_url, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)',
      [name, icon, link_url, Number(sort_order) || 0, is_visible ? 1 : 0]
    );
    res.json({ code: 0, data: { id: result.insertId }, message: '新增成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '新增失败' });
  }
});

// 修改金刚区配置
app.put('/api/admin/home-navs/:id', async (req, res) => {
  const { id } = req.params;
  const { name, icon, link_url, sort_order = 0, is_visible = 1 } = req.body || {};
  if (!name || !icon || !link_url) {
    return res.json({ code: 400, message: '名称、图标、跳转链接不能为空' });
  }
  try {
    await db.query(
      'UPDATE home_navs SET name = ?, icon = ?, link_url = ?, sort_order = ?, is_visible = ? WHERE id = ?',
      [name, icon, link_url, Number(sort_order) || 0, is_visible ? 1 : 0, id]
    );
    res.json({ code: 0, message: '修改成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '修改失败' });
  }
});

// 切换显示隐藏
app.patch('/api/admin/home-navs/:id/visible', async (req, res) => {
  const { id } = req.params;
  const { is_visible } = req.body || {};
  try {
    await db.query('UPDATE home_navs SET is_visible = ? WHERE id = ?', [is_visible ? 1 : 0, id]);
    res.json({ code: 0, message: '状态更新成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '状态更新失败' });
  }
});

// 删除金刚区配置
app.delete('/api/admin/home-navs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM home_navs WHERE id = ?', [id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
});

app.listen(3000, () => console.log('Server running on 3000'));
