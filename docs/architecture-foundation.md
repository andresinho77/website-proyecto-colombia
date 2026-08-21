# Architecture Foundation — Alojamiento Solidario Colombia

> Living document produced by an Early-Stage Architecture Guardian pass
> (`.claude/commands/architecture-guardian.md`), applied **retroactively**
> to an already-built MVP rather than at greenfield kickoff. Source of
> truth for *why the shape is what it is*; `ROADMAP.md` remains the source
> of truth for epic status and product direction. Reconcile this doc
> before more feature work stacks on top if the two drift.
>
> Last reviewed: 2026-08-21.

---

## 1. Journeys

### Actor: End user (anonymous, no auth — by deliberate MVP design)
- As someone with space available, I publish a listing (`ofrezco`) in under 60s, in order to offer temporary shelter.
- As someone needing shelter, I publish a listing (`necesito`) in under 60s, in order to signal my need.
- As a visitor, I browse active listings for a city/department/nationally, in order to find or offer shelter.
- As a visitor, I filter by tipo/zona/barrio/precio and sort, in order to narrow the feed.
- As a visitor, I reveal a listing's WhatsApp number on demand, in order to contact the poster (US-6.5 — deliberately NOT included in the public feed response).
- As the author of a listing, I mark it resolved via my PIN, in order to remove it once the need/offer is fulfilled.
- As a visitor, I report a listing, in order to flag abuse; 3 reports auto-hides it (`reportado`).
- As a visitor, I read the Habeas Data policy and request my data be forgotten, in order to exercise Ley 1581 rights (self-service via PIN, or email channel documented in `docs/DATA_POLICY.md`).
- As a visitor, I land on a broken/removed link, in order to be shown a clear 404/500 instead of a raw error (US-1.6).

### Actor: Admin (shared secret key — `x-admin-key` header, no per-admin identity)
- As an admin, I list all listings including reported/eliminated ones, in order to triage.
- As an admin, I change a listing's status (`activo`/`resuelto`/`reportado`/`eliminado`), in order to moderate.
- As an admin, I receive an SES email when a listing crosses the report threshold, in order to review within 24h (US-6.2, ✅ in `infra-proyecto-colombia`).
- *(Documented, not built)* As an admin, I receive a daily SES digest of active/resolved/reported counts per city (US-6.4).

### Actor: System / cron (none implemented yet)
- *(Documented, not built)* As a scheduled job, I purge/anonymize `eliminado` and expired listings per the 15/30/90-day retention policy (US-7.3) — **`docs/DATA_POLICY.md` promises this; no code enforces it yet.**

### Actor: Third-party integration
- None. No webhooks, no external API consumers, no payment/identity providers by design (see ROADMAP §7, "fuera de alcance del MVP").

---

## 2. Entities & Events

**One real entity: `Listing`.** No `User`/`Account` entity exists anywhere in the system — this is not an oversight, it's the MVP's core design bet (frictionless publish, no login). Confirmed this bet is carried consistently end to end: no user table, no session, no auth middleware for the public surface.

### Domain events (from the actual code, not invented)
- `ListingCreated` — `POST /listings`, generates a PIN server-side, `estado: activo`.
- `ListingReported` — `POST /listings/report`, increments `reportes`; at `reportes >= 3` fires `ListingAutoFlagged` → `estado: reportado` → triggers `ModerationAlertSent` (SES).
- `ListingResolvedByAuthor` — `POST /listings/resolve`, PIN-gated, `estado: resuelto`.
- `ListingContactRevealed` — `POST /listings/{id}/contact`, does NOT change `estado`; separate from the public feed response entirely (the US-6.5 fix).
- `ListingStatusChangedByAdmin` — `POST /listings/admin` (`action` = any status), no record of *who* (no admin identity) or *why*.

### Lifecycle (state machine, as actually implemented)
```
        create
          │
          ▼
      [activo] ──report x3──▶ [reportado] ──admin──▶ [activo|resuelto|eliminado]
          │                         │
     resolve(PIN)               admin
          │                         │
          ▼                         ▼
     [resuelto]               [eliminado]  (soft — see Open Question #1)
          │
        admin
          │
          ▼
      [eliminado]
```
- All 4 states reachable from admin directly (no admin-side guardrails on illegal transitions — e.g. admin can move `eliminado` back to `activo`; not necessarily wrong, but not a designed decision either, just "whatever the shared function allows").
- **No audit trail.** `estado` is overwritten in place — no history of who reported, when resolved, which admin changed what. Fine for MVP volume; would block any future abuse investigation or admin accountability ask.

---

## 3. Data Model

`Listing` (backend `src/types/listing.ts`, mirrored in frontend `lib/types.ts` — kept manually in sync, not code-generated from a shared schema):

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `tipo` | `'ofrezco' \| 'necesito'` | |
| `ciudad`, `ciudadSlug`, `departamento`, `departamentoSlug` | string | Denormalized location, not FK'd to a real Colombia-locations table on the backend |
| `zona` | string, required | Macro-zone (US-4.4) — **catalog lives ONLY in frontend `lib/zones.ts`, not backend-owned** (see Open Question #2) |
| `barrio` | string, optional | Free text, substring-filtered |
| `personas`, `fechaDesde`, `fechaHasta`, `precio`, `descripcion` | — | |
| `whatsapp` | string | Never returned by `GET /listings` (US-6.5); only via `POST /{id}/contact` |
| `imagenes` | string[] | S3 URLs via presigned upload |
| `pin` | string | Author-only; stripped from `AdminListItem` and the public feed |
| `creadoEn` | number (epoch) | |
| `estado` | `ListingStatus` (4 values) | Explicit lifecycle field — good, not inferred from other fields |
| `reportes` | number | |

**Explicit status field, not inferred** — matches the Guardian's Phase 3 preference. No premature normalization found (no separate `Address`/`Contact`/`Report` tables split out where a flat field would do).

---

## 4. API Contract (as implemented, `backend-proyecto-colombia/src/handlers/listings.ts`)

| Method | Path | Actor | Notes |
|---|---|---|---|
| GET | `/api/listings` | anyone | Filters: ciudad/departamento/tipo/zona/barrio/maxPrecio/limit/cursor. **No `sort` param** (US-4.8 gap — frontend has `sortBy` in `FilterState`, applies it client-side only). `whatsapp` masked/omitted. |
| POST | `/api/listings` | anyone | Create. Rate-limit via honeypot field + (per ROADMAP) API Gateway usage plan, not app code. |
| POST | `/api/listings/upload-url` | anyone | Presigned S3 upload URL. |
| POST | `/api/listings/report` | anyone | Increment `reportes`. |
| POST | `/api/listings/resolve` | listing author (PIN) | |
| POST | `/api/listings/{id}/contact` | anyone | Turnstile-gated (optional — never blocks if missing). |
| POST | `/api/listings/admin` | admin (shared key) | `action`: `list_all` \| `reveal_contact` \| status change. |

Grouped by resource + lifecycle-action verbs (`report`, `resolve`, `contact`), not one endpoint per UI screen — matches the Guardian's Phase 4 preference (CRUD + explicit transitions, not a resource-per-action explosion).

---

## 5. Route Map (frontend, `app/`)

| Route | Journey served |
|---|---|
| `/`, `/necesito`, `/ofrezco` | National feed, unified / necesito-only / ofrezco-only |
| `/departamento/[slug]`, `/departamento/[slug]/necesito`, `/.../ofrezco` | Same 3, department-scoped |
| `/[ciudad]`, `/[ciudad]/necesito`, `/[ciudad]/ofrezco` | Same 3, city-scoped |
| `/admin` | Admin triage |
| `/terminos-y-privacidad` | Habeas Data policy |
| `/not-found`, `/error` | 404 / 500 (US-1.6) |

**9 feed routes, 1 shared component** (`CityFeedPage`, parameterized by `intentTipo`/`isDepartmentFeed`/`isNationalFeed`). This is the correct shape per the Guardian's Phase 5 check — routes were derived from the journey axes (location level × browse intent), not invented because an endpoint existed, and no endpoint exists only because a route needed one. **No 1:1 route↔endpoint coupling found** — a real strength worth naming explicitly, not just an absence of a problem.

---

## 6. Open Questions / Assumptions

1. **`estado: eliminado` is soft-delete only — US-7.3 (purge job) doesn't exist yet.** `docs/DATA_POLICY.md` commits to 90-day deletion / 30-day anonymization; nothing enforces it. This is a live compliance gap, not a hypothetical one — flag as the single highest-priority backend/infra follow-up if Habeas Data audit risk matters before this is fixed.
2. **Who owns the zone catalog?** `lib/zones.ts` (frontend-only, `ROADMAP.md` US-4.4) is unvalidated-by-humans, frontend-hardcoded reference data that *should* be backend-owned (a `GET /zones` endpoint is drafted in `openapi.yaml` but not built). Until resolved, any future zone change requires a frontend deploy, and frontend/backend can silently drift on what a "valid zone" is.
3. **Sort is a second instance of the same pattern**: `FilterState.sortBy` exists and is applied client-side (`CityFeedPage`); backend has no `sort` param. Same "FE ships ahead of BE contract" move as zones. This looks like a deliberate, repeated team strategy (ship the FE stub, backfill BE later) rather than accidental drift — worth the team explicitly confirming it's still the intended default coordination mode, since it's now happened twice.
4. **No admin identity or audit trail.** A single shared `ADMIN_SECRET_KEY` authorizes all admin actions; there's no record of *which* admin changed *what*. Fine at current scale/trust level; would need to change before adding a second real admin or handling a disputed moderation decision.
5. **Admin state transitions are unconstrained.** Any `estado` can move to any other `estado` via the admin endpoint — no state-machine guard server-side. Likely fine (trusted single admin), but worth a conscious "yes, any transition is allowed" confirmation rather than an implicit one.

---

## 7. What this pass did NOT find (worth stating, per the Guardian's own tone guidance)

- No invented entities without a journey behind them — `Listing` is the only entity and every field traces to a real journey.
- No FE routes existing "because an endpoint exists" or vice versa — the 9-route/1-component shape is journey-derived, not accidental.
- No premature microservice/multi-table splitting — the flat `Listing` record with an explicit `estado` field is the right level of normalization for this scale.
- `ROADMAP.md` has stayed reasonably current with the schema/API (unlike the "journey doc untouched since kickoff, schema changed 5 times" failure mode this framework exists to catch) — it's been updated same-day as most of the changes reviewed in this pass.
