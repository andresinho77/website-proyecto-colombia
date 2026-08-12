# Alojamiento Solidario Colombia — Website Repository 🇨🇴⚡

React / Next.js 14 Web Application for **Alojamiento Solidario Colombia** (`website-proyecto-colombia`). Designed for survivors, volunteers, and citizens following the August 10, 2026 earthquake in Colombia (affecting Chocó, Pereira, Cali, Quibdó, Manizales, and Armenia).

---

## ⚡ Agile Epics & User Stories Implemented

- **Épica 1 (Landing y Navegación)**: US-1.1 (hero con dos CTA claramente distintos: uno abre el feed para ver alojamientos disponibles y otro abre el formulario de publicación) & US-1.2 (persistent header navigation).
- **Épica 2 (Publicar Oferta "Tengo")**: US-2.1 (<60s publication form with E.164 +57 WhatsApp validation, Ley 1581 Habeas Data consent) & US-2.2 (WhatsApp share modal).
- **Épica 3 (Publicar Solicitud "Necesito")**: US-3.1 (Symmetrical <60s request form).
- **Épica 4 (Feed y Búsqueda)**: US-4.1 & US-4.2 (Feed sorted newest first, filters for highlighted cities Pereira/Cali/Quibdó/Manizales/Armenia, free-text barrio, and price range including "$0 / Gratis").
- **Épica 5 (Contacto)**: US-5.1 (Direct `wa.me/+57...` WhatsApp button with pre-filled listing reference).
- **Épica 6 (Moderación y Seguridad)**: US-6.1 (Report button; auto-hides listing at 3 reports), US-6.2 (`/admin` moderation panel), and US-6.3 ("Marcar como resuelta" via auto-generated 4-digit PIN stored in device `localStorage`).

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
