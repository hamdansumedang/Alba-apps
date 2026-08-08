#!/bin/bash
echo "🚀 Memulai proses 1-klik deploy aplikasi ALBA-APPS..."

# 1. Pastikan dependensi terinstal
echo "📦 Menginstal dependensi..."
npm install

# 2. Setup user admin di database VPS
echo "👤 Menyiapkan database & user admin di VPS..."
node setup-admin.js

# 3. Build aplikasi frontend
echo "🔨 Membangun (build) aplikasi frontend..."
npm run build

echo "✅ Siapan selesai! Anda dapat menjalankan aplikasi dengan perintah:"
echo "   node server.js"
echo "Atau menggunakan Docker:"
echo "   docker-compose up --build -d"
