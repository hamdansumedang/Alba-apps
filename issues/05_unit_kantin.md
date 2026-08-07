# Issue: Unit Kantin

**Goal**: Implement inventory, retail sales, and partner consignment for the Kantin unit.

## Description
- Master inventory items (name, stock, cost price, selling price).
- Retail sales form (product, quantity, unit price).
- Auto‑decrement stock on sale.
- Partner consignment table (partner name, profit share %, balance).
- Daily sales & margin report.

## Acceptance Criteria
- Staff can manage inventory items.
- Sales transactions reduce stock automatically.
- Partner consignment calculations are correct.
- Daily report shows sales, margin, and ending stock.

## Checklist
- [x] Create `inventory_items` table.
- [x] Create `sales` table.
- [x] Create `partners` table.
- [x] Build inventory CRUD UI.
- [x] Build sales form with product picker.
- [x] Implement stock decrement trigger.
- [x] Build partner management UI.
- [x] Build daily sales report.
- [x] Write tests.