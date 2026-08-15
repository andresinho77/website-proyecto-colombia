# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-08-13

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->
- User wants `ROADMAP.md` to be the single source of truth for feature status and future direction.
- User prefers `README.md` to stay focused on basic project information and setup, not epic-by-epic status.
- User wants both documentation domains reconciled together: product/engineering docs and OpenWolf process docs.
- [2026-08-14] User prefers **local-first validation**: one deterministic command (`npm run validate`) that mirrors CI exactly, instead of preview/staging environments. "Everything should be validated through local workflow parity with CI."
- [2026-08-14] User expects explicit, intentional env handling — no silent defaults that could point local runs at production.
- User expects the OpenWolf protocol run *first* (STATUS → anatomy → cerebrum → buglog) before any edit, and housekeeping (STATUS/anatomy/memory/buglog) after.

## Key Learnings

- [2026-08-14] **Validation contract:** `npm run validate` = typecheck → lint → test → build:local. CI (`frontend-ci.yml`) runs the same four checks as separate steps. Never add a CI check that has no local equivalent.
- [2026-08-14] `next build` inlines `NEXT_PUBLIC_API_URL` at build time. `lib/api.ts` therefore throws when it is missing in a production build (fail fast) and falls back to `http://localhost:4000/api/listings` only in dev. `app/admin/page.tsx` imports `API_BASE_URL` from `lib/api.ts` — do not re-declare it.
- [2026-08-14] Node version is pinned in `.nvmrc` (24) and consumed by CI via `node-version-file`; `engines` allows >=20.
- [2026-08-15] **Test layout:** suites live in `tests/` (not `__tests__/`, not co-located), config is `vitest.config.mts`, shared data in `tests/fixtures/`. `globals: false` — import `describe/it/expect/vi` explicitly from `vitest`; adding a `types` array to `tsconfig.json` would have restricted ambient types, so jest-dom matcher types come from importing `@testing-library/jest-dom/vitest` in `tests/setup.ts`. Playwright (`tests/e2e/`, `npm run test:e2e`) is excluded from the vitest run and is not part of `validate`.
- [2026-08-15] Rendering any component that pulls in `next/link` (Navbar, Footer, and therefore the landing) needs an `IntersectionObserver` stub in jsdom — Link uses it for prefetch. It is stubbed globally in `tests/setup.ts`.
- [2026-08-15] `ListingCard` wraps `listing.descripcion` in typographic quotes (`&ldquo;…&rdquo;`) inside a single `<p>`, so `getByText(description)` fails on an exact match. Use `{ exact: false }`.
- [2026-08-15] `tsconfig.json` includes `**/*.ts(x)`, so `tests/` is type-checked by both `npm run typecheck` and `next build`. A type error in a test breaks the build, not just the test step.
- **Project:** website-proyecto-colombia
- **Description:** React / Next.js 14 Web Application for **Alojamiento Solidario Colombia** (`website-proyecto-colombia`). Designed for survivors, volunteers, and citizens following the August 10, 2026 earthquake in Co

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->
- [2026-08-13] No usar `openwolf scan --check` directo en CI para `anatomy.md` porque siempre deriva por `Last scanned`. Normalizar/ignorar ese campo y alertar solo cuando haya drift estructural real.
- [2026-08-13] Evitar `concurrency.group` global para CI+deploy de Pages; usar grupo por ref para CI y grupo dedicado para deploy a `main` para evitar cancelaciones cruzadas. (Histórico: el deploy de Pages se eliminó el 2026-08-14; ver Decision Log.)

- [2026-08-14] No declarar scripts de validación sin su configuración: `next lint` sin `.eslintrc*` abre un wizard interactivo y cuelga runners no interactivos; `vitest run` sin suites sale con código 1. Verificar que cada script del contrato corre limpio en no-TTY antes de meterlo en `validate`/CI.
- [2026-08-15] No nombrar la config de Vitest `vitest.config.ts` en este repo: el `package.json` no declara `"type": "module"`, así que Vite la carga como CJS y advierte por sintaxis ESM en cada corrida. Usar `.mts` y `fileURLToPath(new URL('./', import.meta.url))` en vez de `__dirname` (que también dispara warning bajo `configLoader: 'native'`).
- [2026-08-15] `npm ci` verde en macOS **no** garantiza `npm ci` verde en el runner linux. Cuando se agrega una devDep que arrastra binarios nativos o fallbacks wasm (vite 8/rolldown, `@unrs/resolver`, `@emnapi/*`), npm actualizando el lockfile de forma incremental puede omitir entradas top-level que linux sí necesita → `EUSAGE ... Missing: X from lock file`. Regenerar el lockfile limpio (`rm -rf node_modules package-lock.json && npm install`) y, si hay dudas, verificar con `docker run --rm -v <dir>:/app -w /app node:24 npm ci` sobre una copia de `package.json` + `package-lock.json` (nunca sobre el repo montado: `npm ci` borraría el `node_modules` local).
- [2026-08-15] No dar por bueno un gate de tests solo porque las suites pasan: verificar además que un test en rojo hace fallar la cadena (canario temporal, borrar después). Un `include` mal escrito deja el paso verde sin correr nada.
- [2026-08-14] Antes de dar por buena una regeneración de `anatomy.md`, revisar el conteo de archivos: artefactos locales (`out/`, `*.tsbuildinfo`, `settings.local.json`) no existen en CI y provocan drift falso. Excluirlos en `.wolf/config.json`.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
- [2026-08-14] **Sin ambiente de preview/staging del frontend.** La garantía de calidad se basa en paridad local ↔ CI: `npm run validate` corre exactamente los checks que CI exige. Alternativa descartada: ramas/environments de preview (costo de mantenimiento durante crisis activa, y nada que desplegar ahí porque la entrega productiva la opera infra). `US-8.2` queda `⏸️ aplazado`, no eliminado.
- [2026-08-14] **`NEXT_PUBLIC_API_URL` estricta en build, permisiva en dev.** Un default silencioso a producción en `lib/api.ts` significaba que `npm run dev` podía escribir datos reales; y un artefacto construido sin la variable apuntaría a un endpoint adivinado. Se movió ese default de producción al workflow de CI (visible, con `::warning`), y el código falla rápido en build.
- [2026-08-14] GitHub Pages approach removed entirely (workflow `deploy-pages` job + Pages artifact, ROADMAP references). Supersedes the 2026-08-13 dual-path decision. Entrega única: este repo hace build/type-check y expone el artefacto estático `out/`; el despliegue productivo (S3/CloudFront) lo hace `infra-proyecto-colombia`. `output: 'export'` en `next.config.mjs` se mantiene porque produce ese artefacto.
- [2026-08-13] ~~Delivery split: this repo publishes a permanent public mock on GitHub Pages~~ — superseded 2026-08-14 (GitHub Pages removed). Production deployment path (S3/CloudFront and infra automation) is owned by `infra-proyecto-colombia`.
- [2026-08-13] Documentation governance formalized: when docs disagree, `ROADMAP.md` prevails until reconciliation.
