# Homes — Enterprise Real Estate Advisory Platform

> Full-stack, production-grade real estate platform — public property portal + internal CRM. White-label architecture adaptable for any real estate business.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Decisions](#architecture-decisions)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Database Schema Design](#database-schema-design)
- [Server Actions Reference](#server-actions-reference)
- [Public Portal Pages](#public-portal-pages)
- [CRM Dashboard Modules](#crm-dashboard-modules)
- [Known Fixes Applied](#known-fixes-applied)
- [Development Phases](#development-phases)
- [Environment Setup](#environment-setup)
- [Design System](#design-system)
- [Current Project Status](#current-project-status)

---

## Project Overview

**Homes** is a white-label real estate SaaS platform. One codebase, one database — any real estate consultancy runs their entire business on it.

| Interface       | Audience          | Purpose                                                     |
| --------------- | ----------------- | ----------------------------------------------------------- |
| Public Portal   | Buyers, investors | RERA-verified listings, enquire, book site visits           |
| Admin Dashboard | Agents, admins    | Manage properties, track leads, manage enquiries, analytics |

Immediate client: **Lucknow Homes** (Lucknow, UP).

---

## Architecture Decisions

### Auth Split (Edge + Node)

```
src/lib/auth/
├── auth.config.ts        → Edge-safe (callbacks, pages only)
├── middleware-auth.ts    → NextAuth instance for proxy.ts
└── config.ts             → Full NextAuth (Node — DB + bcrypt)
```

`proxy.ts` (route guard) uses `middleware-auth.ts`.
All Server Actions use the full `config.ts` via `auth()`.

### Rendering Strategy

| Route              | Strategy                   | Reason                       |
| ------------------ | -------------------------- | ---------------------------- |
| `/`                | SSG                        | Static homepage              |
| `/projects`        | SSR                        | Live filter + count          |
| `/projects/[slug]` | ISR (generateStaticParams) | Pre-rendered + revalidated   |
| `/admin/*`         | SSR                        | Always fresh, auth-protected |
| `/sitemap.xml`     | Dynamic                    | Includes all active slugs    |

### RBAC Matrix

| Route                      | super_admin | admin | agent   |
| -------------------------- | ----------- | ----- | ------- |
| `/admin` overview          | ✅          | ✅    | ✅      |
| Properties CRUD            | ✅          | ✅    | 👁 View |
| Enquiries / Leads / Visits | ✅          | ✅    | ✅      |
| Analytics                  | ✅          | ✅    | ❌      |
| Settings                   | ✅          | ❌    | ❌      |

---

## Technology Stack

| Category      | Tech                  | Notes                                       |
| ------------- | --------------------- | ------------------------------------------- |
| Framework     | Next.js 16 App Router | SSR, SSG, ISR, Server Actions               |
| Language      | TypeScript 5+         | End-to-end types                            |
| Database      | MongoDB Atlas         | Flexible schema                             |
| ODM           | Mongoose 8+           | Schemas + 14 indexes                        |
| Styling       | Tailwind CSS v4       | Semantic light/dark tokens in `globals.css` |
| Components    | ShadCN UI (Nova/Zinc) | Admin UI                                    |
| Auth          | NextAuth v5           | JWT, edge-split config                      |
| Forms         | React Hook Form + Zod | Client + server validation                  |
| Charts        | Recharts              | Analytics — BarChart, PieChart, FunnelChart |
| Icons         | Lucide React          |                                             |
| Notifications | Sonner                | Toast system                                |

---

## Folder Structure

```
homes/
├── src/
│   ├── app/
│   │   ├── (public)/                    ✅ Public portal
│   │   │   ├── layout.tsx               ✅ Navbar + Footer
│   │   │   ├── page.tsx                 ✅ Homepage (SSG)
│   │   │   ├── about/page.tsx           ✅ About + team
│   │   │   ├── contact/page.tsx         ✅ Contact form
│   │   │   └── projects/
│   │   │       ├── page.tsx             ✅ All projects (SSR)
│   │   │       └── [slug]/page.tsx      ✅ Detail page (ISR)
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx               ✅ Auth shell
│   │   │   ├── page.tsx                 ✅ Live stats overview
│   │   │   ├── analytics/page.tsx       ✅ Recharts dashboard
│   │   │   ├── enquiries/page.tsx       ✅ Enquiry inbox
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx             ✅ Kanban pipeline
│   │   │   │   ├── new/page.tsx         ✅ Manual lead creation
│   │   │   │   └── [id]/page.tsx        ✅ Lead detail
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx             ✅ Property table
│   │   │   │   ├── new/page.tsx         ✅ Add property form
│   │   │   │   └── [id]/edit/page.tsx   ✅ Edit property form
│   │   │   └── site-visits/page.tsx     ✅ Site visits list
│   │   │
│   │   ├── auth/login/page.tsx          ✅ (Suspense-wrapped)
│   │   ├── api/auth/[...nextauth]/      ✅
│   │   ├── sitemap.ts                   ✅ Dynamic sitemap
│   │   ├── robots.ts                    ✅ robots.txt
│   │   ├── globals.css                  ✅ Tailwind v4 theme
│   │   └── layout.tsx                   ✅ Root layout
│   │
│   ├── components/
│   │   ├── ui/                          ShadCN
│   │   ├── public/
│   │   │   ├── navigation/Navbar.tsx    ✅ Sticky + mobile menu
│   │   │   ├── hero/HeroSearch.tsx      ✅ 3-field search bar
│   │   │   ├── properties/
│   │   │   │   ├── PropertyCard.tsx     ✅
│   │   │   │   ├── PropertyGallery.tsx  ✅ Lightbox
│   │   │   │   ├── ProjectsFilter.tsx   ✅ Pill filters
│   │   │   │   └── ReraBadge.tsx        ✅
│   │   │   ├── forms/EnquiryForm.tsx    ✅ → submitEnquiry()
│   │   │   └── Footer.tsx              ✅
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx              ✅ Role-aware nav
│   │   │   ├── Header.tsx               ✅ User menu
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsDashboard.tsx ✅ Charts + KPI cards
│   │   │   ├── enquiries/EnquiryInbox.tsx ✅
│   │   │   ├── leads/
│   │   │   │   ├── LeadsKanban.tsx      ✅
│   │   │   │   └── LeadDetail.tsx       ✅
│   │   │   ├── properties/
│   │   │   │   ├── PropertyTable.tsx    ✅
│   │   │   │   ├── MediaGallery.tsx     ✅ Local media manager
│   │   │   │   └── PropertyForm.tsx     ✅ 9-section multi-step form
│   │   │   └── sitevisits/SiteVisitsView.tsx ✅
│   │   └── shared/                      ✅ AuthProvider, ThemeProvider, ThemeToggle, AmenityIcon
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts            ✅ Singleton
│   │   │   ├── models/                  ✅ 5 schemas
│   │   │   └── actions/                 ✅ Property, lead, enquiry, visit, and media actions
│   │   ├── auth/                        ✅ Edge-split
│   │   └── utils/
│   │       ├── constants.ts             ✅
│   │       └── validators.ts            ✅
│   │
│   ├── types/index.ts                   ✅
│   ├── types/next-auth.d.ts             ✅
│   └── proxy.ts                         ✅
│
├── scripts/seed.ts                      ✅
├── next.config.ts                       ✅ Image domains
└── package.json
```

---

## Database Schema Design

| Collection   | Key Design                                     | Indexes                                   |
| ------------ | ---------------------------------------------- | ----------------------------------------- |
| `properties` | 6 attribute groups, GeoJSON, virtuals          | 2dsphere, compound search, text, featured |
| `leads`      | 7-stage pipeline, activity log, async pre-save | {stage, assignedTo}, {propertyId, stage}  |
| `enquiries`  | Raw submissions, 24h dedup                     | {status, createdAt}, {propertyId}         |
| `users`      | bcrypt, select:false, initials virtual         | {email} unique                            |
| `siteVisits` | Scheduling, outcomes, async pre-save           | {agentId, scheduledAt}, {propertyId}      |

### Lead Pipeline

```
new → contacted → qualified → site_visit_scheduled → negotiation → converted → lost
```

---

## Server Actions Reference

**37 total actions across 5 files:**

**`property.actions.ts`** — getProperties, getPropertyBySlug, getPropertyById, getFeaturedProperties, createProperty, updateProperty, togglePropertyStatus, toggleFeatured, deleteProperty, getAllPropertySlugs, getPropertyStats

**`property-media.actions.ts`** — uploadPropertyMedia, setPropertyCoverImage, reorderPropertyMedia, deletePropertyMedia

**`enquiry.actions.ts`** — submitEnquiry (public, 24h dedup), getEnquiries, getEnquiryStats, markEnquiryReviewed, markEnquirySpam, convertEnquiryToLead

**`lead.actions.ts`** — getLeads, getLeadsKanban, getLeadById, createLead, updateLeadStage, assignLead, addLeadActivity, updateLeadScore, markLeadLost, getLeadStats, getAgents

**`sitevisit.actions.ts`** — scheduleSiteVisit, getSiteVisits, getUpcomingVisits, updateSiteVisitStatus, getSiteVisitStats

---

## Public Portal Pages

| Page            | Route              | Description                                                         |
| --------------- | ------------------ | ------------------------------------------------------------------- |
| Homepage        | `/`                | Hero, HeroSearch, featured properties, services, trust, enquiry CTA |
| All Projects    | `/projects`        | SSR grid, pill filters (type/possession/budget), pagination         |
| Property Detail | `/projects/[slug]` | ISR, full specs, gallery lightbox, amenities, nearby, sidebar form  |
| About           | `/about`           | Team, company story, values, compliance badges                      |
| Contact         | `/contact`         | Contact cards, enquiry form                                         |
| Sitemap         | `/sitemap.xml`     | Auto-generated — includes all active property slugs                 |
| Robots          | `/robots.txt`      | Blocks /admin /api /auth                                            |

---

## CRM Dashboard Modules

| Module         | Route                         | Key Features                                                          |
| -------------- | ----------------------------- | --------------------------------------------------------------------- |
| Overview       | `/admin`                      | Live stats, pipeline chart, upcoming visits, quick actions            |
| Analytics      | `/admin/analytics`            | Funnel chart, source bars, type pie, visit progress bars, stage table |
| Enquiry Inbox  | `/admin/enquiries`            | Status tabs, convert-to-lead, mark reviewed/spam                      |
| Leads Kanban   | `/admin/leads`                | 5-column board, stage move, score display                             |
| Add Lead       | `/admin/leads/new`            | Manual lead entry wired to `createLead`                               |
| Lead Detail    | `/admin/leads/[id]`           | Activity timeline, agent assign, inline notes                         |
| Property Table | `/admin/properties`           | Status filter, search, status/featured toggles, row actions           |
| Add Property   | `/admin/properties/new`       | Property form with post-save gallery setup                            |
| Edit Property  | `/admin/properties/[id]/edit` | Deep-merged updates, preserved media, local gallery tools             |
| Site Visits    | `/admin/site-visits`          | Visit cards, complete/no-show actions, stats                          |

---

## Known Fixes Applied

These fixes were made during development and are already incorporated:

| Fix                            | Details                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Tailwind v4 migration**      | `globals.css` uses `@import "tailwindcss"` + `@theme {}` block instead of v3 config                                          |
| **TypeScript serialization**   | Server Action serialize helpers removed explicit type assertions                                                             |
| **Mongoose async pre-save**    | `Lead.ts` and `SiteVisit.ts` pre-save hooks converted to async, removing `next()` callback conflicts                         |
| **budgetRange field mismatch** | `convertEnquiryToLead` correctly maps enquiry budget to lead requirements                                                    |
| **ObjectId hardening**         | Lead/enquiry writes validate actor ids, sanitize optional property refs, and log invalid inputs with field context           |
| **Property edit stability**    | Edit flow now deep-merges nested payloads, preserves `mediaAssets`, and tolerates blank optional number inputs               |
| **Local media gallery**        | Admin property edit supports upload, cover selection, drag reorder, and safe delete for local `/uploads/properties/*` assets |
| **Theme parity**               | Public navbar and admin header now expose a reusable light/dark toggle and core CRM/property screens use semantic tokens     |
| **Edge runtime error**         | Auth config split: `auth.config.ts` (edge-safe) + full `config.ts` (node only). `proxy.ts` uses edge-safe instance           |
| **useSearchParams Suspense**   | Login page wrapped in `<Suspense>` boundary for static prerendering                                                          |

---

## Development Phases

| Phase       | Focus                                                        | Status      |
| ----------- | ------------------------------------------------------------ | ----------- |
| **Phase 0** | Bootstrap — Next.js 15, ShadCN (Nova/Zinc), folder structure | ✅ Complete |
| **Phase 1** | Database — 5 Mongoose schemas, connection singleton, seed    | ✅ Complete |
| **Phase 2** | Auth + RBAC — NextAuth v5, edge-split, proxy.ts, login UI    | ✅ Complete |
| **Phase 3** | Server Actions — 33 actions, Zod validators                  | ✅ Complete |
| **Phase 4** | CRM Dashboard — Kanban, inbox, property table, visits        | ✅ Complete |
| **Phase 5** | Public Portal — homepage, project pages, enquiry forms       | ✅ Complete |
| **Phase 6** | Analytics, property form, about page, sitemap, robots        | ✅ Complete |
| **Phase 7** | QA, data migration, production deploy                        | 🔄 Next     |

---

## Environment Setup

```bash
git clone <repo-url> && cd homes
npm install
cp .env.example .env.local
npm run seed
npm run seed:leads
npm run dev
npm run build  # run in a networked environment so Google Fonts can be fetched
```

```env
NEXTAUTH_MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/homes
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Homes
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```json
"scripts": {
  "dev":   "next dev",
  "build": "next build",
  "start": "next start",
  "seed":  "node --import tsx scripts/seed.ts",
  "seed:leads": "node --import tsx scripts/seed-leads.ts"
}
```

### Seed Notes

- `npm run seed` creates the base admin user and the 7 property records.
- `npm run seed:leads` clears and reseeds the `leads` collection with 18 realistic records spanning all stages and sources.
- Property gallery uploads are stored locally under `public/uploads/properties/<slug>/` and assume persistent disk storage.

---

## Design System

### Palette (Tailwind v4 `@theme` block)

| Token          | Hex                   | Usage                             |
| -------------- | --------------------- | --------------------------------- |
| `--background` | `#F4F9E9` / `#1A3F4E` | App canvas in light / dark mode   |
| `--foreground` | `#1A3F4E` / `#F4F9E9` | Primary text in light / dark mode |
| `--card`       | `#FFFFFF` / `#245061` | Elevated surfaces                 |
| `--accent`     | `#D6E3C9` / `#2A6172` | Pills, chips, soft surfaces       |
| `--primary`    | `#2FA3F2`             | Accent CTA and highlight color    |

### Typography

| Role      | Font             | Weights            |
| --------- | ---------------- | ------------------ |
| Headlines | Playfair Display | 400, 500, 600, 700 |
| Body / UI | DM Sans          | 300, 400, 500, 600 |

### Key Utilities

- `text-gradient-primary` — primary-accent text gradient
- `bg-grid-pattern` — subtle primary grid overlay for hero backgrounds
- `line-clamp-2 / -3` — Text truncation utilities

---

## Current Project Status

### ✅ Current State

**Copy map (from `phase6/` folder):**

| File                     | Destination                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `analytics-page.tsx`     | `src/app/admin/analytics/page.tsx`                          |
| `AnalyticsDashboard.tsx` | `src/components/dashboard/analytics/AnalyticsDashboard.tsx` |
| `PropertyForm.tsx`       | `src/components/dashboard/properties/PropertyForm.tsx`      |
| `property-new-page.tsx`  | `src/app/admin/properties/new/page.tsx`                     |
| `property-edit-page.tsx` | `src/app/admin/properties/[id]/edit/page.tsx`               |
| `about-page.tsx`         | `src/app/(public)/about/page.tsx`                           |
| `sitemap.ts`             | `src/app/sitemap.ts`                                        |
| `robots.ts`              | `src/app/robots.ts`                                         |

**Create missing directories:**

```bash
mkdir -p src/app/admin/analytics
mkdir -p src/app/admin/properties/new
mkdir -p "src/app/admin/properties/[id]/edit"
mkdir -p src/components/dashboard/analytics
```

**Verify:**

```bash
npm run build    # should exit 0
# /admin/leads/new → manual lead creation
# /admin/properties/[id]/edit → upload, reorder, cover, delete gallery media
# /admin/leads + /admin/enquiries → pipeline and conversion stats populated after `npm run seed:leads`
# /about → team + values page
# /sitemap.xml → lists all active property slugs
# /robots.txt → blocks /admin /api /auth
```

### 🔄 Up Next — Phase 7: Production Deploy

Final QA checklist before going live:

- [ ] Test full enquiry → lead → site visit → converted flow end-to-end
- [ ] Verify all 7 seeded properties render correctly on public pages
- [ ] Run Lighthouse audit — target 90+ Performance, 100 SEO, 100 Accessibility
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure MongoDB Atlas IP allowlist for production server
- [ ] Set up Vercel project — connect repo, add all env vars
- [ ] Enable Vercel Analytics for Core Web Vitals monitoring
- [ ] Change default admin password before go-live
- [ ] Add real RERA IDs to seeded properties
- [ ] Upload actual property images and replace placeholder URLs

---

## Contributing

1. Business logic → `src/lib/db/actions/` — never in components
2. New DB fields → `src/types/index.ts` first, then schema, then validator
3. Auth guards → `requireAuth()` or `withRole()` as first line of every action
4. Maintain edge/node split — never import Mongoose in `proxy.ts` or `auth.config.ts`
5. Soft deletes only — `status: "archived"` not hard delete
6. All Tailwind uses v4 syntax — `@theme {}` not `tailwind.config.ts` extend

---

_Built with Next.js 16, MongoDB Atlas, Tailwind CSS v4, ShadCN UI, and NextAuth v5._
_One codebase — any real estate business._
