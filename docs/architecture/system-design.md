# LabOS — System Architecture

**Status:** Accepted
**Last updated:** 2026-09-03
**Related:** `docs/product/prd.md`

---

## 1. Constraints Going In

- **Team:** solo developer (Shivam), using AI coding tools (Cursor/Antigravity/Claude Code) — architecture needs to be simple enough for one person to reason about and for AI tools to work within consistently.
- **Budget:** zero-to-minimal for Phase 1. Every choice below defaults to a genuine free tier, with a clear, predictable (not surprising) cost when scaling past it.
- **Scale target for Phase 1:** one pilot lab, growing to a small handful (5–10) of word-of-mouth labs in Phase 2. Not designing for hundreds of tenants yet — but not painting ourselves into a corner either.
- **Non-functional priorities:** low operational burden > raw performance. Correctness on medical data > premature optimization.
- **Note on scope:** LabOS is a new project, built from scratch. It shares no code, data, or architecture with any prior personal tool — any earlier prototype exploring similar ideas informed our thinking but is not a phase of this project and is not referenced further in this document.

---

## 2. Concepts Used In This Document (read this before the rest)

This document uses a few architectural terms that may be new. Explained here once, in plain language, so the rest of the doc can use them without re-explaining — and so any AI tool reading this repo has the same shared understanding we do.

### Domain-Driven Design (DDD)
The core idea: structure code around the real business concepts your friend already thinks in — a `Report`, a `TestPanel`, a `ReferringDoctor` — rather than around technical layers like "all database code" or "all API code." Related concepts get grouped together into a **bounded context**: a boundary around one area of the business (e.g. everything about reports lives together, everything about referrals lives together), with its own rules, not reaching into another boundary's internals. Our module list in Section 7 (`panels`, `reports`, `referrals`, `labs`, `notifications`, `billing`, `collections`) — each one *is* a bounded context.

### Modular Monolith
One deployed application (not many separate services talking over a network), but internally organized into the strict, independent modules described above. You get the simplicity of one codebase and one deployment, while still keeping a clean boundary between concerns — so if a module ever genuinely needs to become its own service later, it's a clean extraction, not a rewrite. The opposite extreme, **microservices** (many independently deployed services), adds real operational cost — network calls between services, distributed transactions, deployment orchestration — that is not justified at our scale and is explicitly rejected here.

### CQRS (Command Query Responsibility Segregation)
Separates code that **changes** state (a **Command**, e.g. "finalize this report") from code that **reads** state (a **Query**, e.g. "get this patient's history"), rather than mixing both into one general-purpose service class. We use it in its **lightweight, in-process form**: one Postgres database, no event sourcing, no eventual consistency — just clean separation and an internal event system (see next).

### Domain Events
When something meaningful happens (e.g. a report is finalized), the module where it happened publishes an **event** (`ReportFinalizedEvent`) instead of directly calling other modules. Other modules that care (e.g. `notifications`, to send a WhatsApp/email) **listen** for that event. Neither module needs to know the other exists — this is what keeps the Modular Monolith's boundaries real instead of quietly collapsing into one tangled mass over time.

### Vertical Slice Architecture
The traditional way to organize backend code is **by technical layer**:
```
/controllers   ← every controller
/services      ← every business logic class
/repositories  ← every database access class
```
Understanding "what happens when a report is finalized" means hunting across three unrelated folders. **Vertical Slice Architecture organizes by feature/use-case instead** — everything needed for one specific action lives together in one folder:
```
/finalize-report
  finalize-report.command.ts   ← the request shape
  finalize-report.handler.ts   ← the logic
  finalize-report.dto.ts       ← validation
```
This pairs naturally with CQRS: **each Command or Query IS a vertical slice.** We are not layering a separate architecture on top of CQRS — Vertical Slice is simply how we organize the commands/queries we already decided to use, instead of the older by-layer style. See Section 8 for how this looks in our actual folder structure.

---

## 3. High-Level Shape

```
┌─────────────────────┐        ┌──────────────────────┐
│   Next.js Frontend   │  HTTPS │   NestJS Backend API  │
│   (Vercel, free)     │ ─────► │   (hosting: TBD below)│
└─────────────────────┘        └──────────┬────────────┘
                                            │
                                 ┌──────────▼────────────┐
                                 │   Supabase             │
                                 │   - Postgres (data)     │
                                 │   - Auth (users/roles)  │
                                 │   - Storage (logos/PDFs)│
                                 └────────────────────────┘
```

- **Frontend:** Next.js (App Router), deployed on Vercel free tier.
- **Backend:** NestJS (TypeScript) — same language as the frontend, reducing context-switching for a solo dev and for AI tools working across the codebase.
- **Data/Auth/Storage:** Supabase (see ADR-0001 below for the reasoning).

---

## 4. Architectural Pattern & Design Principles — Summary

(Full explanations of each term are in Section 2 above; this is the concrete decision list.)

- **Pattern:** Modular Monolith with DDD bounded contexts as modules. Not microservices.
- **CQRS:** lightweight, in-process, via NestJS's CQRS module. Not distributed/event-sourced.
- **Code organization within each module:** Vertical Slices — one folder per command/query, not one folder per technical layer.
- **SOLID principles**, applied concretely:
  - *Single Responsibility* — each module owns one domain concern; each slice owns one use case.
  - *Dependency Inversion* — the storage-abstraction-layer principle (no component talks to Supabase directly) is this principle in practice; same applies to `notifications` (abstracted behind an interface so swapping WhatsApp providers later doesn't touch calling code).
  - Full SOLID discipline (Open/Closed, Liskov, Interface Segregation) belongs in `docs/conventions/coding-standards.md` as day-to-day coding practice — noted here so it isn't lost.
- **API style:** REST, versioned (`/api/v1/...`) — not GraphQL. GraphQL's flexibility doesn't pay for its schema/resolver complexity at our scale, and REST is simpler for AI coding tools to work with predictably.
- **Frontend component layer:** shadcn/ui on top of Tailwind — Radix UI primitives (accessible, unstyled) delivered as code you own in the repo, not an opaque dependency. Fits into `/components/ui`.

---

## 5. Multi-Tenancy Approach

**Decision: shared schema, `lab_id` column on every tenant-scoped table** — not schema-per-tenant.

Reasoning: schema-per-tenant (a separate Postgres schema, or separate database, per lab) adds real operational complexity — migrations run per-tenant, provisioning a new lab means provisioning new infrastructure. At our current and near-term scale (single digits to low tens of labs), this complexity buys us nothing. A `lab_id` foreign key on every relevant table, enforced via Postgres **Row Level Security (RLS)** policies (a Supabase-native feature — a direct benefit of the Supabase choice), gives us real tenant isolation without the operational overhead.

If/when we reach a scale where noisy-neighbor performance or very large lab data volumes become a real problem, that's the point to revisit schema-per-tenant — not before.

---

## 6. Auth & Roles

- Supabase Auth handles user accounts (email/password to start; social login not needed for this user base).
- Every user belongs to exactly one lab (`lab_id` on the user record) — no cross-lab access, enforced by RLS.
- Roles (P1 requirement): `owner`, `technician`, `pathologist` — a simple role column, checked both in RLS policies (defense in depth) and in NestJS route guards (business-logic-level checks, e.g. "only pathologist role can sign off a report").

---

## 7. Core Backend Modules (DDD bounded contexts, maps to PRD requirements)

- **`panels`** — config-driven test panel/section/parameter engine
- **`reports`** — patient info, filled results, print/PDF generation trigger, history/search
- **`referrals`** — outsourced test tracking (send-out status, merge into final report) and referring-doctor tracking (commission ledger, no auto-payout)
- **`labs`** — tenant/lab profile, branding, settings
- **`notifications`** — WhatsApp/email report delivery (abstracted behind an interface so the underlying provider can change without touching calling code)
- **`billing`** — basic per-report invoicing, expense tracking (P1)
- **`collections`** — simple home-collection booking/list (P1, intentionally simple per PRD scope)

Each module owns its own commands, queries, domain logic, and repository — never reaches into another module's internals directly. Cross-module reactions happen via Domain Events (Section 2), not direct calls.

---

## 8. Folder Structure — DDD Modules + Vertical Slices + CQRS, together

This is what Sections 2 and 4 look like as an actual repo layout:

```
/src
  /modules
    /reports                          ← DDD bounded context
      /commands
        /finalize-report
          finalize-report.command.ts
          finalize-report.handler.ts
          finalize-report.dto.ts
        /create-report
          create-report.command.ts
          create-report.handler.ts
          create-report.dto.ts
      /queries
        /get-patient-history
          get-patient-history.query.ts
          get-patient-history.handler.ts
      /events
        report-finalized.event.ts
      /domain
        report.entity.ts
        report.repository.interface.ts   ← Dependency Inversion: module depends on this interface, not Supabase directly
      /infrastructure
        report.repository.ts             ← the Supabase/Postgres implementation of the interface above
      reports.module.ts
    /panels
      /commands
        /create-panel  ...
        /update-parameter  ...
      /queries
        /get-panel  ...
      /domain
      /infrastructure
      panels.module.ts
    /referrals
      (same shape)
    /labs
      (same shape)
    /notifications
      (same shape — includes the notification-provider interface for WhatsApp/email abstraction)
    /billing
      (same shape)
    /collections
      (same shape)
  /shared
    /guards           ← role-based access guards used across modules
    /decorators
    /utils
```

Each command/query folder is a **vertical slice** — self-contained, easy for a human or an AI tool to open and fully understand without hunting across the codebase. Each top-level module under `/modules` is a **DDD bounded context**. The `/domain` + `/infrastructure` split inside each module is where **Dependency Inversion** lives concretely: domain logic depends on an interface (`report.repository.interface.ts`), and the Supabase-specific implementation is swappable without touching the domain logic.

---

## 9. Offline Sync Design (P1/P2)

As designed in our earlier discussion — formalize as its own ADR before implementation (see Action Items). Summary: optimistic concurrency via a `version` integer per record, field-level auto-merge for non-overlapping edits, human-resolved flag for genuine same-field conflicts. Not needed until multi-device/multi-user usage begins (Phase 2), but the `version` column should be added to relevant tables from the start of Phase 1 so it's not a painful retrofit.

---

## 10. WhatsApp/Notification Delivery — needs a decision

Not locked yet. Options, roughly in cost/complexity order:
- **Meta WhatsApp Cloud API directly** — free tier available (a number of free conversations/month), more setup (Meta Business verification), most control.
- **Aggregator (Twilio, MSG91, Gupshup)** — easier integration, per-message cost, faster to get running.
- **Defer WhatsApp, ship email/SMS first** — lowest effort initially, add WhatsApp once the core product is proven with the pilot lab.

Given zero-budget-for-now and that this is a genuine differentiator worth getting right rather than rushed, my suggestion: **defer WhatsApp to early in Phase 1, ship with email delivery first**, since email is free and trivial, and revisit WhatsApp once you're ready to invest the Meta Business verification effort. Flagging this as open rather than deciding it here — want your call before it's locked into requirements.

---

## 11. Storage Abstraction

No component talks to Supabase directly. Domain logic depends on repository interfaces (Section 8); the Supabase-specific implementation is an interchangeable detail behind that interface. This is Dependency Inversion applied concretely, and it's what makes swapping providers later (if ever needed) touch one layer, not the whole codebase.

---

## 12. Hosting (Phase 1)

- **Frontend:** Vercel free tier.
- **Backend (NestJS):** needs a decision — Render free tier (cold starts, but acceptable for this workflow since report-filling doesn't need to round-trip the backend on every keystroke) vs. a small always-on VM (e.g. Oracle Always Free) if cold starts prove annoying in practice. **Suggest starting with Render free tier for simplicity, and only move to a VM if cold starts become a real problem for the pilot lab** — don't solve a problem we don't have yet.
- **Database/Auth/Storage:** Supabase free tier, as decided below.

---

## ADR-0001: Database & Backend-as-a-Service Choice

**Status:** Accepted
**Deciders:** Shivam

### Context
LabOS Phase 1 needs a real multi-tenant backend with persistent storage: user accounts, role-based access, and file storage (lab logos, generated PDFs) are all Phase 1 requirements from the PRD.

### Decision
Use **Supabase** (managed Postgres + Auth + Storage) rather than a plain self-managed Postgres instance or Aiven.

### Options Considered

**Plain self-managed PostgreSQL (e.g. on a free VM)**
| Dimension | Assessment |
|---|---|
| Complexity | High — self-managed backups, auth, connection pooling |
| Cost | Free (compute) but real ops-time cost |
| Scalability | Fine, but manual effort to scale |
| Team familiarity | Good (Node/TS background) but auth still has to be hand-built |

**Aiven (managed Postgres only)**
| Dimension | Assessment |
|---|---|
| Complexity | Medium — managed DB, but no bundled auth/storage |
| Cost | Free-tier status unclear/inconsistent as of research; paid tiers start ~$19–75/month |
| Scalability | Good, standard managed Postgres |
| Team familiarity | Neutral — just Postgres, nothing unusual |

**Supabase (Postgres + Auth + Storage bundled)**
| Dimension | Assessment |
|---|---|
| Complexity | Low — auth and storage come free, less to build |
| Cost | Confirmed free tier: unlimited API requests, 50,000 MAU (auth), 500MB database (shared CPU/RAM), 5GB egress + 5GB cached egress, 1GB file storage, community support; predictable $25/mo Pro tier when scaling past it |
| Scalability | Good — standard Postgres underneath, no proprietary lock-in on the data itself |
| Team familiarity | New tool, but thin/well-documented API surface |

### Trade-off Analysis
The deciding factor isn't raw database capability — plain Postgres or Aiven would work fine as a database. It's that **Auth is now a real Phase 1 requirement** (role-based access), and building that ourselves is avoidable, real effort. Supabase removes that work for free, with no meaningful lock-in risk since it's standard Postgres underneath — we can always migrate the data out later if we ever outgrow Supabase's layer.

### Consequences
- **Easier:** Auth, file storage, and RLS-based tenant isolation all come essentially free.
- **Harder:** One more third-party dependency to learn; free-tier project pausing after 7 days inactivity needs to be understood (non-issue for active daily use, but worth knowing).
- **Revisit when:** database size or usage patterns exceed what Supabase's pricing ladder makes sense for — unlikely before Phase 3+.

### Testing Strategy (brief note, expand in `docs/conventions/` later)
- Unit tests per module (service/repository layers) — standard NestJS testing tools (Jest, NestJS's default).
- Integration tests for the CQRS command/query handlers, since correctness of report data is genuinely high-stakes here.
- End-to-end test for the critical path (fill report → print/PDF output matches expected letterhead) — the flow the pilot lab will judge the product on, worth protecting with a real test rather than manual checking alone.

### Action Items
1. [ ] Set up Supabase project for Phase 1 development
2. [ ] Define RLS policies for `lab_id`-scoped tenant isolation
3. [ ] Decide WhatsApp vs. email-first for notification delivery (Section 10 — open)
4. [ ] Decide backend hosting (Render free vs. VM) once Phase 1 is closer to real usage (Section 12)
5. [ ] Write a dedicated ADR for the offline-sync design before Phase 2 implementation begins
