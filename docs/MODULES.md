# MODULES - ALBA-APPS (Fitur & Modul Utama)

## 1. Core – Buku Besar (Semua Unit)
- **Transaksi Harian** – tanggal, keterangan, tipe (debit/kredit), nominal, foto bukti.
- **Running Balance** – dihitung otomatis per unit & total.
- **Role‑Based UI**:
  - **Pimpinan** – tampilan ringkas (total debit/kredit, saldo akhir, filter per unit).
  - **Staff Unit** – tampilan detail (keterangan lengkap, foto, kategori).
- **Export** – Excel / PDF per periode & per unit.

## 2. Unit Kantin
- **Penjualan Ritel** – baris transaksi *sales* dengan produk, kuantitas, harga satuan.
- **Inventori** – master barang (nama, stok, harga pokok, harga jual).
- **Stok Otomatis** – ketika transaksi penjualan dibuat, stok berkurang otomatis.
- **Laporan Ringkas** – penjualan harian, margin laba‑rugi, stok akhir.
- **Partner / Titip Jual** – tabel mitra (nama, persentase bagi hasil, saldo). Transaksi dapat dicatat sebagai `partner_id` sehingga sistem menghitung pembagian laba.

## 3. Unit Koperasi
- **Usaha Mikro** – mirip kantin, tetapi dapat mencatat **pembelian barang** (pemasokan) serta **penjualan**.
- **Modal Belanja** – pencatatan modal awal, penambahan modal, penarikan modal.
- **Laporan Laba‑Rugi** – pendapatan – biaya operasional – modal.
- **Anggota Koperasi** – tabel anggota (nama, saldo, kontribusi). Transaksi dapat terkait ke anggota untuk pencatatan kredit/debit anggota.

## 4. Unit Kantor Keuangan (Pusat)
- **Rekonsiliasi** – menyatukan semua transaksi unit menjadi satu buku besar pusat.
- **Audit Trail** – siapa (user) input, kapan, perubahan apa yang dilakukan.
- **Pengesahan Kepala Keuangan** – tombol *approve* pada transaksi besar (> Rp 5 000 000).
- **Dashboard Real‑time** – ringkasan tiap unit (pendapatan, pengeluaran, saldo).

## 5. Pengguna & Hak Akses
| Role | Akses | UI |
|------|-------|----|
| **Pimpinan** | Lihat laporan ringkas semua unit, export, approve transaksi besar. | Ringkas, filter per unit, tidak dapat edit transaksi. |
| **Staff Kantin** | Input penjualan, manage inventori, lihat laporan kantin. | Detail, foto bukti, pilih produk. |
| **Staff Koperasi** | Input pembelian/penjualan, kelola modal, anggota. | Detail, tabel modal. |
| **Staff Keuangan** | Input pengeluaran kantor, lihat buku pusat. | Detail, approve. |

## 6. Integrasi & Teknologi
- **Supabase** – auth (role), real‑time DB, storage foto, fungsi edge untuk perhitungan saldo.
- **PWA** – offline‑first, sync otomatis saat kembali online.
- **React + Tailwind** – UI modular, component *UnitSwitcher*, *RoleGuard*.
- **TensorFlow.js (opsional)** – OCR pada foto nota untuk auto‑extract nilai.

## 7. Roadmap MVP (2‑3 minggu)
1️⃣ **Auth & Role** – login, assign unit & role (Supabase).
2️⃣ **Unit Switcher** – dropdown pilih unit (kantin, koperasi, kantor).
3️⃣ **Buku Besar Multi‑Unit** – tabel transaksi menambahkan `unit_id`.
4️⃣ **Kantin – Inventori & Penjualan** – master produk + form penjualan.
5️⃣ **Koperasi – Modal & Anggota** – tabel modal + transaksi anggota.
6️⃣ **Pimpinan Dashboard** – ringkasan semua unit, export.
7️⃣ **Offline Support** – local IndexedDB + sync script.
8️⃣ **Testing & Deploy** – Vercel + Supabase.

---

### Catatan Pengembangan
- **Modularisasi**: buat folder `src/modules/kantin`, `src/modules/koperasi`, `src/modules/keuangan`.
- **Komponen Re‑usable**: `TransactionForm`, `TransactionTable`, `InventoryTable`.
- **State Management**: TanStack Query + React Context untuk user & unit.
- **Security**: RLS pada Supabase (role‑based row level security).

Dengan modul‑modul ini, aplikasi akan mencakup semua kebutuhan unit (kantin, koperasi, kantor) dan menyediakan tampilan ringkas bagi pimpinan, sekaligus menjaga real‑time dan offline capability.
