# Issue: Auth & Role

**Goal**: Implement authentication and role‑based access using Supabase.

## Description
- Set up Supabase project and enable Auth.
- Create tables: `profiles`, `roles`, `user_units`.
- Implement login, logout, and session persistence in the app.
- Build a `RoleGuard` component to protect routes based on role.
- Configure Row‑Level Security (RLS) policies for each role.

## Acceptance Criteria
- Users can sign up / sign in with email/password.
- After login, the app knows the user's role and unit.
- Protected pages redirect unauthorized users.
- RLS prevents data leakage on the backend.

## Checklist
- [x] Create Supabase project and obtain URL & anon key.
- [x] Add `@supabase/supabase-js` and configure client.
- [x] Define DB schema for `users`, `units`, `categories`, `payment_methods`, `transactions`.
- [x] Implement auth UI (`LoginPage`).
- [x] Add `RoleGuard` component.
- [x] Write RLS policies in Supabase (`schema.sql`).
- [x] Test auth flow & session persistence.
