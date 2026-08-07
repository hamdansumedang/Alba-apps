-- ============================================
-- ALBA-APPS: Unit Kantin Schema (Inventory, Sales, Partners)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) NOT NULL,
  name text NOT NULL,
  sku text,
  stock integer NOT NULL DEFAULT 0,
  cost_price numeric(15,2) NOT NULL DEFAULT 0,
  selling_price numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Partners table (Consignment)
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  profit_share_pct numeric(5,2) NOT NULL DEFAULT 50.00, -- e.g. 50.00%
  balance numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Sales table (Kantin POS / Retail Sales)
CREATE TABLE IF NOT EXISTS kantin_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  partner_id uuid REFERENCES partners(id),
  total_amount numeric(15,2) NOT NULL,
  total_profit numeric(15,2) NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 4. Sale Items table
CREATE TABLE IF NOT EXISTS kantin_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES kantin_sales(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id uuid REFERENCES inventory_items(id) NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(15,2) NOT NULL,
  subtotal numeric(15,2) NOT NULL,
  profit numeric(15,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE kantin_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE kantin_sale_items ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can read/write)
CREATE POLICY "inventory_all" ON inventory_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "partners_all" ON partners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "kantin_sales_all" ON kantin_sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "kantin_sale_items_all" ON kantin_sale_items FOR ALL USING (auth.role() = 'authenticated');

-- Function & Trigger to auto-decrement inventory stock on sale
CREATE OR REPLACE FUNCTION decrement_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.inventory_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_decrement_stock ON kantin_sale_items;
CREATE TRIGGER tr_decrement_stock
  AFTER INSERT ON kantin_sale_items
  FOR EACH ROW
  EXECUTE FUNCTION decrement_inventory_stock();
