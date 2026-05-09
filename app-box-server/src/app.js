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
  const { title, tag, cover, short_desc, rating, downloads } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO games (title, tag, cover, short_desc, rating, downloads) VALUES (?, ?, ?, ?, ?, ?)',
      [title || '未命名游戏', tag || '默认', cover || '', short_desc || '', rating || 5.0, downloads || '0']
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});