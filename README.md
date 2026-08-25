# Vecinos Héroes — Website Repository 🇨🇴⚡

React / Next.js 14 Web Application for **Vecinos Héroes** (`website-proyecto-colombia`). Designed for survivors, volunteers, and citizens following the August 10, 2026 earthquake in Colombia (affecting Chocó, Pereira, Cali, Quibdó, Manizales, and Armenia).

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
| 3 | `npm run test` | `vitest run` — render tests of the landing and the feed (jsdom + Testing Library) |
| 4 | `npm run build:local` | `next build` against the local API endpoint — produces the static export in `out/` |

Shortcut that also reinstalls dependencies from the lockfile:

```bash
npm run validate:clean   # npm ci && npm run validate
```

### Tests

Suites live in `tests/` and are configured by `vitest.config.mts` (jsdom, `tests/setup.ts`,
`include: tests/**/*.test.{ts,tsx}`). Shared data lives in `tests/fixtures/`, deliberately separate
from the demo `MOCK_LISTINGS` of `lib/api.ts` so that changing demo data cannot break the gate.

```bash
npm run test              # single run (what validate and CI execute)
npx vitest                # watch mode while developing
```

Network is never hit: the landing suite mocks `fetchListings`, and the feed suite renders
`ListingGrid` with props. `npm run test:e2e` (Playwright) is a separate track and is **not** part of
`npm run validate`.

`.github/workflows/frontend-ci.yml` runs the same four checks on push/PR to `main` and `dev`, then uploads `out/` as the `static-export` artifact consumed by `infra-proyecto-colombia`. If `npm run validate` is green locally, CI should be green too.

---

## 📜 OpenAPI 3.0.3 API Contract
The canonical API contract expected and implemented by this frontend client is defined and maintained in [`backend-proyecto-colombia/openapi.yaml`](../backend-proyecto-colombia/openapi.yaml) (interactive docs available at `http://localhost:4000/docs`).

---

## 🔑 `NEXT_PUBLIC_API_URL` contract

The frontend talks to the backend **only** through this variable (resolved once in `lib/api.ts` and reused by `app/admin/page.tsx`):

| Context | Behavior |
|---|---|
| Variable set | Used as-is (trailing slashes trimmed). |
| `npm run dev` without it | Deliberate local-safe fallback to `http://localhost:4000/api/listings` (the `backend-proyecto-colombia` Fastify server). It never falls back to production, so a local run cannot write real data by accident. |
| `npm run build` without it | **Build fails** with explicit instructions. The value is inlined into the static bundle, so a deployable artifact must never point at a guessed endpoint. |
| `npm run validate` / `build:local` | Injects the local endpoint unless a value is already exported in the shell. |
| CI | Uses the `NEXT_PUBLIC_API_URL` repository variable. If it is unset, CI logs a warning and falls back to the production endpoint so the artifact stays deployable. |
| Deploy to **prod** | Uses `NEXT_PUBLIC_API_URL`; if unset, falls back to `.env.production`, which already points at the production API Gateway. |
| Deploy to **staging** | Uses `NEXT_PUBLIC_API_URL_STAGING`. **There is no fallback** — the deploy fails if it is unset, because `.env.production` points at prod and a silent fallback would publish a staging frontend that reads and writes the production database. |

---

## 🌍 Environment Execution Guide

### 1. LOCAL Environment (LocalStack & Full Serverless Stack)

#### Option A: 1-Command Full-Stack Dev (Recommended 🚀)
Runs the entire local stack in a single automated step:
1. Verifies that **Docker** is active and ensures the **LocalStack** container (`proyecto-colombia-localstack`) is running on port `4566`.
2. Applies the **Terraform** local infrastructure (`environments/local.tfvars`, `use_localstack=true`).
3. Seeds realistic sample disaster-relief listings into LocalStack DynamoDB via `backend-proyecto-colombia`.
4. Launches the Fastify TypeScript API server on port `4000`.
5. Launches the **Next.js** dev server on **`http://localhost:3000`** with hot-reload.

```bash
npm run dev:local
```
Open **`http://localhost:3000`** in your browser. All listings, publications, reports, and PIN resolution will interact directly with your local DynamoDB table!

---

#### Option B: Dedicated Backend Dev Runner
Run the backend and database independently in one terminal, and Next.js in another:

**Terminal 1 (Backend API & LocalStack):**
```bash
cd ../backend-proyecto-colombia
npm run dev:all
```

**Terminal 2 (Next.js Frontend):**
```bash
cd website-proyecto-colombia
npm run dev
```

---

#### Option C: Offline Client-Only Mock Mode (Zero Docker)
Runs the Next.js frontend with emergency local fallback data & browser `localStorage` PIN resolution:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser. Without `NEXT_PUBLIC_API_URL` the client points at `http://localhost:4000/api/listings`; if nothing is listening there, `lib/api.ts` serves its in-memory emergency mock listings.

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
NEXT_PUBLIC_API_URL="<the dev API Gateway endpoint>/api/listings" npm run build
```

> [!NOTE]
> Use the raw `*.execute-api.us-east-1.amazonaws.com` endpoint from
> `terraform output api_gateway_endpoint`. The custom domain `dev-api.vecinosheroes.com`
> is **planned and does not resolve** — see
> `infra-proyecto-colombia/docs/DNS_GODADDY_RUNBOOK.md`.

---

### 3. STAGING Environment (AWS Pre-Production)

Staging is a full replica of production in the same AWS account, provisioned by `infra-proyecto-colombia` and separated by resource prefix and tags.

To compile a static bundle targeting **STAGING**:

```bash
# Endpoint comes from the staging Terraform state, not from prod's
cd ../infra-proyecto-colombia
terraform init -reconfigure -backend-config=backend/staging.hcl
terraform output api_gateway_endpoint

cd ../website-proyecto-colombia
NEXT_PUBLIC_API_URL="<the endpoint printed above>" npm run build
```

The bundle is written to `out/`, ready to sync to `proyecto-colombia-staging-web-hosting`.

---

### 4. PROD Environment (AWS Production)

To compile the production static bundle targeting **PROD** (`www.vecinosheroes.com`):

```bash
NEXT_PUBLIC_API_URL="https://s1kxeu5lol.execute-api.us-east-1.amazonaws.com/api/listings" npm run build
```

> [!IMPORTANT]
> This is the **real** prod endpoint, and it is what `.env.production` already uses. The
> custom domain `api.vecinosheroes.com` does not exist: `apigateway.tf` declares no
> `aws_apigatewayv2_domain_name`. Do not substitute it here until that resource is
> applied and its GoDaddy CNAME is published — see
> `infra-proyecto-colombia/docs/DNS_GODADDY_RUNBOOK.md`.
The bundle is written to `out/`, ready to sync to the S3 web bucket `proyecto-colombia-prod-web-hosting`.

---

## 🚀 Deployment (`.github/workflows/deploy.yml`)

### Branch promotion flow

```
feature/* ──PR──▶ dev ──PR──▶ staging ──PR──▶ main
                               │               │
                               ▼               ▼
              proyecto-colombia-staging-    proyecto-colombia-prod-
                    web-hosting                 web-hosting
              (Environment=staging)         (Environment=prod)
```

| Event | What runs | Touches AWS? |
|---|---|---|
| PR opened/updated against `staging` | `frontend-ci.yml` — typecheck, lint, tests, build | No |
| PR **merged** into `staging` (push) | `deploy.yml` → staging bucket + staging CloudFront | ✅ Writes |
| PR **merged** into `main` (push) | `deploy.yml` → prod bucket + prod CloudFront | ✅ Writes |

An open PR never deploys. The deploy happens on the push produced by merging it.

### How the target environment is resolved

The workflow derives everything from the branch (or from the `environment` input on a manual run):

| | STAGING | PROD |
|---|---|---|
| S3 bucket | `proyecto-colombia-staging-web-hosting` | `proyecto-colombia-prod-web-hosting` |
| CloudFront | discovered by its `Environment=staging` tag, or `CLOUDFRONT_DISTRIBUTION_ID_STAGING` | `E3LIQPKLMQ5LGY` |
| API URL | `NEXT_PUBLIC_API_URL_STAGING` (required) | `NEXT_PUBLIC_API_URL` (falls back to `.env.production`) |
| OIDC role | `AWS_ROLE_ARN_STAGING` | `AWS_ROLE_ARN_PROD` |

The staging distribution is looked up by tag rather than hardcoded, because its ID is not known until Terraform creates it and would change if the environment were ever rebuilt.

### The tag guard

`s3 sync --delete` is destructive and irreversible. Before the first sync, the workflow reads the target bucket's tags and aborts on mismatch:

```bash
aws s3api get-bucket-tagging --bucket <bucket> \
  --query 'TagSet[?Key==`Environment`].Value | [0]'
# must equal "staging" when deploying staging, "prod" when deploying prod
```

Terraform sets that tag on every resource. A missing tag means the environment has not been provisioned — apply `infra-proyecto-colombia` for that environment first.

### Required repository settings

Configure in **Settings &rarr; Secrets and variables &rarr; Actions**:

| Name | Kind | Purpose |
|---|---|---|
| `AWS_ROLE_ARN_PROD` | Secret | OIDC role for production deploys |
| `AWS_ROLE_ARN_STAGING` | Secret | OIDC role for staging deploys |
| `NEXT_PUBLIC_API_URL` | Variable | Production API endpoint (optional; `.env.production` is the fallback) |
| `NEXT_PUBLIC_API_URL_STAGING` | Variable | Staging API endpoint — **required**, from `terraform output api_gateway_endpoint` on the staging state |
| `CLOUDFRONT_DISTRIBUTION_ID_STAGING` | Variable | Optional. Skips the tag lookup for the staging distribution |

---

## ⚙️ Environment Variables Reference

| Variable Name | Description | Example (Local) | Example (Production) |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base HTTP endpoint for listings API | `http://localhost:4000/api/listings` | `https://s1kxeu5lol.execute-api.us-east-1.amazonaws.com/api/listings` |
| `NEXT_PUBLIC_API_URL_STAGING` | Staging listings API endpoint. CI/CD only — read as a repository variable by `deploy.yml`, never at build time locally | — | `https://<staging-api-id>.execute-api.us-east-1.amazonaws.com/api/listings` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile CAPTCHA public site key | `1x00000000000000000000AA` *(Always passes)* | `0x4AAAAAA...` *(Live key)* |

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev:local` | `bash scripts/start-local-dev.sh` | **1-Command local full-stack dev** (Docker + Terraform + Seed + API + Next.js) |
| `npm run dev` | `next dev` | Start standard Next.js dev server on `http://localhost:3000` |
| `npm run dev:api` | `node scripts/local-server.mjs` | Start local serverless API server on `http://localhost:4000` |
| `npm run validate` | `npm run typecheck && npm run lint && npm run test && npm run build:local` | Run complete local CI gate sequence |
| `npm run validate:clean` | `npm ci && npm run validate` | Clean install dependencies from lockfile and validate |
| `npm run typecheck` | `tsc --noEmit` | Check TypeScript types across project |
| `npm run lint` | `next lint --max-warnings=0` | Run ESLint with zero-warning threshold |
| `npm run build` | `next build` | Compile static production export to `out/` directory |
| `npm run build:local` | `NEXT_PUBLIC_API_URL="..." next build` | Compile static bundle against local API endpoint |
| `npm test` | `vitest run` | Execute unit test suite with Vitest |
| `npm run test:e2e` | `playwright test` | Execute end-to-end browser tests with Playwright |

---

## 🛠️ Tech Stack & Prerequisites

- **Framework**: Next.js 14 React Framework (`output: 'export'`)
- **Runtime**: **Node.js 24.x** (pinned in `.nvmrc`; `engines` allows `>=20.0.0`)
- **Styling**: Tailwind CSS + Glassmorphism design system
- **Icons**: Lucide React
- **Uploads**: Direct browser-to-S3 photo uploads via pre-signed URLs (up to 3 photos per listing)
- **Security**: Cloudflare Turnstile CAPTCHA + Hidden Honeypot trap (`b_hp_fax`)

