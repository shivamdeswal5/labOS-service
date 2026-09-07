# LabOS — Data Model
 
**Status:** Accepted
**Last updated:** 2026-09-03
**Related:** `docs/architecture/system-design.md`, `docs/product/prd.md`
 
This is the concrete schema underlying every module in the architecture doc. Each section below maps directly to one DDD bounded context (Section 7 of `system-design.md`). Written for Supabase/Postgres.
 
---
 
## 1. Conventions Applied to Every Table
 
- **Primary keys:** UUID (`gen_random_uuid()`), not auto-incrementing integers — avoids leaking record counts, works cleanly with Supabase Auth's UUID user IDs, and is friendlier to eventual offline-generated IDs (Section 9, architecture doc).
- **Tenant isolation:** every tenant-scoped table has a `lab_id` column (FK to `labs.id`), enforced by Postgres Row Level Security — no table relies on application code alone to filter by tenant.
- **Optimistic concurrency:** mutable tables (ones a user actually edits, not append-only logs) carry a `version integer default 1` column, per the offline-sync design in `system-design.md` Section 9. Every successful update increments it.
- **Timestamps:** `created_at timestamptz default now()` on every table; `updated_at timestamptz` on mutable tables, maintained by a trigger, not application code (keeps it correct even if a direct DB write happens outside the API).
- **Soft delete where it matters:** patient/report records use a `deleted_at timestamptz null` column rather than hard deletes — medical records shouldn't disappear irrecoverably from an accidental click. Config tables (panels/parameters) can hard-delete since they're not medical records.
---
 
## 2. `labs` — Lab Identity & Access (bounded context: `labs`)
 
### `labs`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | |
| address | text | |
| phone_numbers | text[] | |
| logo_url | text, null | points to Supabase Storage |
| accent_color | text | hex value |
| tagline | text, null | |
| footer_note | text, null | e.g. "NOT VALID FOR MEDICO LEGAL PURPOSE" |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| version | integer | |
 
### `profiles`
One row per user, linking Supabase's built-in `auth.users` to a lab and role.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | same as `auth.users.id` |
| lab_id | uuid, FK → labs.id | a user belongs to exactly one lab |
| full_name | text | |
| role | enum: `owner`, `technician`, `pathologist` | checked in RLS and NestJS guards (system-design.md Section 6) |
| created_at | timestamptz | |
 
---
 
## 3. `panels` — Test Panel Configuration (bounded context: `panels`)
 
Hierarchy: Panel → Section → Parameter, matching the paper-sheet structure this whole product started from.
 
### `test_panels`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| name | text | e.g. "Urine Examination" |
| category | text | e.g. "Haematology", "Serology" |
| sort_order | integer | |
| created_at / updated_at / version | | |
 
### `panel_sections`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| panel_id | uuid, FK → test_panels.id | |
| name | text | e.g. "Physical Examination" |
| sort_order | integer | |
 
### `panel_parameters`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| section_id | uuid, FK → panel_sections.id | |
| name | text | e.g. "Hemoglobin" |
| unit | text, null | e.g. "g/dL" |
| input_type | enum: `text`, `number`, `dropdown`, `grid` | |
| options | jsonb, null | dropdown choices, e.g. `["Positive","Negative"]` |
| normal_range | text, null | e.g. "13.0-17.0"; seeded from `test-panels-reference-ranges.md`, editable per lab |
| sort_order | integer | |
| version | integer | |
 
---
 
## 4. `reports` — Patients & Filled Reports (bounded context: `reports`)
 
### `patients`
Kept separate from `reports` so repeat-patient history (a real requirement — see PRD Section 6) works without duplicating patient info per visit.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| name | text | |
| age | text, null | kept as text — labs often record "34" or "34Y 2M", not a clean integer |
| sex | text, null | |
| phone | text, null | |
| address | text, null | used by `collections` for home pickups |
| deleted_at | timestamptz, null | |
| created_at | timestamptz | |
 
### `reports`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| patient_id | uuid, FK → patients.id | |
| ref_by_doctor_id | uuid, FK → referring_doctors.id, null | |
| status | enum: `draft`, `finalized` | finalizing triggers `ReportFinalizedEvent` (system-design.md Section 2) |
| report_date | date | |
| created_by | uuid, FK → profiles.id | |
| deleted_at | timestamptz, null | |
| created_at / updated_at / version | | |
 
### `report_panels`
Join table — a report can include multiple panels (e.g. CBC + LFT in one visit).
| Column | Type | Notes |
|---|---|---|
| report_id | uuid, FK → reports.id | |
| panel_id | uuid, FK → test_panels.id | |
 
*(Decision: explicit join table, not a `jsonb` array of panel IDs on `reports` — keeps the relationship queryable directly in SQL, e.g. "how many CBC reports this month," without unpacking JSON.)*
 
### `report_values`
The actual entered results — one row per parameter per report.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| report_id | uuid, FK → reports.id | |
| parameter_id | uuid, FK → panel_parameters.id | |
| value | text | stored as text regardless of `input_type` — keeps this table generic across text/number/dropdown/grid; parsing/validation happens at the application layer against the parameter's `input_type` |
| is_out_of_range | boolean, default false | computed at write-time against `panel_parameters.normal_range` (system-design.md's out-of-range auto-bold logic) |
| created_at / updated_at / version | | |
 
---
 
## 5. `referrals` — Referring Doctors & Outsourced Tests (bounded context: `referrals`)
 
### `referring_doctors`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| name | text | |
| contact | text, null | |
| commission_type | enum: `none`, `flat`, `percentage` | |
| commission_value | numeric, null | flat amount or percentage, depending on type |
| created_at | timestamptz | |
 
### `doctor_commission_ledger`
Record-keeping only — no automated payout (PRD Section 5 flag on referral-commission ethics/regulatory sensitivity).
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| doctor_id | uuid, FK → referring_doctors.id | |
| report_id | uuid, FK → reports.id | |
| amount | numeric | calculated, not paid, by the system |
| status | enum: `pending`, `settled` | settled manually by the lab owner |
| settled_at | timestamptz, null | |
| created_at | timestamptz | |
 
### `outsourced_tests`
Tracks a test sent to a reference lab (Lal PathLabs, SRL, etc.) and its result merging back into the final report.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| report_id | uuid, FK → reports.id | |
| test_description | text | free text, e.g. "Thyroid Panel" — not necessarily tied to a `panel_parameters` row since the reference lab's own test structure may differ |
| reference_lab_name | text | |
| status | enum: `sent`, `pending`, `received` | |
| sent_at | timestamptz, null | |
| received_at | timestamptz, null | |
| result_value | text, null | merged into the final printed report once received |
| commission_amount | numeric, null | margin/commission on the outsourced test, if applicable |
 
---
 
## 6. `notifications` — Delivery Log (bounded context: `notifications`)
 
### `notification_log`
Append-only — no `version` column needed (never edited, only appended).
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| report_id | uuid, FK → reports.id | |
| channel | enum: `email`, `whatsapp`, `sms` | |
| recipient | text | |
| status | enum: `sent`, `failed` | |
| sent_at | timestamptz | |
 
---
 
## 7. `billing` — Invoicing & Expenses (bounded context: `billing`, P1)
 
### `invoices`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| report_id | uuid, FK → reports.id | |
| patient_id | uuid, FK → patients.id | |
| amount | numeric | |
| created_at | timestamptz | |
 
### `expenses`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| category | text | e.g. "Reagents", "Equipment" |
| description | text, null | |
| amount | numeric | |
| expense_date | date | |
| created_at | timestamptz | |
 
---
 
## 8. `collections` — Home Sample Collection (bounded context: `collections`, P1)
 
### `home_collections`
Intentionally simple, per PRD scope (no route optimization — see PRD Section 5, "Owner — Home sample collection").
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lab_id | uuid, FK → labs.id | |
| patient_id | uuid, FK → patients.id | |
| address | text | may differ from `patients.address` for a one-off pickup location |
| preferred_time | text | free text or time range, not a rigid slot system |
| status | enum: `scheduled`, `completed`, `cancelled` | |
| created_at | timestamptz | |
 
---
 
## 9. Entity Relationship Summary
 
```
labs ──< profiles
labs ──< test_panels ──< panel_sections ──< panel_parameters
labs ──< patients ──< reports ──< report_values >── panel_parameters
                            │  └──< report_panels >── test_panels
                            ├──< outsourced_tests
                            ├──< notification_log
                            └──< invoices
labs ──< referring_doctors ──< doctor_commission_ledger >── reports
labs ──< expenses
labs ──< home_collections >── patients
```
 
---
 
## 10. Row Level Security — the pattern applied to every tenant table
 
```sql
alter table reports enable row level security;
 
create policy "lab_isolation" on reports
  using (lab_id = (select lab_id from profiles where id = auth.uid()));
```
 
Same shape repeated for every table carrying `lab_id`. This is the concrete implementation of the multi-tenancy decision in `system-design.md` Section 5 — isolation enforced at the database layer, not just trusted to application code.
 
---
 
## 11. Open Question
 
- Should `panel_parameters.normal_range` support structured comparisons (e.g. `{min: 13.0, max: 17.0}`) instead of free text like `"13.0-17.0"`, to make the out-of-range check more reliable than string-parsing? Free text is simpler to seed and edit (matches how the reference-ranges doc is written) but requires parsing logic; structured is more robust but a stricter data-entry UI. Leaning toward structured (a `min`/`max`/`operator` jsonb shape) since the out-of-range flag is a real P0 feature, not cosmetic — but flagging this as your call before locking it, since it affects the Panel Manager's UI complexity too.
