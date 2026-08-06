# User Flow - ALBA-APPS

---

## Flow 1: Staff Input Transaksi (Paling Sering)

1. Buka aplikasi di HP
2. Login (jika belum)
3. Tekan tombol **+ Transaksi Baru**
4. Isi:
   - Tanggal (default hari ini)
   - Unit (otomatis sesuai login)
   - Kategori
   - Metode Bayar (TF / Tunai)
   - Jumlah (Debit atau Kredit)
   - Keterangan
   - **Ambil Foto Nota** (kamera)
5. Tekan **Simpan**
6. Data langsung muncul di Buku Besar + sync ke cloud

---

## Flow 2: Kepala Keuangan Melihat Laporan

1. Buka Dashboard
2. Lihat ringkasan:
   - Saldo per unit
   - Total pengeluaran hari ini
   - Transaksi terbaru
3. Buka **Buku Besar**
4. Filter berdasarkan:
   - Tanggal
   - Unit
   - Kategori
5. Bisa export ke Excel/PDF

---

## Flow 3: Mode Offline

1. User input transaksi saat tidak ada internet
2. Data disimpan di HP (local)
3. Saat online kembali:
   - Data otomatis ter-sync
   - Running balance diperbarui
   - Foto bukti ter-upload

---

## Flow 4: Master Data (Admin Only)

Kepala Keuangan bisa menambah:
- Kategori baru
- Metode pembayaran
- User baru + assign ke unit

---

## Catatan UX
- Semua halaman harus **satu tangan friendly** (thumb zone)
- Tombol besar di mobile
- Konfirmasi sebelum hapus transaksi
- Loading indicator saat sync offline → online