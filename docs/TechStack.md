# Tech Stack - ALBA-APPS (Rekomendasi untuk Solo Developer)

**Target**: Cepat dibuat, real-time, offline support, mudah di-maintain

---

## Rekomendasi Utama (Paling Cocok)

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Frontend** | **React + Vite + Tailwind + shadcn/ui** | Cepat, modern, mobile friendly |
| **Mobile Experience** | **PWA** (Progressive Web App) | Bisa diinstall di HP seperti aplikasi |
| **Backend + Database** | **PostgreSQL (Self-hosted di VPS) + Node.js/Express API** | Kontrol penuh, aman, menggunakan database VPS sendiri |
| **Offline** | **IndexedDB + Local API Sync** | Bisa input saat offline lalu sinkronisasi ke VPS |
| **State Management** | **TanStack Query / React Context** | Caching & manajemen data |
| **Form** | **React Hook Form + Zod** | Validasi cepat |
| **Export** | **xlsx + jspdf** | Excel & PDF |
| **Hosting** | **Vercel / Netlify** (frontend) + **VPS Docker (PostgreSQL)** (backend/database) | Mandiri & performa tinggi |

---

## Alternatif (jika ingin lebih ringan)

- **Frontend**: Flutter Web (satu codebase mobile + web)
- **Backend**: PocketBase (self-hosted, sangat ringan)
- **Database**: Supabase tetap paling cepat untuk real-time

---

## Struktur Folder src/ (Disarankan)

```
src/
├── app/              ← routing
├── components/       ← UI components
├── features/
│   ├── transactions/
│   ├── dashboard/
│   └── reports/
├── lib/              ← supabase client, utils
├── hooks/            ← custom hooks (offline, sync)
└── types/            ← TypeScript types
```

---

## Estimasi Waktu Development (Solo + AI)

| Fase | Estimasi | Keterangan |
|------|----------|----------|
| Setup + Auth + Database | 2-3 hari | Supabase + login |
| Input Transaksi + Foto | 3-4 hari | Form + upload |
| Buku Besar + Filter | 3 hari | Tabel + running balance |
| Offline Mode | 2-3 hari | Sync logic |
| Dashboard + Laporan | 2-3 hari | Ringkasan + export |
| Role & Testing | 2 hari | Admin vs Staff |
| **Total MVP** | **14-18 hari** | Bisa lebih cepat dengan AI |