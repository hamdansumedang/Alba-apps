# Issue: Master Data

**Goal**: CRUD for categories, payment methods, and accounts.

## Description
- Create UI and API for managing master data.
- Validate forms with React Hook Form + Zod.
- Track `created_by` and `updated_by` for audit.

## Acceptance Criteria
- Users can create, read, update, and delete categories, payment methods, and accounts.
- Forms show validation errors.
- Audit fields are populated automatically.

## Checklist
- [x] Create `categories` table.
- [x] Create `payment_methods` table.
- [x] Create `accounts` table / master data tables.
- [x] Build CRUD UI for Categories (`CategoriesPage`).
- [x] Build CRUD UI for Payment Methods (`PaymentMethodsPage`).
- [x] Add form validation & Supabase integration.
- [x] Verify build & navigation via `AppLayout`.
