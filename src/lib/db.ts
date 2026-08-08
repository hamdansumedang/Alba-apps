import { Pool } from 'pg';

// Konfigurasi koneksi PostgreSQL ke VPS Anda
const pool = new Pool({
  host: '72.61.210.185',
  port: 33090,
  user: 'superadmin',
  password: 'B-5millahberkah',
  database: 'alba-apps',
  ssl: false, // Ubah ke true jika menggunakan SSL di VPS
});

export default pool;
