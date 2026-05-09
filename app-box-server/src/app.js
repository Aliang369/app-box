const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/games', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games WHERE status = 1 ORDER BY id DESC');
    
    res.json({
      code: 0,
      message: 'success',
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: '数据库查询失败' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});