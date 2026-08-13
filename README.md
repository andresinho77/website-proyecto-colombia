# Alojamiento Solidario Colombia — Website Repository 🇨🇴⚡

React / Next.js 14 Web Application for **Alojamiento Solidario Colombia** (`website-proyecto-colombia`). Designed for survivors, volunteers, and citizens following the August 10, 2026 earthquake in Colombia (affecting Chocó, Pereira, Cali, Quibdó, Manizales, and Armenia).

For product direction, architecture, and epic progress check the [ROADMAP](/ROADMAP.md).

---

## 🌍 Environment Execution Guide

### 1. LOCAL Environment (Offline / LocalStack)

#### Option A: Built-in Mock Server (Zero Setup)
Runs Next.js frontend with emergency local fallback data & browser `localStorage` PIN resolution:
```bash
cd website-proyecto-colombia
npm run dev
```
Open **`http://localhost:3000`** in your browser.

#### Option B: Local API Server (Zero Docker)
Terminal 1 (Local Serverless API):
```bash
npm run dev:api
```
Terminal 2 (Frontend connected to Local API):
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000/api/listings" npm run dev
```

---

### 2. DEV Environment (Wired to Deployed Infrastructure / LocalStack)

To connect the React website to your deployed API Gateway endpoint (from LocalStack or AWS Sandbox):

#### Step 1: Get Deployed API Gateway Endpoint
Run `terraform output api_gateway_endpoint` inside `infra-proyecto-colombia`:
```bash
cd infra-proyecto-colombia
terraform output api_gateway_endpoint
```

#### Step 2: Run Website in DEV Mode
Pass the `api_gateway_endpoint` to the Next.js dev server:
```bash
cd website-proyecto-colombia

# Example with LocalStack / AWS Dev endpoint:
NEXT_PUBLIC_API_URL="https://nvlknrj2k9.execute-api.us-east-1.amazonaws.com/api/listings" npm run dev
```
Open **`http://localhost:3000`** (or `http://localhost:3001`).

#### Step 3: Build Static HTML Bundle for DEV
```bash
NEXT_PUBLIC_API_URL="https://dev-api.alojamientosolidario.co/api/listings" npm run build
```

---

### 3. PROD Environment (AWS Production)

To compile the production static HTML bundle targeting **PROD** (`alojamientosolidario.co`):

```bash
NEXT_PUBLIC_API_URL="https://api.alojamientosolidario.co/api/listings" npm run build
```
Static bundle will be output to `out/` ready for sync to S3 web bucket `proyecto-colombia-prod-web-hosting`.

---

## 🛠️ Tech Stack & Prerequisites

- **Framework**: Next.js 14 React Framework (`output: 'export'`)
- **Runtime**: **Node.js 24.x** (`engines: { "node": ">=24.0.0" }`)
- **Styling**: Tailwind CSS + Glassmorphism design system
- **Icons**: Lucide React
- **Uploads**: Direct browser-to-S3 photo uploads via pre-signed URLs (up to 3 photos per listing)
- **Security**: Cloudflare Turnstile CAPTCHA + Hidden Honeypot trap (`b_hp_fax`)
