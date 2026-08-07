-- ============================================
-- ALBA-APPS: Unit Koperasi Schema (Purchases, Capital, Members)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Koperasi Purchases (Pembelian Barang / Pemasokan)
CREATE TABLE IF NOT EXISTS koperasi_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  supplier_name text NOT NULL,
  total_amount numeric(15,2) NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 2. Capital Management (Modal Koperasi)
CREATE TABLE IF NOT EXISTS koperasi_capitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  type text CHECK (type IN ('initial', 'additional', 'withdrawal')) NOT NULL,
  amount numeric(15,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3. Members Table (Anggota Koperasi)
CREATE TABLE IF NOT EXISTS koperasi_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  address text,
  balance numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Member Ledger Table (Buku Besar Anggota)
CREATE TABLE IF NOT EXISTS koperasi_member_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES koperasi_members(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  type text CHECK (type IN ('deposit', 'withdrawal', 'purchase_credit', 'payment')) NOT NULL,
  amount numeric(15,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE koperasi_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE koperasi_capitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE koperasi_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE koperasi_member_ledger ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "koperasi_purchases_all" ON koperasi_purchases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "koperasi_capitals_all" ON koperasi_capitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "koperasi_members_all" ON koperasi_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "koperasi_member_ledger_all" ON koperasi_member_ledger FOR ALL USING (auth.role() = 'authenticated');
