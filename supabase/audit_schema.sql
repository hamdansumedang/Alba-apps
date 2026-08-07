-- ============================================
-- ALBA-APPS: Audit Trail Schema & Reconciliation
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL, -- e.g. 'INSERT', 'UPDATE', 'DELETE', 'APPROVE'
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_all" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- 2. Function & Trigger for automatic audit logging on transactions
CREATE OR REPLACE FUNCTION log_transaction_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'INSERT', 'transactions', NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'UPDATE', 'transactions', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'DELETE', 'transactions', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_transactions_audit ON transactions;
CREATE TRIGGER tr_transactions_audit
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_transaction_audit();
