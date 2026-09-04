# LabOS — Coding Standards & Conventions

**Status:** Accepted
**Last updated:** 2026-09-03
**Related:** `docs/architecture/system-design.md`

This is the code-level companion to the architecture doc — naming, state management, validation, and error-format conventions every module should follow. Architecture patterns (DDD, CQRS, Vertical Slices, folder structure) are explained in `docs/architecture/system-design.md` Sections 2 and 8; this doc doesn't repeat them, only extends them into concrete conventions.

---

## 1. Frontend State Management

**Decision: TanStack Query for all server data. No global client-state library by default.**

Reasoning: LabOS's frontend needs are overwhelmingly "fetch data, show it, mutate it" (reports, panels, referrals) — not complex, cross-cutting client-only state (no multi-step wizards sharing state across unrelated components, no undo/redo). TanStack Query handles caching, loading/error states, and refetching per-feature, without requiring a global store, Provider boilerplate, or the Redux paradigm along with it. RTK Query was considered and rejected for the same reason — it's a fine, lean library on its own merits, but it still requires a Redux store for a need that's fundamentally just server-state syncing.

- One `useQuery`/`useMutation` hook per feature, colocated with that feature's vertical slice (mirrors the backend's per-slice folder convention).
- **If a genuine cross-cutting client-only state need shows up later** (not server data), reach for **Zustand** — small, no Provider ceremony — rather than introducing Redux. Don't set this up preemptively; add it only when a real need appears.

---

## 2. Validation — Zod, End to End

**Decision: Zod is the single validation library, used on both frontend and backend.** Not class-validator on the backend and Zod on the frontend — one system, one mental model, one place schemas are defined.

- **Frontend:** React Hook Form + Zod via `@hookform/resolvers`, as already established in the build prompt for the panel/parameter forms.
- **Backend (NestJS):** Zod schemas validated via a Zod validation pipe (e.g. `nestjs-zod` or a custom `ZodValidationPipe`), not `class-validator`/`class-transformer` decorators. Keeps the whole stack in one validation language.
- **Where it makes sense, share schema shapes** between frontend and backend (e.g. a `CreateReportSchema` used both for the form and the DTO validation) — reduces drift between what the UI allows and what the API accepts. Doesn't need a shared package on day one; start by keeping them structurally identical and revisit sharing a `/packages/shared-schemas` if duplication becomes a real maintenance pain.

---

## 3. API Error Format — RFC 7807 Problem Details

Adopted from a reviewed reference project — a real, lightweight standard worth using regardless of scale, rather than inventing an ad-hoc error shape.

Every API error response follows the Problem Details shape:
```json
{
  "type": "https://labos.dev/errors/report-not-found",
  "title": "Report not found",
  "status": 404,
  "detail": "No report found with id 'abc123' for this lab.",
  "instance": "/api/v1/reports/abc123"
}
```
Implemented as a NestJS exception filter that catches domain/HTTP exceptions and formats them consistently — one place, applied globally, not repeated per controller.

---

## 4. Naming Conventions Cheat Sheet

Adapted from a reviewed reference project's proven convention — reused because consistent, predictable naming is genuinely more valuable than inventing our own scheme, and this one is well battle-tested.

| Layer | Type | Suffix | Example |
|---|---|---|---|
| Backend | Entity | `.entity.ts` | `report.entity.ts` |
| Backend | Controller | `.controller.ts` | `finalize-report.controller.ts` |
| Backend | Command | `.command.ts` | `finalize-report.command.ts` |
| Backend | Query | `.query.ts` | `get-patient-history.query.ts` |
| Backend | Handler | `.handler.ts` | `finalize-report.handler.ts` |
| Backend | DTO / Zod Schema | `.dto.ts` | `finalize-report.dto.ts` |
| Backend | Module | `.module.ts` | `reports.module.ts` |
| Backend | Repository interface | `.repository.interface.ts` | `report.repository.interface.ts` |
| Backend | Repository implementation | `.repository.ts` | `report.repository.ts` |
| Backend | Domain Event | `.event.ts` | `report-finalized.event.ts` |
| Backend | Test fixture/builder | `.mother.ts` | `report.mother.ts` |
| Frontend | Component | `.tsx`, folder + `index.tsx` | `/components/form/text-field/index.tsx` |
| Frontend | Query/Mutation hook | `.hook.ts` | `use-finalize-report.hook.ts` |
| Frontend | API service call | `.service.ts` | `finalize-report.service.ts` |
| Frontend | Zod schema | `.schema.ts` | `finalize-report.schema.ts` |

Naming: PascalCase for components/classes, camelCase for functions/variables, kebab-case for folders and filenames (component `index.tsx` files excepted).

---

## 5. SOLID Principles — Applied Concretely

Named at the architecture level already (Section 4 of the architecture doc); expanded here into what each one actually means day-to-day in this codebase:

- **Single Responsibility** — each module owns one domain concern (Section 7 of architecture doc); each command/query handler does exactly one thing.
- **Open/Closed** — new test panels, parameters, or notification providers should be addable through configuration or a new implementation of an existing interface, not by editing existing handler logic.
- **Liskov Substitution** — any implementation of a repository or notification-provider interface must be fully swappable for another without breaking the code that depends on it (e.g. a WhatsApp provider and an email provider both implementing the same `NotificationProvider` interface).
- **Interface Segregation** — keep repository/provider interfaces narrow and specific to what each module actually needs, rather than one large shared interface every module partially implements.
- **Dependency Inversion** — domain logic depends on interfaces (`report.repository.interface.ts`), never directly on Supabase or a specific provider SDK; the concrete implementation lives in `/infrastructure` and is swappable.

---

## 6. Testing — Practical Baseline

(Full detail in the architecture doc's ADR-0001; restated here as the day-to-day expectation.)

- Unit tests for handlers/services (Jest).
- Integration tests for CQRS command/query handlers touching real report data.
- One end-to-end test protecting the fill → print/PDF critical path.
- Not aiming for exhaustive coverage at this stage — prioritize tests that protect the parts a pilot lab would actually notice breaking.
