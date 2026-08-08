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

async function setupAdmin() {
  try {
    const client = await pool.connect();
    
    // Buat tabel users jika belum ada
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Masukkan user superadmin dengan password bismillah (plain atau di-hash nanti)
    // Untuk sederhana, kita masukkan dengan teks biasa atau pengecekan duplikat
    const check = await client.query('SELECT * FROM users WHERE username = $1', ['superadmin']);
    
    if (check.rows.length === `0`) {
      await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['superadmin', 'bismillah', 'admin']
      );
      console.log('✅ Berhasil menambahkan user: superadmin | bismillah');
    } else {
      console.log('ℹ️ User superadmin sudah ada di database.');
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal setup admin:', err);
    process.exit(1);
  }
}

setupAdmin();
