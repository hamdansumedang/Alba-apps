# Tech Stack - ALBA-APPS (Rekomendasi untuk Solo Developer)

**Target**: Cepat dibuat, real-time, offline support, mudah di-maintain

---

## Rekomendasi Utama (Paling Cocok)

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Frontend** | **React + Vite + Tailwind + shadcn/ui** | Cepat, modern, mobile friendly |
| **Mobile Experience** | **PWA** (Progressive Web App) | Bisa diinstall di HP seperti aplikasi |
| **Backend + Database** | **Supabase** | Real-time, Auth, Storage (foto), gratis |
| **Offline** | **Supabase + localStorage / IndexedDB** | Bisa input saat offline |
| **State Management** | **TanStack Query** | Real-time sync & caching |
| **Form** | **React Hook Form + Zod** | Validasi cepat |
| **Export** | **xlsx + jspdf** | Excel & PDF |
| **Hosting** | **Vercel** (frontend) + **Supabase** (backend) | Gratis & mudah |

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