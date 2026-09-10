# LabOS — Context

Read this first, every session. This is the master tracking file — full detail lives in the docs it links to, not duplicated here.

## What this is

LabOS is a lab-operations platform for India's independent diagnostic labs — small, standalone labs (1–3 people, 10–50 samples/day) currently running on paper, priced out of every existing LIS product on the market. Full reasoning, target user, scope, and roadmap: `docs/product/prd.md`.

This is a new project. It does not build on, share code with, or depend on any prior personal tool.

## Current phase

Building the **complete backend** first (all modules, all phases), then frontend. Not just Phase 1 — full backend API for all modules.

## Tech stack

- Frontend: Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- Backend: NestJS (TypeScript)
- ORM: TypeORM (connected to Supabase Postgres)
- Data/Auth/Storage: Supabase (Postgres + Auth + Storage)
- Validation: Standard class-validator + class-transformer on backend; Zod on frontend
- Real-Time: Socket.IO + @nestjs/websockets for live lab feeds, phlebotomy tracking, and critical alerts
- Job Queue: BullMQ or pg-boss (for async PDF generation, notifications)
- Logging: Pino (structured JSON logging)
- Full reasoning and ADRs: `docs/architecture/system-design.md`

## Architecture

This project uses: Modular Monolith, DDD bounded contexts, lightweight in-process CQRS, Domain Events, and Vertical Slice Architecture for code organization. All explained in `docs/architecture/system-design.md` Sections 2 and 8.

- **Controller placement:** one dedicated controller per use-case vertical slice — never one controller per module (see `docs/architecture/system-design.md` Section 8 and `docs/conventions/backend-review.md`)
- **Repository Pattern:** domain interfaces in `domain/<entity>/interfaces/`, implementations in `infrastructure/database/repositories/` named strictly `<entity>.repository.ts` / `<Entity>Repository`
- **Handler invocation:** slice controllers directly inject handlers for 100% compile-time type safety (no CQRS bus indirection)
- **Enum storage:** integers in database, string enums in TypeScript, ValueTransformer mapper pattern in between (inspired by residency-backend's MikroORM enum mapper, adapted for TypeORM)
- **Pagination:** cursor-based (created_at + id)
- **normal_range format:** structured JSONB (`{type, min, max, male, female, text}`) with logic encapsulated in `NormalRange` Value Object
- **WebSockets / Real-Time Gateway:** CloudEvents-compliant envelope (`EventMessage<T>`), abstract `WebSocketEvent<T>` base class, multi-tenant room isolation (`lab:{labId}`, `lab:{labId}:doctors`, `user:{userId}`), and zero-latency in-process event bridging

## Where things live

- `docs/product/prd.md` — problem, goals, non-goals, personas, requirements, pricing, phasing
- `docs/architecture/system-design.md` — system design, architecture patterns explained, ADRs, folder structure, WebSockets architecture
- `docs/architecture/data-model.md` — database schema, entity relationships, RLS pattern, all 22 single-table migrations
- `docs/architecture/decisions/` — individual ADRs for specific decisions
- `docs/conventions/coding-standards.md` — naming conventions, SOLID, state management, class-validator, unified exception handling, WebSockets standards
- `docs/conventions/backend-review.md` — master backend review and auditing specification
- `docs/specs/` — individual feature specs, written just before each feature is built
- `src/modules/` — all 8 fully built DDD bounded contexts:
  - `labs` (tenancy, profiles, membership)
  - `panels` (test panels, parameters, templates, packages)
  - `reports` (patients, reports, values, amendments, public share token)
  - `referrals` (doctors, commission ledger, outsourced tests)
  - `billing` (invoices, line items, payments, operational expenses, analytics)
  - `notifications` (WhatsApp/SMS/Email providers, audit log, templating)
  - `collections` (phlebotomy home collection requests, technician dispatch, sample tubes)
  - `websockets` (authenticated gateway, room isolation, domain event bridging, REST publisher)

## Rules that shouldn't be relitigated

These were decided with real reasoning already worked through — don't re-open without a real reason:
- Small standalone Indian labs are the target, not enterprise chains (see PRD Non-Goals)
- No microservices, no distributed CQRS, no schema-per-tenant — all explicitly rejected for our current scale
- Referral-doctor commission tracking is record-keeping only, no automated payout (see PRD Section 5 flag)
- TypeORM as ORM, not MikroORM or Prisma (decided 2026-09-07)
- Supabase for database + auth + storage (decided in architecture doc, reconfirmed 2026-09-07)
- Integer enum storage with TypeORM ValueTransformer mappers (decided 2026-09-07)
- Single-table modular migrations matching `residency-backend` standard (one dedicated migration file per table)
- Repository naming without `typeorm-` prefix (`<entity>.repository.ts` / `<Entity>Repository`)
- Standardized CloudEvents envelope for WebSockets (`EventMessage<T>`) with zero magic strings

---

## Decisions log (from planning session 2026-09-07)

### Data model additions — all confirmed
| Table / Column | Decision |
|----------------|----------|
| `panel_templates` (new table) | Pre-seeded test panel templates, system-wide, not tenant-scoped |
| `test_packages` + `package_panels` (new tables) | Bundles of panels with combined pricing |
| `audit_log` (new table) | Append-only change tracking for all entity mutations |
| `report_amendments` (new table) | Medical amendment trail for finalized reports |
| `reports.report_number` | Human-readable accession number (auto-generated per lab) |
| `reports.share_token` + `share_expires_at` | Public report sharing via link + QR code |
| `reports.remarks` | Pathologist interpretive comments on reports |
| `reports.sample_status` + `rejection_reason` | Sample lifecycle tracking (COLLECTED → PROCESSING → COMPLETED / REJECTED) |
| `reports.sample_collected_at` / `results_entered_at` / `finalized_at` / `delivered_at` | TAT (turnaround time) tracking timestamps |
| `patients.patient_number` | Human-readable patient ID (auto-generated per lab) |
| `patients.date_of_birth` | Optional DOB for accurate age calculation on return visits |
| `profiles.signature_url` + `qualification` | Pathologist signature and credentials on reports |
| `panel_parameters.method` | Testing method name ("CLIA", "Turbidimetry") |
| `panel_parameters.name_local` | Hindi/regional language parameter name |
| `panel_parameters.normal_range` | Changed from text to structured JSONB |
| `labs.report_language` | Preferred report language (default 'en') |
| `invoices.payment_status` / `payment_method` / `discount` / `paid_at` | Payment tracking fields |
| `test_panels.price` | Base price per panel |
| `test_panels.deleted_at` | Changed to soft-delete (preserve historical references) |
| `report_panels` | Composite PK `(report_id, panel_id)` to prevent duplicates |
| All enums | Store as integers in DB via TypeORM ValueTransformer |

### Architecture additions — all confirmed
| Addition | Status |
|----------|--------|
| Database indexes (patients, reports, commissions, collections) | Completed |
| Rate limiting (`@nestjs/throttler`) | Completed |
| Structured logging (Pino) | Completed |
| Health check endpoint (`@nestjs/terminus`) | Completed |
| Security headers (Helmet) | Completed |
| CORS configuration | Completed |
| Environment config with typed defaults (`@nestjs/config`) | Completed |
| Graceful shutdown hooks | Completed |
| WebSockets gateway + multi-tenant rooms (Socket.IO) | Completed |
| In-process domain events bridge | Completed |

### Build order (backend) — Status: 100% Completed
1. Scaffold NestJS + TypeORM + Supabase connection (DONE)
2. `labs` module (tenant identity, profiles, auth) (DONE)
3. `panels` module (test config, templates, packages) (DONE)
4. `reports` module (patients, results, PDF, amendments) (DONE)
5. `referrals` module (doctors, commissions, outsourced tests) (DONE)
6. `notifications` module (email, WhatsApp delivery) (DONE)
7. `billing` module (invoices, expenses, export) (DONE)
8. `collections` module (home sample collection) (DONE)
9. `websockets` module (real-time gateway & room routing) (DONE)
10. Shared infrastructure (audit log, health checks, pino logging) (DONE)

---

## Session log

### 2026-09-07 — Initial planning session
- Read all docs: PRD, system-design, data-model, coding-standards
- Studied residency-backend enum mapper pattern (MikroORM-based, adapting to TypeORM ValueTransformer)
- Identified and resolved: ORM choice (TypeORM), controller placement (per module), normal_range format (structured JSONB), pagination (cursor-based)
- Gap analysis: 21 additions across product, architecture, and competitive edge
- All decisions confirmed by owner (Shivam)

### 2026-09-08 (Session 1 & 2) — Standardization, Docker Setup & Clean Architecture
- Audited `residency-backend` patterns and streamlined `labOS-service` to match production standards
- Replaced Zod validation on backend with native NestJS class DTOs using `class-validator` and `class-transformer`
- Configured local Docker development environment (`Dockerfile`, `docker-compose.yml`, `.dockerignore`)
- Replaced custom RFC 7807 filter with unified `AllExceptionsFilter`
- Centralized metadata keys (`METADATA_KEYS`) to eliminate magic strings in guards and decorators
- Created `docs/conventions/backend-review.md` master review and auditing guide
- Completed CommonJS output, extensionless imports, one entity per file, domain exceptions hierarchy, and direct handler injection.

### 2026-09-08 (Session 3) — Reports, Referrals, Billing, Notifications & Collections
- Built full Reports bounded context (Patients, Reports, Values, Amendments, share token).
- Built full Referrals bounded context (Referring Doctors, Commission Ledger & Settlement, Outsourced Tests).
- Built full Billing bounded context (Invoices, Line Items, Payments, Operational Expenses, Financial Analytics).
- Built full Notifications bounded context (Pluggable WhatsApp/Email providers, Template Engine, Notification Logs).
- Built full Collections bounded context (Phlebotomy home collection requests, technician dispatch, sample tube barcodes).
- Created all 22 single-table modular migrations conforming to single-table-per-file convention (`1710000001001` - `1710000007002`).
- Standardized repository naming to `<entity>.repository.ts` and `<Entity>Repository` without `typeorm-` prefix.

### 2026-09-08 (Session 4) — WebSockets & Real-Time Gateway
- Implemented `src/modules/websockets/` bounded context for real-time bidirectional communication.
- Implemented CloudEvents-style standardized envelope contract (`EventMessage<T>`).
- Created abstract `WebSocketEvent<T>` base class encapsulating traceId, ISO timestamps, and channel resolution.
- Enforced multi-tenant room isolation using `RealtimeRoomBuilder` (`lab:{labId}`, `lab:{labId}:doctors`, `lab:{labId}:phlebotomists`, `user:{userId}`).
- Created `EventsGateway` authenticating connections via Supabase JWT and auto-joining tenant rooms.
- Built in-process `DomainEventsBridgeListener` bridging domain events (`report.finalized`, `collection.created`, `collection.assigned`, `collection.status_updated`) directly to WebSocket clients without HTTP self-calling roundtrips.
- Implemented REST publish slice (`POST /events/publish`) with tenant scoping.
- Added full unit test suite with 100% pass rate (`npm run test`), 0 compiler errors (`npm run build`), and 0 lint warnings (`npm run lint`).

### 2026-09-08 (Session 5) — Clinical Seeder & Diagnostic PDF Generation Engine
- Implemented CLI database seeder runner `src/seed.ts` and added `"seed": "npm run build && node dist/seed.js"` to `package.json` to seed 7 standard Indian clinical pathology panels (CBC, Lipid, LFT, KFT, Thyroid, Diabetes, Urine).
- Built `ReportPdfGeneratorService` in `src/modules/reports/infrastructure/pdf/` using `pdfkit` and `qrcode` for ultra-fast, memory-efficient vector PDF generation.
- Designed NABL/ISO compliant diagnostic report layout: branded lab header, patient demographic block, tabular parameter results with bold/red abnormal flags, dynamic reference intervals, verification QR code linking to `/api/v1/public/reports/:shareToken`, and pathologist digital signature block.
- Implemented authenticated `GET /reports/:id/pdf` and public `GET /reports/share/:token/pdf` endpoints.
- Added `ReportFinalizedPdfListener` reacting to `report.finalized`.
- Verified: `npm run build` (0 errors), `npm run lint` (0 errors, 0 warnings across 460 files), and `npm run test` (all 7 tests passing).

### 2026-09-10 (Session 6) — pg-boss Queue, Lab Health KPI Slice & Modular OpenAPI Specs
- **Background Job Queue (`pg-boss`)**: Installed `pg-boss` and built `PgBossService` + `QueueModule` using the existing PostgreSQL connection (zero extra servers, no Redis, no RabbitMQ).
- **Async PDF Pre-Compilation Worker**: Built `ReportPdfWorker` in `src/modules/reports/infrastructure/pdf/` handling the `'report-finalized-pdf'` queue; updated `ReportFinalizedPdfListener` to enqueue background PDF pre-compilation on `report.finalized`.
- **Lab Health / KPI Summary Slice**: Created vertical slice `GET /reports/dashboard-stats` returning today's clinical volume (patients, reports, pending results, ready for review, finalized, overdue reports, today's revenue, and pending collections).
- **Modular OpenAPI 3.0 Specifications**: Defined dedicated `.openapi.yaml` specs co-located in each bounded context matching the `residency-backend` standard (avoiding runtime `@nestjs/swagger` decorators on 460+ files):
  - `src/modules/labs/labs.openapi.yaml`
  - `src/modules/panels/panels.openapi.yaml`
  - `src/modules/reports/reports.openapi.yaml`
  - `src/modules/referrals/referrals.openapi.yaml`
  - `src/modules/billing/billing.openapi.yaml`
  - `src/modules/notifications/notifications.openapi.yaml`
  - `src/modules/collections/collections.openapi.yaml`
  - `src/modules/websockets/websockets.openapi.yaml`
  - `docs/openapi.yaml` (root aggregator)
- Verified: `npm run build` (0 errors), `npm run lint` (0 errors, 0 warnings across 468 files), and `npm run test` (all 7 tests passing).

---

## Current Phase: Frontend Kickoff (`labOS-app`)

Moving to the frontend application setup in `/home/navdish/Desktop/labOS/labOS-app`:
1. **Frontend Application Setup (`labOS-app`)**:
   - Initialize Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
   - Configure `@tanstack/react-query`, React Hook Form, Zod, and Lucide icons.
   - Feature-sliced architecture matching DDD bounded contexts in `labOS-service`.
   - Setup only, strictly step-by-step.
