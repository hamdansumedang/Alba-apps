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
- [ ] Create Supabase project and obtain URL & anon key.
- [ ] Add `@supabase/supabase-js` and configure client.
- [ ] Define DB schema for `profiles`, `roles`, `user_units`.
- [ ] Implement auth UI (login, register).
- [ ] Add `RoleGuard` HOC/component.
- [ ] Write RLS policies in Supabase.
- [ ] Write unit tests for auth flow.
