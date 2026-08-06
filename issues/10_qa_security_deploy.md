# Issue: QA, Security & Deployment

**Goal**: Testing, security hardening, UAT, and production deployment.

## Description
- Unit and integration tests.
- RLS and storage policy hardening.
- User Acceptance Testing (UAT) per role.
- Production deployment on Vercel + Supabase.
- Backup and disaster recovery SOP.

## Acceptance Criteria
- All tests pass.
- Security scan passes with no high vulnerabilities.
- UAT sign‑off from stakeholders.
- Production app is live and stable.
- Backup SOP is documented.

## Checklist
- [ ] Write end‑to‑end tests (e.g., Playwright).
- [ ] Audit Supabase RLS and storage policies.
- [ ] Conduct UAT with test users.
- [ ] Configure production environment variables on Vercel.
- [ ] Deploy frontend to Vercel and backend to Supabase.
- [ ] Document backup & recovery SOP.
