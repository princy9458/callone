# CallawayOne Implementation Plan

This document tracks the delivery order for the Next.js + MongoDB rebuild.

## 1. Baseline

Completed:
- renamed package identity to `callone-admin`
- removed hardcoded MongoDB URI usage
- excluded `OLD/` from TypeScript compilation
- force-dynamic admin/login runtime strategy
- shared Mongo connection and seeded bootstrap roles/users/brands/warehouses

## 2. Auth and RBAC

Completed:
- NextAuth credentials provider against Mongo users
- JWT session enrichment with role and permissions
- middleware guard for `/admin`
- server-side admin session helper

Next:
- field-level permission checks inside server actions
- route-level permission expansion beyond admin/non-admin split

## 3. Admin CRUD

Completed:
- brands
- warehouses
- roles
- users
- products
- orders

Shared components in place:
- `PageHeader`
- `SectionCard`
- `StatCard`
- `DataTable`
- `FilterBar`
- `EmptyState`

Next:
- richer filtering
- bulk actions
- modal/drawer forms
- blocked stock admin screens

## 4. Catalog and Inventory

Completed:
- product option definitions
- generated variants
- inventory levels per warehouse
- blocked stock aware warehouse availability utility
- order-time reservation logic
- release on cancel/reject
- shipment deduction on complete

Next:
- variant/media editor parity
- inventory adjustment screens
- inventory movement history UI
- attribute set UI

## 5. Legacy Migration

Current:
- `src/scripts/seed.ts` seeds bootstrap and demo-friendly data
- `src/scripts/seed-sql.ts` imports broad legacy data categories

Next:
- validate SQL parser against production fixtures
- reconcile legacy order statuses and actor mappings
- verify stock totals against warehouse rollups

## 6. Import / Export / Download Center

Completed:
- CSV exports for the main admin entities

Next:
- CSV/XLSX upload UI
- job tracking for imports and exports
- PDF order export
- catalog and PPT generation

## 7. Checkout and Workflow

Completed:
- admin order create flow
- line-level pricing snapshots
- warehouse assignment and availability check
- status transitions with inventory side effects

Next:
- line editing after draft/submission
- approval-specific actions and comments
- attachment handling
- PDF summary generation

## 8. Immediate Development Order

1. Validate build, seed, and tests end to end with Mongo configured.
2. Implement blocked stock CRUD and inventory adjustment UI.
3. Add import jobs for products, users, and blocked stock.
4. Add order PDF export and attachment uploads.
5. Add catalog/PPT job generation and download center.
