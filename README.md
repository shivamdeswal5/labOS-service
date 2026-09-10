# LabOS — Backend Service

> A modern, lightweight lab-operations platform tailored specifically for India's independent diagnostic labs (1–3 staff, 10–50 samples/day) transitioning from paper registers and spreadsheets.

---

## Architecture & Design Principles

LabOS is engineered as a **Modular Monolith** adhering to **Domain-Driven Design (DDD)**, **CQRS (Command Query Responsibility Segregation)**, and **Onion Architecture** principles.

- **Modular Monolith:** Single deployment with strict bounded contexts (`labs`, `panels`, `reports`, `referrals`, `notifications`, `billing`, `collections`, `websockets`).
- **CQRS & Vertical Slices:** Every use-case is self-contained in a command/query slice (`.command.ts`, `.handler.ts`, `.dto.ts`).
- **Real-Time Gateway & Multi-Tenant Rooms:** WebSockets powered by Socket.IO with multi-tenant room isolation (`lab:{labId}`, `lab:{labId}:doctors`, `user:{userId}`) and CloudEvents-standard envelopes (`EventMessage<T>`).
- **Standard NestJS DTOs:** Validation using `class-validator` and `class-transformer` through NestJS's native global `ValidationPipe`.
- **Clean Exception Handling:** Unified global exception filter (`AllExceptionsFilter`) providing structured JSON responses.
- **Dependency Inversion:** Domain entities and logic depend on domain contracts, with infrastructure (TypeORM / Supabase) implemented behind interfaces.
- **Zero Bloat / Production Standards:** Detailed in [`docs/conventions/backend-review.md`](docs/conventions/backend-review.md).

---

## Tech Stack

- **Framework:** NestJS (Node.js & TypeScript)
- **Real-Time / Sockets:** `@nestjs/websockets` + Socket.IO (`@nestjs/platform-socket.io`)
- **Database & ORM:** PostgreSQL + TypeORM (Supabase Postgres)
- **Authentication & Storage:** Supabase Auth + Supabase Storage
- **Validation:** `class-validator` & `class-transformer`
- **Logging:** Structured JSON logging via Pino (`nestjs-pino`)
- **Health Checks:** `@nestjs/terminus` (`/api/v1/health`)
- **Containerization:** Docker & Docker Compose (Node 20 Alpine with `dumb-init`)

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm

### 1. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Update `.env` with your database and Supabase credentials if connecting to remote services, or use default credentials for local Docker development.

### 2. Running via Docker (Recommended for Local Dev)
Start the local PostgreSQL database and the NestJS backend with live reloading:
```bash
docker compose up -d
```
To view logs:
```bash
docker compose logs -f backend
```

### 3. Running Locally
Install dependencies:
```bash
npm install
```

Run in development mode:
```bash
npm run start:dev
```

Build for production:
```bash
npm run build
```

Run linter:
```bash
npm run lint
```

---

## Project Structure

```
labOS-service/
├── Dockerfile                  # Multi-stage production & dev container setup
├── docker-compose.yml          # Local Postgres & backend orchestration
├── docs/                       # Project specifications & architecture docs
│   ├── product/                # PRD & product roadmap
│   ├── architecture/           # System design & data model
│   └── conventions/            # Coding standards & backend review guide
├── src/
│   ├── modules/
│   │   ├── labs/               # Tenant identity, profiles, and team members
│   │   ├── panels/             # Test panels, parameters, templates, packages
│   │   ├── reports/            # Patients, results, amendments, reports
│   │   ├── referrals/          # Doctors, commissions, outsourced tests
│   │   ├── notifications/      # WhatsApp/email dispatch
│   │   ├── billing/            # Invoices, expenses, financial exports
│   │   ├── collections/        # Home sample collection bookings
│   │   ├── websockets/         # Real-time WebSocket gateway, room routing & event bridge
│   │   └── shared/             # Shared infrastructure, filters, guards, decorators
│   ├── app.module.ts           # Root module registration
│   └── main.ts                 # Application entrypoint
└── test/                       # E2E & integration test suites
```

---

## Documentation Links

- [Product Requirements Document (PRD)](docs/product/prd.md)
- [System Architecture](docs/architecture/system-design.md)
- [Data Model & Schema](docs/architecture/data-model.md)
- [Coding Standards & Conventions](docs/conventions/coding-standards.md)
- [Master Backend Review Guide](docs/conventions/backend-review.md)
- [Master Context & Decisions Log](CONTEXT.md)
