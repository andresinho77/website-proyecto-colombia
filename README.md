# Alojamiento Solidario Colombia — Website Repository 🇨🇴⚡

React / Next.js 14 Web Application for **Alojamiento Solidario Colombia** (`website-proyecto-colombia`). Designed for survivors, volunteers, and citizens following the August 10, 2026 earthquake in Colombia (affecting Chocó, Pereira, Cali, Quibdó, Manizales, and Armenia).

For product direction, architecture, and epic progress check the [ROADMAP](/ROADMAP.md).

---

## ✅ Local Validation (run this before every push)

There is **no preview or staging environment**. Everything is validated locally, and CI runs the same checks. From a clean clone:

```bash
nvm use            # Node 24 (pinned in .nvmrc); minimum supported is Node 20
npm ci
npm run validate
```

`npm run validate` runs, in this exact order — it stops at the first failure:

| Step | Command | What it enforces |
|---|---|---|
| 1 | `npm run typecheck` | `tsc --noEmit` — no TypeScript errors |
| 2 | `npm run lint` | `next lint --max-warnings=0` — zero ESLint warnings/errors |
| 3 | `npm run test` | `vitest run --passWithNoTests` — unit tests (no suites yet; the gate is wired for when they land) |
| 4 | `npm run build:local` | `next build` against the local API endpoint — produces the static export in `out/` |

Shortcut that also reinstalls dependencies from the lockfile:

```bash
npm run validate:clean   # npm ci && npm run validate
```

`.github/workflows/frontend-ci.yml` runs the same four checks on push/PR to `main` and `dev`, then uploads `out/` as the `static-export` artifact consumed by `infra-proyecto-colombia`. If `npm run validate` is green locally, CI should be green too.

---

## 🔑 `NEXT_PUBLIC_API_URL` contract

The frontend talks to the backend **only** through this variable (resolved once in `lib/api.ts` and reused by `app/admin/page.tsx`):

| Context | Behavior |
|---|---|
| Variable set | Used as-is (trailing slashes trimmed). |
| `npm run dev` without it | Deliberate local-safe fallback to `http://localhost:4000/api/listings` (the `npm run dev:api` mock server). It never falls back to production, so a local run cannot write real data by accident. |
| `npm run build` without it | **Build fails** with explicit instructions. The value is inlined into the static bundle, so a deployable artifact must never point at a guessed endpoint. |
| `npm run validate` / `build:local` | Injects the local endpoint unless a value is already exported in the shell. |
| CI | Uses the `NEXT_PUBLIC_API_URL` repository variable. If it is unset, CI logs a warning and falls back to the production endpoint so the artifact stays deployable. |

---

## 🌍 Environment Execution Guide

### 1. LOCAL Environment (Offline / LocalStack)

#### Option A: Built-in Mock Server (Zero Setup)
Runs the Next.js frontend with emergency local fallback data & browser `localStorage` PIN resolution:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser. Without `NEXT_PUBLIC_API_URL` the client points at `http://localhost:4000/api/listings`; if nothing is listening there, `lib/api.ts` serves its in-memory emergency mock listings.

#### Option B: Local API Server (Zero Docker)
Terminal 1 (Local Serverless API):
```bash
npm run dev:api
```
Terminal 2 (Frontend connected to the Local API):
```bash
npm run dev
```
The default endpoint already matches `dev:api`. To point at a different local port:
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000/api/listings" npm run dev
```

---

### 2. DEV Environment (Wired to Deployed Infrastructure / LocalStack)

To connect the website to a deployed API Gateway endpoint (LocalStack or AWS Sandbox):

#### Step 1: Get the Deployed API Gateway Endpoint
Run `terraform output api_gateway_endpoint` inside `infra-proyecto-colombia`:
```bash
cd infra-proyecto-colombia
terraform output api_gateway_endpoint
```

#### Step 2: Run the Website Against It
```bash
NEXT_PUBLIC_API_URL="https://nvlknrj2k9.execute-api.us-east-1.amazonaws.com/api/listings" npm run dev
```
Open **`http://localhost:3000`** (or `http://localhost:3001`).

#### Step 3: Build a Static Bundle Against It
```bash
NEXT_PUBLIC_API_URL="https://dev-api.alojamientosolidario.co/api/listings" npm run build
```

---

### 3. PROD Environment (AWS Production)

To compile the production static bundle targeting **PROD** (`alojamientosolidario.co`):

```bash
NEXT_PUBLIC_API_URL="https://api.alojamientosolidario.co/api/listings" npm run build
```
The bundle is written to `out/`, ready to sync to the S3 web bucket `proyecto-colombia-prod-web-hosting`. The production deploy itself is owned by `infra-proyecto-colombia` — this repo only produces and validates the artifact.

---

## 🛠️ Tech Stack & Prerequisites

- **Framework**: Next.js 14 React Framework (`output: 'export'`)
- **Runtime**: **Node.js 24.x** (pinned in `.nvmrc`; `engines` allows `>=20.0.0`)
- **Styling**: Tailwind CSS + Glassmorphism design system
- **Icons**: Lucide React
- **Uploads**: Direct browser-to-S3 photo uploads via pre-signed URLs (up to 3 photos per listing)
- **Security**: Cloudflare Turnstile CAPTCHA + Hidden Honeypot trap (`b_hp_fax`)
