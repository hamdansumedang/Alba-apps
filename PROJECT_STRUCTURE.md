# ALBA-APPS - Sistem Keuangan Pondok Pesantren

Aplikasi keuangan terintegrasi untuk Pondok Pesantren yang mencakup Manajemen Kantor Keuangan, Unit Kantin, dan Unit Koperasi.

## Struktur Direktori

```
├── .agents/            # Agent skills & configurations
├── assets/             # Desain & aset pendukung
├── docs/               # Dokumentasi (BRD, PRD, ERD, Schema, Deployment)
├── issues/             # Dokumentasi Issue (01 s.d. 10)
├── public/             # PWA manifest & service worker
├── src/
│   ├── components/     # Layout & RoleGuard
│   ├── contexts/       # AuthContext
│   ├── features/       # Modul aplikasi (auth, dashboard, master, transaksi, kantin, koperasi, ledger, system)
│   ├── hooks/          # Custom hooks (offline sync)
│   ├── lib/            # Klien Supabase & Dexie IndexedDB
│   └── types/          # TypeScript interfaces
├── supabase/           # SQL Schema & Seed scripts
└── package.json
```

## Cara Menjalankan

1. **Install Dependensi:**
   ```bash
   npm install
   ```
2. **Konfigurasi Environment:**
   Buat file `.env` berdasarkan `.env.example`.
3. **Development Server:**
   ```bash
   npm run dev
   ```
4. **Build untuk Produksi:**
   ```bash
   npm run build
   ```
