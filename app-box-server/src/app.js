const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});