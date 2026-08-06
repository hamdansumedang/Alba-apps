-- ============================================
-- ALBA-APPS: Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Units table
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Users / Profiles table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
  unit_id uuid REFERENCES units(id),
  created_at timestamptz DEFAULT now()
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('income', 'expense')),
  code text,
  created_at timestamptz DEFAULT now()
);

-- 4. Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- 5. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date date NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  unit_id uuid REFERENCES units(id) NOT NULL,
  category_id uuid REFERENCES categories(id) NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id),
  amount numeric(15,2) NOT NULL,
  type text CHECK (type IN ('debit', 'credit')) NOT NULL,
  description text,
  photo_url text,
  running_balance numeric(15,2),
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_unit ON transactions(unit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO units (name, code) VALUES
  ('Kantor Keuangan', 'KANTOR'),
  ('Kantin', 'KANTIN'),
  ('Koperasi', 'KOPERASI')
ON CONFLICT (code) DO NOTHING;

INSERT INTO payment_methods (name, code) VALUES
  ('Transfer', 'TF'),
  ('Tunai', 'TUNAI')
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (name, type, code) VALUES
  ('Perlunasan Kampus', 'income', 'PLK'),
  ('HER Bulan Juli', 'income', 'HER'),
  ('Operasional Kantin', 'expense', 'OPK'),
  ('Belanja Koperasi', 'expense', 'BLK'),
  ('Gaji Staff', 'expense', 'GJI'),
  ('Pendapatan Kantin', 'income', 'PDK'),
  ('Pendapatan Koperasi', 'income', 'PDKOP'),
  ('Biaya Operasional', 'expense', 'BOP')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Units: everyone can read
CREATE POLICY "units_read" ON units FOR SELECT USING (true);

-- Categories: everyone can read
CREATE POLICY "categories_read" ON categories FOR SELECT USING (true);
-- Categories: only admin can insert/update/delete
CREATE POLICY "categories_admin_write" ON categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Payment Methods: everyone can read
CREATE POLICY "payment_methods_read" ON payment_methods FOR SELECT USING (true);
-- Payment Methods: only admin can write
CREATE POLICY "payment_methods_admin_write" ON payment_methods FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Users: can read own profile, admin can read all
CREATE POLICY "users_read_own" ON users FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
-- Users: can update own profile
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
-- Users: allow insert during signup
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Transactions: staff can see own unit, admin can see all
CREATE POLICY "transactions_read" ON transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
    OR unit_id = (SELECT unit_id FROM users WHERE users.id = auth.uid())
  );
-- Transactions: staff can insert for own unit
CREATE POLICY "transactions_insert" ON transactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND unit_id = (SELECT unit_id FROM users WHERE users.id = auth.uid())
  );
-- Transactions: staff can update own, admin can update all
CREATE POLICY "transactions_update" ON transactions FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
-- Transactions: only admin can delete
CREATE POLICY "transactions_delete" ON transactions FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
