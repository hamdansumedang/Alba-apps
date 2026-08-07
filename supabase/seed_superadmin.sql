-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create superadmin auth user (replace with actual email if desired)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'admin@brontolano.com',
  crypt('bismillah', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role":"admin"}'::jsonb,
  '{}'::jsonb
);

-- Insert corresponding row into public.users table
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  unit_id,
  created_at
) SELECT
  id,
  'superadmin',
  email,
  'admin',
  NULL,
  now()
FROM auth.users
WHERE email = 'admin@brontolano.com';
