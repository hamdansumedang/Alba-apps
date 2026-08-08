import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: '72.61.210.185',
  port: 33090,
  user: 'superadmin',
  password: 'B-5millahberkah',
  database: 'alba-apps',
  ssl: false,
});

app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: dbRes.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        success: true,
        message: 'Login berhasil',
        user: { id: user.id, username: user.username, role: user.role }
      });
    } else {
      res.status(401).json({ success: false, message: 'Username atau password salah' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend API berjalan di http://localhost:${port}`);
});
