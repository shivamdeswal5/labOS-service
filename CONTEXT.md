# LabOS — Context

Read this first, every session. This is the short pointer file — full detail lives in the docs it links to, not duplicated here.

## What this is

LabOS is a lab-operations platform for India's independent diagnostic labs — small, standalone labs (1–3 people, 10–50 samples/day) currently running on paper, priced out of every existing LIS product on the market. Full reasoning, target user, scope, and roadmap: `docs/product/prd.md`.

This is a new project. It does not build on, share code with, or depend on any prior personal tool.

## Current phase

Phase 1 (see `docs/product/prd.md` Section 9): real backend, multi-tenancy, patient history, referral/outsourced test tracking, referring-doctor tracking, WhatsApp/email delivery, basic billing, simple home-collection booking.

## Tech stack

- Frontend: Next.js (App Router), TypeScript, Tailwind, shadcn/ui
- Backend: NestJS (TypeScript)
- Data/Auth/Storage: Supabase (Postgres + Auth + Storage)
- Full reasoning and ADRs: `docs/architecture/system-design.md`

## Architecture — if you're unfamiliar with any of these terms, read `docs/architecture/system-design.md` Section 2 first

This project uses: Modular Monolith, DDD bounded contexts, lightweight in-process CQRS, Domain Events, and Vertical Slice Architecture for code organization. All explained in plain language, with a real folder-structure example, in that doc's Section 2 and Section 8 — read there before writing code that touches module structure.

## Where things live

- `docs/product/prd.md` — problem, goals, non-goals, personas, requirements, pricing, phasing
- `docs/architecture/system-design.md` — system design, architecture patterns explained, ADRs, folder structure
- `docs/architecture/decisions/` — individual ADRs for specific decisions (offline sync ADR to be added before Phase 2)
- `docs/conventions/coding-standards.md` — naming conventions, SOLID applied concretely, state management (TanStack Query, no global store by default), Zod end-to-end validation, RFC 7807 error format
- `docs/specs/` — individual feature specs, written just before each feature is built, not speculatively upfront

## Rules that shouldn't be relitigated

These were decided with real reasoning already worked through — don't re-open without a real reason:
- Small standalone Indian labs are the target, not enterprise chains (see PRD Non-Goals)
- No microservices, no distributed CQRS, no schema-per-tenant — all explicitly rejected for our current scale (see architecture doc)
- Referral-doctor commission tracking is record-keeping only, no automated payout (see PRD Section 5 flag)  
