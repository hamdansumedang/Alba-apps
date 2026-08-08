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

async function updateAdmin() {
  try {
    const client = await pool.connect();
    
    // Pastikan tabel users ada
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Hapus atau update user admin@brontolano.com
    await client.query(`
      INSERT INTO users (username, password, role)
      VALUES ('admin@brontolano.com', 'B-5millahberkah', 'admin')
      ON CONFLICT (username) 
      DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;
    `);

    console.log('✅ Berhasil memperbarui user: admin@brontolano.com | B-5millahberkah');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal memperbarui admin:', err);
    process.exit(1);
  }
}

updateAdmin();
