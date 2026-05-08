const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const mockGames = [
  { id: 1, title: '服务端下发的游戏', rating: '5.0', tag: '动作', cover: 'https://picsum.photos/200/200?random=100' }
];

app.get('/api/games', (req, res) => {
  res.json({ code: 0, message: 'success', data: mockGames });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});