# CallawayOne Admin Rebuild Plan

## Summary
- The legacy system is much larger than the current Next.js app. The old React + Node + MySQL stack already includes role-based account management, brand-specific product modules, blocked quantity, multi-step order flow, discount logic, import/export, PDF generation, PPT/catalog tooling, email templates, and image uploads.
- The current `callone` repo is still a scaffold. It has demo auth, an admin shell, a product list/create placeholder, an order table placeholder, a customizer mock, and a few partial Mongoose models. It does not yet have real RBAC, brand CRUD, warehouse CRUD, users/roles CRUD, true variant generation, warehouse inventory, blocked stock, import/export, PDF/catalog features, or a production-ready SQL migration.
- Immediate blockers to fix before feature work: rewrite [README.md](/Users/apple/Desktop/WORK/GIT/callone/README.md), exclude `OLD/` from [tsconfig.json](/Users/apple/Desktop/WORK/GIT/callone/tsconfig.json) so `next build` stops type-checking legacy code, remove hardcoded Mongo credentials from [src/lib/db/connection.ts](/Users/apple/Desktop/WORK/GIT/callone/src/lib/db/connection.ts), and replace the current dummy guard in [src/middleware.ts](/Users/apple/Desktop/WORK/GIT/callone/src/middleware.ts) with real role enforcement.
- Current health check: `next lint` passes, but `next build` fails because the repo compiles embedded legacy files under `OLD/` and hits missing legacy dependencies like `@popperjs/core`.

## Important Interfaces
- Collections:
  - `roles`: slug, name, permissions.
  - `users`: auth profile, roleId, managerId, assigned brandIds, assigned warehouseIds, status.
  - `brands`: slug, name, code, logos, media folders, active flags.
  - `products`: base catalog entity with brand, taxonomy, shared attributes, media, option definitions.
  - `variants`: one purchasable SKU per option combination, pricing fields, media override, lifecycle status.
  - `warehouses`: code, name, location, priority, active.
  - `inventoryLevels`: unique `(variantId, warehouseId)` with `onHand`, `reserved`, `blocked`, `available`.
  - `inventoryMovements`: audit ledger for imports, adjustments, approvals, completions, and transfers.
  - `blockedStock`: migrated legacy blocked qty rows; warehouse may be `null` when legacy data is global.
  - `orders`: participant snapshots, item snapshots, discount snapshot, notes timeline, attachments, workflow state, approval history.
  - `importJobs` and `exportJobs`: CSV/XLSX/PDF/catalog job tracking.
- Admin routes:
  - `/admin`, `/admin/orders`, `/admin/orders/new`, `/admin/orders/[id]`
  - `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`
  - `/admin/brands`, `/admin/warehouses`, `/admin/users`, `/admin/roles`
  - `/admin/imports`, `/admin/catalogs`
- Server interface:
  - Use Server Actions for CRUD mutations.
  - Use Route Handlers for uploads, downloads, import jobs, PDF generation, and catalog/PPT binaries.
- Media storage:
  - Keep local files under `public/images/brands/...`, `public/images/products/...`, `public/images/users/...`, `public/images/orders/...`, and `public/images/catalogs/...`.
  - Store relative paths in Mongo so the storage backend can be swapped later.

## Implementation Changes
1. Baseline and documentation.
- Rewrite `README.md` using the sample structure: actual current status, legacy flow, role matrix, route map, migration mapping, sample JSON for product/variant/inventory/order, warehouse rules, discount rules, import/export/PDF/catalog scope, and phased execution.
- Populate `products-sample-db-schema.md` with canonical Mongo sample documents instead of leaving it empty.
- Exclude `OLD/` from TypeScript/Next compilation, keep old repos read-only as reference only, rename the package from `temp-app`, and get the repo to a clean production build before adding features.

2. Authentication, RBAC, and reusable admin system.
- Replace demo role-login with real NextAuth credentials backed by Mongo users and bcrypt.
- Split auth into edge-safe middleware config and full server-side auth for Server Actions.
- Restrict `/admin` to `super_admin`, `admin`, `manager`, and `sales_rep`; keep `retailer` in the data model but out of the admin UI for this phase.
- Build reusable admin primitives: page header, filter bar, responsive data table, bulk-action bar, drawer/modal form shell, timeline, stat cards, and dark/light tokens that match the legacy palette and table density rather than the current placeholder visual style.

3. Catalog, brands, warehouse, users, and roles.
- Implement full CRUD and listing pages for Brands, Warehouses, Roles, and Users first, because order flow depends on real assignees and inventory locations.
- Replace the current product model/action with a mature catalog model: brand-aware taxonomy, reusable attribute sets, real cartesian variant generation, status lifecycle, media gallery, and per-variant pricing.
- Replace the single `stock` field with warehouse-aware stock through `inventoryLevels` and `blockedStock`.
- Ship CSV/XLSX import/export with the first CRUD release for brands, users, products, blocked stock, and warehouse inventory so legacy operations are preserved from day one.

4. SQL migration and seed strategy.
- Build one migration script that reads `u683660902_calloms_full.sql` and imports all four product tables, the `brands` table, `users`/`retailers`/`managers`, blocked qty, and orders.
- Seed warehouses `WH88` and `WH90` from legacy `stock_88` and `stock_90`; keep blocked rows as `blockedStock` when no warehouse can be inferred.
- Preserve order snapshots from MySQL instead of normalizing them away; Mongo orders should retain line pricing, discount type/value, participant snapshots, notes, and attachments.
- Treat the current `seed-sql.ts` as throwaway proof-of-concept; it is too narrow because it only samples a small apparel subset and skips the real workflow data.

5. Orders and admin checkout.
- Implement admin order creation and editing only after catalog and inventory are real. Canonical workflow should be `draft -> submitted -> availability_check -> manager_approval -> approved -> completed`, with `rejected` and `cancelled` as terminal states and a mapper for legacy values like `Pending` and `CheckAvailability`.
- Port the legacy discount engine exactly, including `Inclusive`, `Exclusive`, and `Flat` modes, per-line overrides, subtotal/discount/GST/final total snapshots, and note history.
- Add availability checks from `inventoryLevels - blockedStock - active reservations`, warehouse assignment per line, approval/rejection actions, order notes, and PDF export with attachments.
- Build order list, detail, edit, and approval pages for desktop and mobile using the same dense table/filter behavior as the legacy system.

6. Advanced admin parity.
- Add catalog/PPT generation after product media and templates stabilize, using job-based generation and downloadable outputs.
- Add bulk product update flows, blocked-qty maintenance, download center, email template management, and audit logs.
- Keep the current customizer page out of the core milestone until catalog and order parity are stable; it is lower priority than the admin rebuild.

## Test Plan
- Unit tests for discount calculation, variant cartesian generation, availability calculation, status transitions, and permission guards.
- Integration tests for CRUD Server Actions on brands, products, warehouses, users, roles, and orders.
- Migration validation against sampled legacy rows: SKU counts, warehouse stock totals, blocked qty totals, and order financial snapshots must match the SQL import for agreed fixtures.
- Manual QA for responsive admin tables, dark/light theme parity, image upload paths under `public/images`, and route-level role restrictions.
- Release gate: `next build` must pass without compiling legacy `OLD/` code, and the README must match the actual shipped modules.

## Assumptions and Defaults
- `callone` remains the target repo; the current code is kept only where useful, but most business logic should be rebuilt rather than stretched from placeholders.
- Admin-first scope means no public storefront yet; “checkout” in this phase means internal order creation and approval inside admin.
- Legacy colors, imagery, and table ergonomics are preserved, but the implementation becomes componentized and reusable instead of page-by-page copy.
- Local filesystem storage under `public/images` is the default for now, with a media abstraction so S3 can replace it later.
- Import/export is required, not optional: CRUD modules ship with list, filters, create/edit/delete, and the relevant bulk operations in the same milestone, while catalog/PPT generation follows once media and templates are stable.
