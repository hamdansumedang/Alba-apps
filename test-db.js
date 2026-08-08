import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: '72.61.210.185',
  port: 33090,
  user: 'superadmin',
  password: 'B-5millahberkah',
  database: 'alba-apps',
  ssl: false,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Berhasil terhubung ke database VPS PostgreSQL!');
    console.log('Waktu database:', res.rows[0].now);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal terhubung ke database VPS:', err);
    process.exit(1);
  }
}

testConnection();
