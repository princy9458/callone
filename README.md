# CallawayOne

Admin-first Next.js + MongoDB rebuild of the legacy Callaway OMS stack.

This repository replaces:

- `OLD/CallaWayManagement` (`React.js`)
- `OLD/CallawayManagementServer` (`Node.js`)
- `u683660902_calloms_full.sql` (`MySQL`)

The current focus is the internal ecommerce admin: brands, products, variants, warehouses, users, roles, exports, sheet calibration imports, and order creation with reservation-aware stock handling. Public storefront, catalog/PPT generation, upload flows beyond CSV, and advanced approval tooling are still in progress.

## Table of Contents

- [Project Overview](#project-overview)
- [Current Status](#current-status)
- [Architecture Decisions](#architecture-decisions)
- [Role Matrix](#role-matrix)
- [Admin Route Map](#admin-route-map)
- [Collections](#collections)
- [Warehouse Rules](#warehouse-rules)
- [Discount Logic](#discount-logic)
- [Import Export PDF Catalog Scope](#import-export-pdf-catalog-scope)
- [Migration Strategy](#migration-strategy)
- [Sample Documents](#sample-documents)
- [Folder Structure](#folder-structure)
- [Environment Setup](#environment-setup)
- [Scripts](#scripts)
- [Testing](#testing)
- [Design System Notes](#design-system-notes)
- [Delivery Phases](#delivery-phases)
- [Known Gaps](#known-gaps)

## Project Overview

CallawayOne is the monolithic replacement for the legacy OMS. The rebuild keeps the legacy business concepts, but normalizes them into reusable admin modules:

| Module        | Legacy Reality                                                | CallawayOne Direction                                                              |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Auth          | Demo role switching in scaffold, mixed role logic in old apps | NextAuth credentials against Mongo users + role permissions                        |
| Brands        | Brand-specific code paths and product tables                  | Shared `brands` collection + brand-aware admin routes                              |
| Products      | Separate MySQL tables per brand family                        | Unified `products` + generated `variants`                                          |
| Warehouses    | `stock_88` / `stock_90` columns                               | `warehouses` + `inventoryLevels` + `inventoryMovements`                            |
| Blocked Qty   | Legacy blocked qty rows                                       | `blockedStock` collection + availability-aware reservations                        |
| Orders        | Snapshot-heavy relational flow                                | Mongo `orders` with pricing snapshots and timeline                                 |
| Sheet uploads | Separate `OLD/call-check` experiment for generic intake       | Integrated `/admin/imports/sheet-calibration` workspace with Mongo-backed datasets |
| Exports       | Existing CSV/PDF/catalog expectations                         | First-pass CSV exports implemented, PDF/catalog pending                            |

## Current Status

### Implemented now

- Next.js App Router admin shell with light and dark theme support.
- Sticky admin header with compact navigation, brand submenus, cart entry, theme toggle, and profile-side role preview.
- Role preview switcher in the header for "view as" navigation and search filtering by role.
- Rotating hero banner system across admin pages using the approved Callaway imagery.
- NextAuth credentials login backed by MongoDB users and bcrypt.
- Middleware-level role restriction for `/admin`.
- Bootstrap seeding for system roles, base brands, warehouses, and sample users.
- CRUD foundations for:
  - Brands
  - Warehouses
  - Roles
  - Users
  - Products
  - Orders
- Variable product generation from option definitions.
- Warehouse-level inventory records per variant.
- Blocked-stock aware order creation.
- Inventory reservation on order creation.
- Inventory release on cancelled/rejected orders.
- Inventory shipment deduction on completed orders.
- Advanced products explorer with quick search, sticky dense table headers, row selection, attribute filters, sorting, and pagination controls.
- Product information architecture now routes by brand section instead of a single generic catalog landing:
  - `/admin/products/brand/callaway-softgoods`
  - `/admin/products/brand/callaway-hardgoods`
  - `/admin/products/brand/ogio`
  - `/admin/products/brand/travis-mathew`
- `/admin/cart` now acts as the assisted ordering entry and redirects into the multi-step order builder.
- Accounts information architecture now routes by role-based account sections:
  - `/admin/accounts/all`
  - `/admin/accounts/admins`
  - `/admin/accounts/managers`
  - `/admin/accounts/sales-representatives`
  - `/admin/accounts/retailers`
- Shared account workspace now uses live Mongo relationships for roles, managers, assigned brands, and assigned warehouses.
- Retailer accounts can launch assisted order creation directly into the cart/order builder.
- Product media now supports a shared product-level image collection key so size runs can reuse one gallery set by default.
- Redesigned dashboard with live charts, hover-ready metric cards, brand coverage, and team activity insights.
- Separate analytics route for weekly order trends, highest-selling products, role mix, and individual contribution views.
- CSV export endpoints for brands, warehouses, roles, users, products, and orders.
- Sheet calibration workspace inspired by `OLD/call-check` with:
  - default sample CSV under `public/sample-data/brand-calibration.csv`
  - CSV upload parsing
  - calibration against live brands/products/variants/warehouses
  - Mongo-backed saved datasets
  - brand relation summary table and export of calibrated sheets
- SQL migration script foundation for products, blocked stock, users, and order snapshots.
- Public image folder structure under `public/images/*`.
- `README.md`, `docs/implementation_plan.md`, and `products-sample-db-schema.md` aligned to the actual rebuild.

### Implemented, but still foundational

- Imports hub and sheet-calibration workspace are live, but broader XLSX import jobs and blocked-stock maintenance screens are still pending.
- Legacy SQL migration script is substantially broader than the original scaffold, but still needs validation against production fixtures.
- Order flow supports status progression and inventory transitions, but not yet multi-actor approval UI parity.

### Not implemented yet

- File uploads for brand/product/order media.
- XLSX and multi-job import parity beyond the current CSV calibration workspace.
- PDF export for orders.
- Catalog/PPT generation.
- Bulk update screens.
- Audit log screens.
- Email template management.
- Public storefront.

## Architecture Decisions

### 1. Admin-first rendering

- `/admin/*` is server-rendered and force-dynamic.
- `/login` is force-dynamic.
- Build no longer requires database access just to pre-render admin pages.
- Runtime still requires `NEXTAUTH_MONGODB_URI`.

### 2. Auth split

- `src/middleware.ts` uses token-only route protection.
- `src/lib/auth/options.ts` contains full NextAuth credentials logic.
- `src/lib/auth/session.ts` is the server-side session guard for admin routes and actions.

### 3. Unified catalog model

Legacy brand tables are replaced with:

- `products`: shared product definition
- `variants`: one SKU per option combination
- `inventoryLevels`: stock per warehouse per variant
- `blockedStock`: legacy and manual blocked quantities

### 4. Local media for now

All media remains under `public/images/*` so current design assets can be reused without external storage:

- `public/images/brands`
- `public/images/products`
- `public/images/users`
- `public/images/orders`
- `public/images/catalogs`

### 5. Snapshot-based orders

Orders keep line pricing and participant snapshots. This preserves the legacy OMS behavior where financials and assignments must remain stable even if user, product, or pricing master data changes later.

### 6. `call-check` folded into core admin

`OLD/call-check` remains a read-only reference. Its sheet-intake concept now lives inside CallawayOne through:

- `/admin/imports/sheet-calibration`
- `SheetDataset` and `SheetRow` Mongo collections
- `/api/admin/sheets` route handlers

The target architecture is one admin shell, one auth system, and no separate prototype for upload intelligence.

## Role Matrix

Current admin access rules:

| Route / Capability        | super_admin | admin | manager | sales_rep | retailer |
| ------------------------- | ----------- | ----- | ------- | --------- | -------- |
| `/login`                  | ✅          | ✅    | ✅      | ✅        | ✅       |
| `/admin` shell access     | ✅          | ✅    | ✅      | ✅        | ❌       |
| Header "view as" preview  | ✅          | ✅    | ✅      | ✅        | n/a      |
| Brands CRUD               | ✅          | ✅    | ✅      | ✅        | ❌       |
| Products CRUD             | ✅          | ✅    | ✅      | ✅        | ❌       |
| Warehouse CRUD            | ✅          | ✅    | ✅      | ✅        | ❌       |
| Users CRUD                | ✅          | ✅    | ✅      | ✅        | ❌       |
| Roles CRUD                | ✅          | ✅    | ❌      | ❌        | ❌       |
| Orders create/view/update | ✅          | ✅    | ✅      | ✅        | ❌       |

System roles currently seeded:

- `super_admin`
- `admin`
- `manager`
- `sales_rep`
- `retailer`

## Admin Route Map

| Route                              | Status             | Notes                                                                             |
| ---------------------------------- | ------------------ | --------------------------------------------------------------------------------- |
| `/login`                           | live               | Credentials auth against Mongo users                                              |
| `/admin`                           | live               | Overview dashboard with live counts                                               |
| `/admin/analytics`                 | live               | Weekly trends, top products, role mix, and people insights                        |
| `/admin/orders`                    | live               | Order list and detail route                                                       |
| `/admin/orders/new`                | live               | Admin checkout with availability-aware reservation                                |
| `/admin/cart`                      | live               | Assisted cart entry that redirects into order creation with query defaults        |
| `/admin/orders/[id]`               | live               | Summary + timeline + status update                                                |
| `/admin/products`                  | live               | Redirects into the default Callaway Softgoods brand catalog                       |
| `/admin/products/brand/[section]`  | live               | Brand-specific catalog explorer for Softgoods, Hardgoods, Ogio, and Travis Mathew |
| `/admin/products/new`              | live               | Product create with variant generation                                            |
| `/admin/products/[id]/edit`        | live               | Product edit                                                                      |
| `/admin/accounts`                  | live               | Redirects into the complete accounts list                                         |
| `/admin/accounts/[section]`        | live               | Role-wise account workspace with create, list, edit, delete, and assignments      |
| `/admin/brands`                    | live               | Brand create/list/export                                                          |
| `/admin/brands/[id]/edit`          | live               | Brand edit                                                                        |
| `/admin/warehouses`                | live               | Warehouse CRUD + stock summary                                                    |
| `/admin/warehouses/[id]/edit`      | live               | Warehouse edit                                                                    |
| `/admin/users`                     | live               | User CRUD + assignments                                                           |
| `/admin/users/[id]/edit`           | live               | User edit                                                                         |
| `/admin/roles`                     | live               | Role CRUD + export                                                                |
| `/admin/roles/[id]/edit`           | live               | Role edit                                                                         |
| `/admin/imports`                   | live               | Import hub for calibration and migration workflows                                |
| `/admin/imports/sheet-calibration` | live               | CSV upload, save, calibrate, reopen, and export sheet datasets                    |
| `/admin/customizer`                | legacy placeholder | kept out of core admin rebuild scope                                              |

## Collections

### `roles`

- `key`
- `name`
- `description`
- `permissions[]`
- `isSystem`
- `isActive`

### `users`

- auth identity and password hash
- `roleId`, `roleKey`
- `managerId`
- `assignedBrandIds[]`
- `assignedWarehouseIds[]`
- status, designation, contact, code, GST, address

### `brands`

- `name`, `slug`, `code`
- website and descriptive metadata
- brand media paths
- active status

### `products`

- brand linkage
- category, subcategory, product type
- status
- list price and tax
- option definitions
- media paths
- legacy metadata

### `variants`

- one row per purchasable combination
- SKU
- title
- option value map
- MRP / GST / cost
- lifecycle status

### `warehouses`

- code, name, location
- priority
- default flag
- active flag

### `inventoryLevels`

- unique `variantId + warehouseId`
- `onHand`
- `reserved`
- `blocked`
- `available`

### `inventoryMovements`

- inventory audit ledger
- types: `import`, `adjustment`, `reservation`, `release`, `shipment`, `transfer`

### `blockedStock`

- legacy or manual blocked qty
- linked by `variantId` or fallback SKU
- may be warehouse-specific or global

### `orders`

- participant snapshots
- item snapshots
- pricing snapshot
- workflow status
- notes timeline
- attachments

## Warehouse Rules

CallawayOne replaces hardcoded stock columns with dynamic warehouse records.

### Seeded warehouses

- `WH88`
- `WH90`

### Availability formula

Per warehouse:

```text
effective available =
max(0, onHand - reserved - blocked - warehouseBlockedStock - distributedGlobalBlockedStock)
```

### Order reservation behavior

- New admin orders reserve stock immediately.
- If warehouse is not selected, the system auto-assigns the first warehouse with enough effective availability by priority.
- If an order is cancelled or rejected, reservations are released.
- If an order is completed, reserved stock is converted into shipment and deducted from `onHand`.
- Legacy imported orders do not auto-adjust current stock when statuses are changed, to avoid rewriting historical inventory.

## Discount Logic

Current pricing utility lives in `src/lib/utils/discounts.ts`.

Supported modes:

- `inclusive`
- `exclusive`
- `flat`
- `none`

Current behavior:

- line-level discount is applied first
- breakdown stores:
  - `discountAmount`
  - `taxableAmount`
  - `taxAmount`
  - `finalAmount`
- order totals aggregate all lines into a snapshot in `orders.pricing`

This is the current mature baseline. Exact parity validation against every legacy financial edge case is still pending and should be completed before public storefront or retailer checkout is introduced.

## Import Export PDF Catalog Scope

### Implemented now

- CSV export API routes:
  - `/api/admin/export/brands`
  - `/api/admin/export/warehouses`
  - `/api/admin/export/roles`
  - `/api/admin/export/users`
  - `/api/admin/export/products`
  - `/api/admin/export/orders`
- Sheet calibration APIs:
  - `/api/admin/sheets`
  - `/api/admin/sheets/[slug]`
- Default calibration sample:
  - `public/sample-data/brand-calibration.csv`

### In progress / next

- SQL migration from `u683660902_calloms_full.sql`
- broader UI-driven CSV/XLSX imports beyond calibration intake
- blocked stock maintenance screens
- order PDF generation
- catalog/PPT generation jobs
- download center with job history

## Migration Strategy

### Source systems

- React admin frontend in `OLD/CallaWayManagement`
- Node API in `OLD/CallawayManagementServer`
- MySQL dump in `u683660902_calloms_full.sql`

### Current migration script

`src/scripts/seed-sql.ts` currently aims to import:

- brands
- users
- products from the four major product tables
- blocked stock
- order snapshots

### Mapping direction

| Legacy source                      | Target collection                           |
| ---------------------------------- | ------------------------------------------- |
| `brands`                           | `brands`                                    |
| `callaway_apparel`                 | `products` + `variants` + `inventoryLevels` |
| `callaway_hardgoods`               | `products` + `variants` + `inventoryLevels` |
| `ogio`                             | `products` + `variants` + `inventoryLevels` |
| `travis`                           | `products` + `variants` + `inventoryLevels` |
| `blockedqty` style rows            | `blockedStock`                              |
| `users` / `managers` / `retailers` | `users`                                     |
| order tables / snapshots           | `orders`                                    |

### Stock conversion

- `stock_88` -> warehouse `WH88`
- `stock_90` -> warehouse `WH90`
- unscoped blocked qty remains in `blockedStock` with `warehouseId: null`

## Sample Documents

Detailed samples live in [products-sample-db-schema.md](./products-sample-db-schema.md).

### Product

```json
{
  "name": "Tour Performance Polo",
  "slug": "tour-performance-polo",
  "baseSku": "CGAPP-POLO-001",
  "brandId": "brand_callaway_apparel",
  "category": "Polos",
  "subcategory": "Mens",
  "productType": "apparel",
  "status": "active",
  "taxRate": 18,
  "listPrice": 2999,
  "optionDefinitions": [
    {
      "key": "color",
      "label": "Color",
      "values": ["Blue", "White"],
      "useForVariants": true
    },
    {
      "key": "size",
      "label": "Size",
      "values": ["S", "M", "L"],
      "useForVariants": true
    }
  ],
  "media": {
    "primaryImagePath": "/images/products/callaway/polo/main.jpg",
    "galleryPaths": [
      "/images/products/callaway/polo/detail-1.jpg",
      "/images/products/callaway/polo/detail-2.jpg"
    ]
  },
  "metadata": {
    "legacyTable": "callaway_apparel",
    "legacyStyleId": "92431"
  }
}
```

### Variant

```json
{
  "productId": "product_tour_performance_polo",
  "sku": "CGAPP-POLO-001-BLU-S",
  "title": "Blue / S",
  "optionValues": {
    "color": "Blue",
    "size": "S"
  },
  "mrp": 2999,
  "gstRate": 18,
  "status": "active"
}
```

### Order

```json
{
  "orderNumber": "CO-12451245",
  "workflowStatus": "submitted",
  "retailerId": "user_retailer_01",
  "managerId": "user_manager_01",
  "salesRepId": "user_sales_01",
  "items": [
    {
      "variantId": "variant_blue_s",
      "sku": "CGAPP-POLO-001-BLU-S",
      "name": "Tour Performance Polo / Blue / S",
      "warehouseId": "warehouse_wh88",
      "warehouseCode": "WH88",
      "quantity": 4,
      "mrp": 2999,
      "gstRate": 18,
      "lineDiscountValue": 22,
      "lineDiscountAmount": 2639.12,
      "grossAmount": 11996,
      "taxableAmount": 7889.56,
      "taxAmount": 1420.12,
      "finalAmount": 9309.68
    }
  ],
  "pricing": {
    "discountType": "inclusive",
    "discountValue": 22,
    "discountAmount": 2639.12,
    "subtotal": 11996,
    "taxableAmount": 7889.56,
    "taxAmount": 1420.12,
    "finalTotal": 9309.68
  }
}
```

## Folder Structure

```text
callone/
├── public/
│   └── images/
│       ├── brands/
│       ├── catalogs/
│       ├── orders/
│       ├── products/
│       └── users/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   └── layout/
│   ├── lib/
│   │   ├── actions/
│   │   ├── auth/
│   │   ├── db/
│   │   │   └── models/
│   │   └── utils/
│   ├── scripts/
│   └── types/
├── docs/
├── OLD/
├── README.md
├── products-sample-db-schema.md
└── u683660902_calloms_full.sql
```

Notes:

- `OLD/` is intentionally excluded from TypeScript compilation and treated as read-only reference.
- `src/scripts` is excluded from the Next.js build path but remains available for migration and seed jobs.

## Environment Setup

Create `.env.local`:

```bash
NEXTAUTH_MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-nextauth-secret
CALLONE_BOOTSTRAP_ADMIN_EMAIL=admin@callone.local
CALLONE_BOOTSTRAP_ADMIN_PASSWORD=CalloneAdmin@123
```

Important:

- `NEXTAUTH_MONGODB_URI` is required at runtime.
- Build is safe without DB only because admin/login routes are force-dynamic.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
npm run seed
npm run seed:legacy
```

### Script purpose

- `dev`: Next.js dev server
- `lint`: ESLint
- `test`: Node test runner for pricing and inventory utility coverage
- `build`: production build
- `seed`: bootstrap sample data for the current schema
- `seed:legacy`: SQL-to-Mongo migration import pass

## Testing

Current automated coverage is utility-focused:

- discount calculation
- variant cartesian generation
- warehouse availability distribution

Still needed:

- server action integration tests
- order lifecycle inventory tests against Mongo fixtures
- migration fixture validation against sampled SQL rows

## Design System Notes

The UI direction is intentionally admin-heavy, dense, and table-oriented:

- sticky noir header with centered command search
- mega-menu navigation for module access
- responsive dense tables with sticky column headers
- reusable cards and page sections
- dark/light theme support
- legacy-compatible local image references

Current palette direction uses:

- `Phantom` `#ebebef`
- `Eclipse` `#d3d2d0`
- `Shadow` `#949797`
- `Umbra` `#606260`
- `Midnight` `#2c2d2d`
- `Noir` `#0a0a0a`

The current styling is no longer placeholder-only; it now includes the premium admin shell, login redesign, mega navigation, and dense explorer tables. More exact visual parity with the legacy design system should continue as shared admin primitives mature.

## Delivery Phases

### Phase 1: baseline and auth

- completed

### Phase 2: reusable admin shell and CRUD foundation

- completed for brands, warehouses, roles, users, products, and orders

### Phase 3: inventory-aware admin checkout

- partially completed
- reservation, release, and shipment behavior now exists
- deeper approval tooling still pending

### Phase 4: legacy parity operations

- pending
- imports
- PDFs
- catalogs / PPT
- download center
- blocked stock management UI

### Phase 5: public commerce

- not started

## Known Gaps

- Product forms are still server-form based, not yet a full guided multi-step builder.
- Order edit parity is limited to creation plus status updates; line editing is still pending.
- CSV calibration intake is live, but broader XLSX import parity and catalog generation are still pending.
- Upload handlers are not live yet, so media paths are path-first and file-management-second.
- Migration accuracy must still be validated against real SQL samples before production import.
