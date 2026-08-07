# ALBA Apps Deployment & Production Guide

## 1. Environment Variables (.env.production)
Configure the following environment variables in Vercel / Production hosting:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 2. Supabase Production Setup
1. Run `supabase/schema.sql`, `supabase/kantin_schema.sql`, `supabase/koperasi_schema.sql`, and `supabase/audit_schema.sql` in your Supabase SQL Editor.
2. Enable RLS on all tables and verify policies.
3. Create storage bucket `receipts` with public read / authenticated write access.

## 3. Frontend Deployment (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x / 20.x

## 4. Backup & Disaster Recovery SOP
- Automated Daily PostgreSQL Backups via Supabase Dashboard.
- Monthly export of all transactions to encrypted CSV/Excel archives stored securely in offline storage.
