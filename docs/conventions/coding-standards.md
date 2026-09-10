# LabOS — Coding Standards & Conventions

**Status:** Accepted
**Last updated:** 2026-09-08
**Related:** `docs/architecture/system-design.md`

This is the code-level companion to the architecture doc — naming, state management, validation, and error-format conventions every module should follow. Architecture patterns (DDD, CQRS, Vertical Slices, folder structure) are explained in `docs/architecture/system-design.md` Sections 2 and 8; this doc doesn't repeat them, only extends them into concrete conventions.

---

## 1. Frontend State Management

**Decision: TanStack Query for all server data. No global client-state library by default.**

Reasoning: LabOS's frontend needs are overwhelmingly "fetch data, show it, mutate it" (reports, panels, referrals) — not complex, cross-cutting client-only state (no multi-step wizards sharing state across unrelated components, no undo/redo). TanStack Query handles caching, loading/error states, and refetching per-feature, without requiring a global store, Provider boilerplate, or the Redux paradigm along with it. RTK Query was considered and rejected for the same reason — it's a fine, lean library on its own merits, but it still requires a Redux store for a need that's fundamentally just server-state syncing.

- One `useQuery`/`useMutation` hook per feature, colocated with that feature's vertical slice (mirrors the backend's per-slice folder convention).
- **If a genuine cross-cutting client-only state need shows up later** (not server data), reach for **Zustand** — small, no Provider ceremony — rather than introducing Redux. Don't set this up preemptively; add it only when a real need appears.

---

## 2. Validation — Standard Class DTOs on Backend

**Decision: Standard NestJS DTO classes with `class-validator` and `class-transformer` on the backend.**

- **Backend (NestJS):** Request payloads are standard TypeScript classes decorated with `class-validator` decorators (`@IsString()`, `@IsNumber()`, `@ValidateNested()`) and transformed via `class-transformer` (`@Type()`). Validated globally using NestJS's native `ValidationPipe({ whitelist: true, transform: true })`. This aligns with `residency-backend`, removes redundant Zod wrapper pipes, and integrates natively with NestJS tooling.
- **Frontend:** React Hook Form + Zod via `@hookform/resolvers` for client-side form ergonomics.
- **No Zod on Backend:** Do not use Zod schemas on the NestJS backend to avoid dual-definition overhead and custom validation pipe complexities.

---

## 3. API Error Format — Unified Global Exception Filter

Standardized error responses across the API using `AllExceptionsFilter`:
```json
{
  "statusCode": 404,
  "message": "No report found with id 'abc123' for this lab.",
  "error": "Not Found",
  "path": "/api/v1/reports/abc123",
  "timestamp": "2026-09-08T10:00:00.000Z"
}
```
Implemented as a global NestJS exception filter (`AllExceptionsFilter`) that catches HTTP and domain exceptions, formats validation errors, and prevents internal error leaks in production.

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
| Backend | DTO (class-validator) | `.dto.ts` | `finalize-report.dto.ts` |
| Backend | Slice Module | `.module.ts` | `finalize-report.module.ts` |
| Backend | Bounded Context Module | `.module.ts` | `reports.module.ts` |
| Backend | Repository interface | `.repository.interface.ts` | `report.repository.interface.ts` |
| Backend | Repository implementation | `.repository.ts` | `report.repository.ts` |
| Backend | Domain Event | `.event.ts` | `report-finalized.event.ts` |
| Backend | WebSocket Event | `.websocket-event.ts` | `report-finalized.websocket-event.ts` |
| Backend | WebSocket Gateway | `.gateway.ts` | `events.gateway.ts` |
| Backend | Event Listener | `.listener.ts` | `domain-events-bridge.listener.ts` |
| Backend | Test fixture/builder | `.mother.ts` | `report.mother.ts` |
| Frontend | Component | `.tsx`, folder + `index.tsx` | `/components/form/text-field/index.tsx` |
| Frontend | Query/Mutation hook | `.hook.ts` | `use-finalize-report.hook.ts` |
| Frontend | API service call | `.service.ts` | `finalize-report.service.ts` |
| Frontend | Zod schema | `.schema.ts` | `finalize-report.schema.ts` |

Folder organization: All vertical slices live under `src/modules/<module>/features/<group>/<slice>/` (e.g. `features/reservation/add-reservation/` as established in residency-backend). Categorized infrastructure lives under `infrastructure/database/seeders/`, `repositories/`, etc.

Naming: PascalCase for components/classes, camelCase for functions/variables, kebab-case for folders and filenames (component `index.tsx` files excepted).

---

## 5. SOLID Principles — Applied Concretely

Named at the architecture level already (Section 4 of the architecture doc); expanded here into what each one actually means day-to-day in this codebase:

- **Single Responsibility** — each module owns one domain concern (Section 7 of architecture doc); each command/query handler does exactly one thing; each file contains exactly one entity or class.
- **Open/Closed** — new test panels, parameters, or notification providers should be addable through configuration or a new implementation of an existing interface, not by editing existing handler logic.
- **Liskov Substitution** — any implementation of a repository or notification-provider interface must be fully swappable for another without breaking the code that depends on it (e.g. a WhatsApp provider and an email provider both implementing the same `NotificationProvider` interface).
- **Interface Segregation** — keep repository/provider interfaces narrow and specific to what each module actually needs, rather than one large shared interface every module partially implements.
- **Dependency Inversion** — domain logic depends on interfaces (`report.repository.interface.ts`), never directly on Supabase, TypeORM, or a specific provider SDK; the concrete implementation lives in `/infrastructure` and is swappable.

---

## 6. Code Cleanliness, Import Rules & Architecture Standards

### One Entity Per File (Strict Rule)
Every entity must reside in its own dedicated file (e.g. `test-package.entity.ts` and `package-panel.entity.ts` are separate files). Never declare multiple `@Entity()` classes in a single file. This prevents TypeORM reflection circularities and preserves file-level SRP.

### Clean Imports & Path Aliases (No `.js`, No `../../../../`)
- Configure `"baseUrl": "./"` and `"paths": { "src/*": ["./src/*"] }` in `tsconfig.json`.
- All imports across modules must use clean root-relative paths:
  `import { BaseDomainEntity } from 'src/modules/shared/domain/base.entity';`
  `import { Lab } from 'src/modules/labs/domain';`
- **Never include `.js` file extensions** in TypeScript source code imports.
- Never use deep relative imports (`../../../../`).

### Self-Documenting Code (No Redundant Comments)
- Code must be clear, concise, and self-documenting through expressive domain naming and strong types.
- Do not add obvious JSDoc comments or redundant line comments (`/** Update current user profile */`, `// Save to database`, `// Validate panel exists`).
- Preserve only non-obvious clinical or regulatory domain rationale.

### Domain Exceptions over HTTP Exceptions in Handlers
- Application handlers and domain models must throw **Domain Exceptions** (e.g. `LabAlreadyExistsException`, `PanelNotFoundException`), never NestJS HTTP exceptions (`NotFoundException`, `ConflictException`).
- HTTP status mapping is strictly a presentation-layer concern handled by the global `AllExceptionsFilter`. This keeps handlers reusable across background queues, CLI commands, and WebSockets.

### Direct Handler Injection in Controllers
- Slice controllers directly inject their dedicated use-case handler (`constructor(private readonly handler: CreatePanelHandler)`).
- Provides 100% compile-time type safety on return values, zero bus indirection overhead, and direct IDE navigation.

### DTOs vs Domain Value Objects (Strict Layer Boundary)
- **DTOs belong exclusively in the Feature/Application layer** (`features/<feature>/dtos/` or slice folders). DTOs carry `class-validator` and `class-transformer` decorators to validate incoming HTTP request bodies.
- **Value Objects belong exclusively in the Domain layer** (`domain/<entity>/value-objects/`). Value Objects represent domain concepts, enforce invariants, and encapsulate business logic. They must **never** import `class-validator`, `class-transformer`, or HTTP framework artifacts.
- Never name a domain file `*dto.ts` or declare DTO classes inside `domain/`.

### First-Class Enums (Zero Magic Strings & Zero Array Literals in Validation)
- Never use raw string arrays in validation decorators (e.g. `@IsEnum(['numeric', 'text'])` or `@IsEnum(['en', 'hi'])`).
- Never perform raw string equality checks in business logic (e.g. `patientSex === 'FEMALE'`).
- Every categorical domain type must be declared as a first-class TypeScript `enum` (e.g. `NormalRangeTypeEnum`, `SexEnum`, `ReportLanguageEnum`).
- Use `@IsEnum(MyEnum)` for full enum validation, or `@IsIn([MyEnum.A, MyEnum.B])` when validating an allowed subset.
- Cross-domain categorical types (e.g. `SexEnum`) belong in `src/modules/shared/domain/enums/`.

### One Concept Per File (Entities, Enums, Value Objects, DTOs)
- Each entity, each enum (+ its integer mapper), each Value Object, and each major DTO must reside in its own dedicated file.
- Never bundle multiple unrelated enums or DTOs into a single "grab-bag" file.

### No Cross-Slice Feature Imports
- Vertical slices must remain decoupled. Slice A (`update-panel`) must never import DTOs or internals from Slice B (`create-panel`).
- Shared DTOs within a feature group live in a dedicated `features/<feature>/dtos/` directory.

### Direct Explicit Imports (No Proxy Files & No Domain Barrel Files)
- Always import entities, value objects, and enums directly from their source file using `src/*` path aliases:
  `import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';`
- Never create single-line proxy/forwarder files (`domain/report.entity.ts -> domain/report/report.entity.ts`).
- Never create domain-level `index.ts` barrel files, which introduce runtime circular dependency errors in TypeORM entity relation graphs.


---

## 7. Testing — Practical Baseline

(Full detail in the architecture doc's ADR-0001; restated here as the day-to-day expectation.)

- **Unit tests** for handlers/services using **Vitest** (`npm run test`).
- **Integration tests** for command/query handlers exercising real repository interactions.
- One end-to-end test protecting the fill → print/PDF critical path.
- Not aiming for exhaustive coverage at this stage — prioritize tests that protect the parts a pilot lab would actually notice breaking.

---

## 8. WebSockets & Real-Time Gateway Standards

### Zero Magic Strings for Channels & Rooms
- Every WebSocket event name must use `RealtimeChannelEnum` (`REPORT_FINALIZED`, `COLLECTION_ASSIGNED`, etc.).
- Every room name must be constructed using `RealtimeRoomBuilder` (`RealtimeRoomBuilder.lab(labId)`, `RealtimeRoomBuilder.doctors(labId)`, `RealtimeRoomBuilder.user(userId)`).
- Never hardcode strings like `'lab:123'` or `'report.finalized'` in listeners or gateways.

### Strict Envelope Contract (`EventMessage<T>`)
- Every frame broadcast to clients must follow the CloudEvents-standard envelope:
  ```typescript
  export interface EventMessage<T = any> {
    channels: string[];
    event: RealtimeChannelEnum;
    timestamp: string;
    traceId: string;
    payload: T;
  }
  ```
- Top-level properties are reserved for delivery and tracing metadata.
- Domain-specific data resides entirely within `payload: T`.

### Events over Commands for Real-Time Feeds
- Real-time broadcasts are facts that already occurred; model them as classes extending `WebSocketEvent<T>`.
- Never create a command to push a WebSocket notification. Commands are only used when a client triggers an action over HTTP (e.g. `PublishEventCommand` for `POST /events/publish`).

### In-Process Domain Event Bridging
- Domain listeners (`DomainEventsBridgeListener`) handle `@OnEvent` emissions in memory and call `EventsGateway.publishToClients()`.
- Never make HTTP calls back into the application (`httpService.post`) to broadcast events.

### Handshake Authentication & Tenant Scoping
- Sockets must validate authentication during handshake (`client.handshake.auth.token` or `headers.authorization`).
- Unauthenticated sockets must be disconnected immediately with `client.disconnect(true)`.
- Sockets must automatically join their tenant lab room (`lab:{labId}`) and personal user room (`user:{userId}`), with role-based rooms (e.g. `lab:{labId}:doctors`) joined conditionally based on verified profile.

