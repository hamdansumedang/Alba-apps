# Issue: Core Transactions

**Goal**: Implement transaction input, photo upload, and running balance.

## Description
- Build transaction form (date, unit, debit/credit, amount, notes).
- Upload and compress photo proof.
- Display transaction table with pagination.
- Compute running balance per unit.
- Enforce role‑based edit/delete rules.
- Require approval for transactions > Rp5,000,000.

## Acceptance Criteria
- Staff can input transactions with photo proof.
- Running balance updates automatically.
- Large transactions require Kepala Keuangan approval.
- Edit/delete rules respect user role.

## Checklist
- [ ] Create `transactions` table.
- [ ] Build transaction form UI.
- [ ] Implement photo upload + compression.
- [ ] Build transaction table with pagination.
- [ ] Compute running balance.
- [ ] Add role‑based edit/delete logic.
- [ ] Add approval workflow.
- [ ] Write tests.
