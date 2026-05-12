const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // 确保引用的是你的配置文件
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'appbox_super_secret_key_2024';
const REFRESH_TOKEN_SECRET = 'appbox_refresh_secret_key_2024';
const AGREEMENT_VERSIONS = {
  user: '2026.05',
  privacy: '2026.05'
};
const USER_STATUS = {
  active: 1,
  frozen: 2
};
const BANNER_JUMP_TYPES = {
  none: 'none',
  game: 'game',
  h5: 'h5'
};

const createAvatar = (seed) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;

const createRandomNickname = (username = '') => {
  const prefixes = ['云野', '星跃', '青岚', '白露', '流光', '南栀', '景行', '知夏'];
  const suffixes = ['玩家', '旅人', '指挥官', '冒险家', '探索者', '达人', '同学', '队长'];
  const usernameTail = String(username).replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase();
  const randomNumber = Math.floor(Math.random() * 900 + 100);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}${usernameTail || randomNumber}`;
};

const normalizeUserStatus = (status) => {
  const normalizedStatus = Number(status) || USER_STATUS.active;
  return normalizedStatus === USER_STATUS.frozen ? USER_STATUS.frozen : USER_STATUS.active;
};

const getUserStatusLabel = (status) => {
  return normalizeUserStatus(status) === USER_STATUS.frozen ? '已冻结' : '正常';
};

const buildUserStatusMessage = (user = {}) => {
  if (normalizeUserStatus(user.user_status) !== USER_STATUS.frozen) return '';
  return '当前用户账号异常，请联系管理员处理';
};

const sanitizeUser = (user = {}) => ({
  id: user.id,
  username: user.username,
  nickname: user.nickname || '',
  avatar: user.avatar || '',
  created_at: user.created_at,
  account_status: {
    value: normalizeUserStatus(user.user_status),
    label: getUserStatusLabel(user.user_status),
    reason: user.status_reason || '',
    changedAt: user.status_changed_at || '',
    changedBy: user.status_changed_by || ''
  },
  agreement_status: {
    userVersion: user.user_agreement_version || '',
    privacyVersion: user.privacy_agreement_version || '',
    currentUserVersion: AGREEMENT_VERSIONS.user,
    currentPrivacyVersion: AGREEMENT_VERSIONS.privacy,
    needConfirm:
      user.user_agreement_version !== AGREEMENT_VERSIONS.user ||
      user.privacy_agreement_version !== AGREEMENT_VERSIONS.privacy
  }
});

const issueAuthPayload = (user = {}) => {
  const accessToken = jwt.sign({ id: user.id, username: user.username, type: 'access' }, JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, type: 'refresh', version: Number(user.refresh_token_version) || 0 },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );

  return {
    token: accessToken,
    refreshToken,
    userInfo: sanitizeUser(user)
  };
};

const normalizeBannerJumpType = (jumpType, fallbackGameId) => {
  const normalizedType = String(jumpType || '').trim().toLowerCase();
  if (normalizedType === BANNER_JUMP_TYPES.h5) return BANNER_JUMP_TYPES.h5;
  if (normalizedType === BANNER_JUMP_TYPES.game) return BANNER_JUMP_TYPES.game;
  if (normalizedType === BANNER_JUMP_TYPES.none) return BANNER_JUMP_TYPES.none;
  return Number(fallbackGameId) > 0 ? BANNER_JUMP_TYPES.game : BANNER_JUMP_TYPES.none;
};

const normalizeBannerPayload = (payload = {}) => {
  const image_url = String(payload.image_url || '').trim();
  const sort_order = Number(payload.sort_order) || 0;
  const rawGameId = payload.game_id ?? payload.jump_value ?? '';
  const jump_type = normalizeBannerJumpType(payload.jump_type, rawGameId);

  if (jump_type === BANNER_JUMP_TYPES.game) {
    const gameId = Number(rawGameId);
    return {
      image_url,
      sort_order,
      jump_type,
      jump_value: gameId > 0 ? String(gameId) : '',
      game_id: gameId > 0 ? gameId : null
    };
  }

  if (jump_type === BANNER_JUMP_TYPES.h5) {
    const jumpValue = String(payload.jump_value ?? payload.h5_url ?? payload.link_url ?? '').trim();
    return {
      image_url,
      sort_order,
      jump_type,
      jump_value: jumpValue,
      game_id: null
    };
  }

  return {
    image_url,
    sort_order,
    jump_type: BANNER_JUMP_TYPES.none,
    jump_value: '',
    game_id: null
  };
};

const normalizeBannerRecord = (row = {}) => {
  const jump_type = normalizeBannerJumpType(row.jump_type, row.game_id);
  const jump_value =
    jump_type === BANNER_JUMP_TYPES.game
      ? (Number(row.game_id) > 0 ? String(row.game_id) : '')
      : (String(row.jump_value || '').trim());

  return {
    ...row,
    jump_type,
    jump_value,
    game_id: Number(row.game_id) > 0 ? Number(row.game_id) : null
  };
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7);
};

const authRequired = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ code: 401, message: '登录状态已失效，请重新登录' });

    const payload = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query(
      `SELECT id, username, nickname, avatar, created_at,
        refresh_token_version, user_agreement_version, privacy_agreement_version,
        user_status, status_reason, status_changed_at, status_changed_by
       FROM users WHERE id = ? LIMIT 1`,
      [payload.id]
    );
    if (!rows.length) return res.status(401).json({ code: 401, message: '当前账号不存在' });
    if (normalizeUserStatus(rows[0].user_status) === USER_STATUS.frozen) {
      return res.status(403).json({
        code: 403,
        message: buildUserStatusMessage(rows[0]),
        forceLogout: true
      });
    }

    req.authUser = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '登录状态已失效，请重新登录' });
  }
};

// 保证金刚区配置表存在（首次启动自动建表）
const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      nickname VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(255) NOT NULL DEFAULT '',
      refresh_token_version INT NOT NULL DEFAULT 0,
      user_status TINYINT(1) NOT NULL DEFAULT 1,
      status_reason VARCHAR(255) NOT NULL DEFAULT '',
      status_changed_at TIMESTAMP NULL DEFAULT NULL,
      status_changed_by VARCHAR(50) NOT NULL DEFAULT '',
      user_agreement_version VARCHAR(20) NOT NULL DEFAULT '',
      privacy_agreement_version VARCHAR(20) NOT NULL DEFAULT '',
      user_agreement_confirmed_at TIMESTAMP NULL DEFAULT NULL,
      privacy_agreement_confirmed_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_status_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      action VARCHAR(20) NOT NULL DEFAULT '',
      reason VARCHAR(255) NOT NULL DEFAULT '',
      operator_name VARCHAR(50) NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      image_url VARCHAR(255) NOT NULL,
      game_id INT NULL DEFAULT NULL,
      jump_type VARCHAR(20) NOT NULL DEFAULT 'none',
      jump_value VARCHAR(255) NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

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
    await db.query(`ALTER TABLE banners ADD COLUMN game_id INT NULL DEFAULT NULL`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE banners ADD COLUMN jump_type VARCHAR(20) NOT NULL DEFAULT 'none'`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE banners ADD COLUMN jump_value VARCHAR(255) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE banners ADD COLUMN sort_order INT NOT NULL DEFAULT 0`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

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

  try {
    await db.query(`ALTER TABLE users ADD COLUMN nickname VARCHAR(50) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN refresh_token_version INT NOT NULL DEFAULT 0`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN user_status TINYINT(1) NOT NULL DEFAULT 1`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN status_reason VARCHAR(255) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN status_changed_at TIMESTAMP NULL DEFAULT NULL`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN status_changed_by VARCHAR(50) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN user_agreement_version VARCHAR(20) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN privacy_agreement_version VARCHAR(20) NOT NULL DEFAULT ''`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN user_agreement_confirmed_at TIMESTAMP NULL DEFAULT NULL`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  try {
    await db.query(`ALTER TABLE users ADD COLUMN privacy_agreement_confirmed_at TIMESTAMP NULL DEFAULT NULL`);
  } catch (err) {
    if (!err || (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_NO_SUCH_TABLE')) throw err;
  }

  await db.query(`
    UPDATE users
    SET
      nickname = CASE
        WHEN nickname IS NULL OR nickname = '' THEN CONCAT('玩家', LPAD(id, 4, '0'))
        ELSE nickname
      END,
      avatar = CASE
        WHEN avatar IS NULL OR avatar = '' THEN ?
        ELSE avatar
      END
  `, [createAvatar('default-user')]);

  await db.query(`
    UPDATE banners
    SET
      jump_type = CASE
        WHEN (jump_type IS NULL OR jump_type = '') AND game_id IS NOT NULL THEN 'game'
        WHEN jump_type IS NULL OR jump_type = '' THEN 'none'
        ELSE jump_type
      END,
      jump_value = CASE
        WHEN (jump_value IS NULL OR jump_value = '') AND game_id IS NOT NULL THEN CAST(game_id AS CHAR)
        WHEN jump_value IS NULL THEN ''
        ELSE jump_value
      END
  `);
};
ensureTables().catch(err => console.error('初始化数据表失败:', err));

// ==========================================
// ====== 1. C端 (手机App) 业务接口 =======
// ==========================================

// 获取轮播图
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order DESC, id DESC');
    res.json({ code: 0, data: rows.map(normalizeBannerRecord) });
  } catch (e) { res.status(500).json({ code: 500 }); }
});

// 新增轮播图
app.post('/api/banners', async (req, res) => {
  const { image_url, game_id, jump_type, jump_value, sort_order } = normalizeBannerPayload(req.body);
  if (!image_url) return res.json({ code: 400, message: '图片URL不能为空' });
  if (jump_type === BANNER_JUMP_TYPES.game && !game_id) {
    return res.json({ code: 400, message: '请选择有效的游戏ID' });
  }
  if (jump_type === BANNER_JUMP_TYPES.h5 && !jump_value) {
    return res.json({ code: 400, message: 'H5地址不能为空' });
  }
  try {
    if (game_id) {
      const [gameRows] = await db.query('SELECT id FROM games WHERE id = ? LIMIT 1', [game_id]);
      if (!gameRows.length) return res.json({ code: 404, message: '游戏ID不存在，请先确认游戏配置' });
    }
    const [result] = await db.query(
      'INSERT INTO banners (image_url, game_id, jump_type, jump_value, sort_order) VALUES (?, ?, ?, ?, ?)',
      [image_url, game_id, jump_type, jump_value, sort_order]
    );
    res.json({ code: 0, data: { id: result.insertId }, message: '添加成功' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '添加失败' });
  }
});

// 修改轮播图
app.put('/api/banners/:id', async (req, res) => {
  const { id } = req.params;
  const { image_url, game_id, jump_type, jump_value, sort_order } = normalizeBannerPayload(req.body);
  if (!image_url) return res.json({ code: 400, message: '图片URL不能为空' });
  if (jump_type === BANNER_JUMP_TYPES.game && !game_id) {
    return res.json({ code: 400, message: '请选择有效的游戏ID' });
  }
  if (jump_type === BANNER_JUMP_TYPES.h5 && !jump_value) {
    return res.json({ code: 400, message: 'H5地址不能为空' });
  }
  try {
    if (game_id) {
      const [gameRows] = await db.query('SELECT id FROM games WHERE id = ? LIMIT 1', [game_id]);
      if (!gameRows.length) return res.json({ code: 404, message: '游戏ID不存在，请先确认游戏配置' });
    }
    const [result] = await db.query(
      'UPDATE banners SET image_url = ?, game_id = ?, jump_type = ?, jump_value = ?, sort_order = ? WHERE id = ?',
      [image_url, game_id, jump_type, jump_value, sort_order, id]
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

// 注册
app.post('/api/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body || {};
  const normalizedUsername = String(username || '').trim();
  const normalizedPassword = String(password || '');
  const normalizedConfirmPassword = String(confirmPassword || '');

  if (!/^[a-zA-Z0-9_]{4,20}$/.test(normalizedUsername)) {
    return res.json({ code: 400, message: '账号需为4-20位字母、数字或下划线' });
  }

  if (normalizedPassword.length < 6 || normalizedPassword.length > 20) {
    return res.json({ code: 400, message: '密码长度需为6-20位' });
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    return res.json({ code: 400, message: '两次输入的密码不一致' });
  }

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE username = ? LIMIT 1', [normalizedUsername]);
    if (rows.length) return res.json({ code: 400, message: '该账号已存在，请直接登录' });

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const nickname = createRandomNickname(normalizedUsername);
    const avatar = createAvatar(normalizedUsername);

    await db.query(
      'INSERT INTO users (username, nickname, password, avatar) VALUES (?, ?, ?, ?)',
      [normalizedUsername, nickname, hashedPassword, avatar]
    );

    res.json({ code: 0, message: '注册成功，请使用账号密码登录' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '注册失败，请稍后重试' });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const normalizedUsername = String(username || '').trim();
  const normalizedPassword = String(password || '');

  if (!normalizedUsername || !normalizedPassword) {
    return res.json({ code: 400, message: '账号和密码不能为空' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? LIMIT 1', [normalizedUsername]);
    const user = rows[0];
    if (!user) return res.json({ code: 404, message: '当前账号不存在，请先注册' });

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    if (!isMatch) return res.json({ code: 401, message: '请输入正确账号或密码' });
    if (normalizeUserStatus(user.user_status) === USER_STATUS.frozen) {
      return res.status(403).json({ code: 403, message: buildUserStatusMessage(user) });
    }

    res.json({ code: 0, data: issueAuthPayload(user) });
  } catch (e) {
    res.status(500).json({ code: 500, message: '登录失败，请稍后重试' });
  }
});

// 刷新 token
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = String(req.body?.refreshToken || '').trim();
  if (!refreshToken) return res.status(401).json({ code: 401, message: '缺少刷新凭证，请重新登录' });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    if (payload.type !== 'refresh') return res.status(401).json({ code: 401, message: '刷新凭证无效' });

    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [payload.id]);
    const user = rows[0];
    if (!user) return res.status(401).json({ code: 401, message: '账号不存在，请重新登录' });
    if (normalizeUserStatus(user.user_status) === USER_STATUS.frozen) {
      return res.status(403).json({
        code: 403,
        message: buildUserStatusMessage(user),
        forceLogout: true
      });
    }

    if ((Number(payload.version) || 0) !== (Number(user.refresh_token_version) || 0)) {
      return res.status(401).json({ code: 401, message: '登录状态已失效，请重新登录' });
    }

    res.json({ code: 0, data: issueAuthPayload(user) });
  } catch (error) {
    res.status(401).json({ code: 401, message: '登录状态已失效，请重新登录' });
  }
});

// 获取个人资料
app.get('/api/user/profile', authRequired, async (req, res) => {
  res.json({ code: 0, data: sanitizeUser(req.authUser) });
});

// 获取协议版本信息
app.get('/api/agreements/meta', async (req, res) => {
  res.json({
    code: 0,
    data: {
      userVersion: AGREEMENT_VERSIONS.user,
      privacyVersion: AGREEMENT_VERSIONS.privacy,
      updatedAt: '2026-05-11'
    }
  });
});

// 确认协议版本
app.post('/api/user/agreement/confirm', authRequired, async (req, res) => {
  const userVersion = String(req.body?.userVersion || '');
  const privacyVersion = String(req.body?.privacyVersion || '');

  if (userVersion !== AGREEMENT_VERSIONS.user || privacyVersion !== AGREEMENT_VERSIONS.privacy) {
    return res.json({ code: 400, message: '协议版本已更新，请刷新后重试' });
  }

  try {
    await db.query(
      `UPDATE users
       SET user_agreement_version = ?, privacy_agreement_version = ?,
           user_agreement_confirmed_at = NOW(), privacy_agreement_confirmed_at = NOW()
       WHERE id = ?`,
      [userVersion, privacyVersion, req.authUser.id]
    );

    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.authUser.id]);
    res.json({ code: 0, message: '协议确认成功', data: sanitizeUser(rows[0]) });
  } catch (error) {
    res.status(500).json({ code: 500, message: '协议确认失败' });
  }
});

// 修改昵称
app.put('/api/user/profile/nickname', authRequired, async (req, res) => {
  const nickname = String(req.body?.nickname || '').trim();
  if (nickname.length < 2 || nickname.length > 20) {
    return res.json({ code: 400, message: '昵称长度需为2-20位' });
  }

  try {
    await db.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, req.authUser.id]);
    const [rows] = await db.query(
      `SELECT id, username, nickname, avatar, created_at,
        refresh_token_version, user_agreement_version, privacy_agreement_version,
        user_status, status_reason, status_changed_at, status_changed_by
       FROM users WHERE id = ? LIMIT 1`,
      [req.authUser.id]
    );
    res.json({ code: 0, message: '昵称修改成功', data: sanitizeUser(rows[0]) });
  } catch (e) {
    res.status(500).json({ code: 500, message: '昵称修改失败' });
  }
});

// 修改密码
app.put('/api/user/profile/password', authRequired, async (req, res) => {
  const oldPassword = String(req.body?.oldPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  const confirmPassword = String(req.body?.confirmPassword || '');

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.json({ code: 400, message: '请完整填写密码信息' });
  }

  if (newPassword.length < 6 || newPassword.length > 20) {
    return res.json({ code: 400, message: '新密码长度需为6-20位' });
  }

  if (newPassword !== confirmPassword) {
    return res.json({ code: 400, message: '两次输入的新密码不一致' });
  }

  try {
    const [rows] = await db.query('SELECT id, password, refresh_token_version FROM users WHERE id = ? LIMIT 1', [req.authUser.id]);
    const currentUser = rows[0];
    if (!currentUser) return res.status(404).json({ code: 404, message: '用户不存在' });

    const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
    if (!isMatch) return res.json({ code: 400, message: '原密码不正确' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ?, refresh_token_version = refresh_token_version + 1 WHERE id = ?',
      [hashedPassword, req.authUser.id]
    );
    res.json({ code: 0, message: '密码修改成功，请重新登录' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '密码修改失败' });
  }
});

// ==========================================
// 补回的缺失接口：礼包、收藏、足迹相关
// ==========================================

// 礼包领取
app.post('/api/gifts/claim', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
  const { game_id } = req.body;
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
app.get('/api/my/gifts', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
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
app.post('/api/favorites/toggle', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
  const { game_id } = req.body;
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
app.get('/api/favorites/check', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
  const { game_id } = req.query;
  try {
    const [rows] = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?', [user_id, game_id]);
    res.json({ code: 0, data: { isFavorited: rows.length > 0 } });
  } catch (error) { res.json({ code: 0, data: { isFavorited: false } }); }
});

// 补回：获取我的收藏列表
app.get('/api/my/favorites', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
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
app.get('/api/my/stats', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
  try {
    const [[fav]] = await db.query('SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ?', [user_id]);
    const [[foot]] = await db.query('SELECT COUNT(*) as count FROM user_footprints WHERE user_id = ?', [user_id]);
    const [[gift]] = await db.query('SELECT COUNT(*) as count FROM user_gifts WHERE user_id = ?', [user_id]);
    res.json({ code: 0, data: { favCount: fav.count, footCount: foot.count, giftCount: gift.count } });
  } catch (e) { res.json({ code: 0, data: { favCount: 0, footCount: 0, giftCount: 0 } }); }
});

// 记录足迹
app.post('/api/footprints/add', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
  const { game_id } = req.body;
  try {
    await db.query('INSERT INTO user_footprints (user_id, game_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE view_time = CURRENT_TIMESTAMP', [user_id, game_id]);
    res.json({ code: 0 });
  } catch (e) { res.json({ code: 500 }); }
});

// 补回：获取我的足迹列表
app.get('/api/my/footprints', authRequired, async (req, res) => {
  const user_id = req.authUser.id;
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
  res.json({ code: 0, data: rows.map(normalizeBannerRecord) });
});

app.get('/api/admin/users', async (req, res) => {
  const username = String(req.query.username || '').trim();
  const nickname = String(req.query.nickname || '').trim();
  let sql =
    'SELECT id, username, nickname, avatar, created_at, user_status, status_reason, status_changed_at, status_changed_by FROM users WHERE 1 = 1';
  const params = [];
  if (username) {
    sql += ' AND username LIKE ?';
    params.push(`%${username}%`);
  }
  if (nickname) {
    sql += ' AND nickname LIKE ?';
    params.push(`%${nickname}%`);
  }
  sql += ' ORDER BY id DESC';
  const [rows] = await db.query(sql, params);
  res.json({ code: 0, data: rows });
});

const createRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

app.put('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const nickname = String(req.body?.nickname || '').trim();
  const password = String(req.body?.password || '').trim();

  if (!nickname) return res.json({ code: 400, message: '昵称不能为空' });
  if (nickname.length < 2 || nickname.length > 20) return res.json({ code: 400, message: '昵称长度需为2-20位' });
  if (password && (password.length < 6 || password.length > 20)) return res.json({ code: 400, message: '密码长度需为6-20位' });

  try {
    const [userRows] = await db.query('SELECT id FROM users WHERE id = ? LIMIT 1', [id]);
    if (!userRows.length) return res.status(404).json({ code: 404, message: '用户不存在' });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET nickname = ?, password = ?, refresh_token_version = refresh_token_version + 1 WHERE id = ?',
        [nickname, hashedPassword, id]
      );
    } else {
      await db.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, id]);
    }

    res.json({ code: 0, message: '用户信息更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '用户信息更新失败' });
  }
});

app.post('/api/admin/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;

  try {
    const [userRows] = await db.query('SELECT id, username FROM users WHERE id = ? LIMIT 1', [id]);
    if (!userRows.length) return res.status(404).json({ code: 404, message: '用户不存在' });

    const randomPassword = createRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    await db.query(
      'UPDATE users SET password = ?, refresh_token_version = refresh_token_version + 1 WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ code: 0, data: { randomPassword }, message: '密码已重置' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '重置密码失败' });
  }
});

app.patch('/api/admin/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const status = normalizeUserStatus(req.body?.status);
  const reason = String(req.body?.reason || '').trim();
  const operator = String(req.body?.operator || '').trim() || '后台管理员';

  if (status === USER_STATUS.frozen && !reason) {
    return res.json({ code: 400, message: '冻结账号时必须填写原因' });
  }

  try {
    const [rows] = await db.query('SELECT id, user_status FROM users WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ code: 404, message: '用户不存在' });

    await db.query(
      `UPDATE users
       SET user_status = ?, status_reason = ?, status_changed_at = NOW(), status_changed_by = ?,
           refresh_token_version = refresh_token_version + 1
       WHERE id = ?`,
      [status, status === USER_STATUS.frozen ? reason : '', operator, id]
    );

    const action = status === USER_STATUS.frozen ? 'freeze' : 'unfreeze';
    await db.query(
      'INSERT INTO user_status_logs (user_id, action, reason, operator_name) VALUES (?, ?, ?, ?)',
      [id, action, reason, operator]
    );

    res.json({ code: 0, message: status === USER_STATUS.frozen ? '账号已冻结' : '账号已恢复正常' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '账号状态更新失败' });
  }
});

app.get('/api/admin/users/:id/status-logs', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, user_id, action, reason, operator_name, created_at
       FROM user_status_logs
       WHERE user_id = ?
       ORDER BY id DESC`,
      [id]
    );
    res.json({ code: 0, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '获取冻结日志失败' });
  }
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
