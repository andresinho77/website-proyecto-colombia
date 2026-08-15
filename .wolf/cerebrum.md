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
- [2026-08-15] `lib/api.ts`'s mock/offline fallback (used whenever `fetch` throws, which includes `next dev` without `dev:api` running) must independently enforce the same public-feed contract the real API is expected to apply: `estado === 'activo'` only, `creadoEn` descending, and PIN validation on resolve. It's easy to add a feature to only one of the two code paths (API success vs. catch block) since they look similar; check both whenever touching `fetchListings`/`reportListing`/`resolveListing`.
- [2026-08-15] Modals driven by an `isOpen` boolean prop (PublishModal, ShareModal, PrivacyPolicyModal pattern) are rendered unconditionally by the parent and just `return null` while closed — the component instance never unmounts, so `useState(propValue)` only captures the prop once. Any prop meant to reset on every open (e.g. `defaultTipo`) needs a `useEffect` keyed on `isOpen` (see PublishModal), not a `useState` initializer.
- [2026-08-15] No `openwolf` CLI binary in PATH in this environment (`openwolf scan` / `openwolf designqc` fail with "not found"). When the SessionStart hook flags anatomy.md as possibly stale, verify by reading the actual target files directly instead of relying on scan output.
- [2026-08-16] `components/PrivacyPolicyModal.tsx` and `app/terminos-y-privacidad/page.tsx` are two independent copies of the same legal content (modal for quick consent, full page for `/terminos-y-privacidad`) — they must be edited together or they drift out of sync. Before trusting either one's claims about what data is collected, grep the actual form (`components/PublishModal.tsx`, `lib/types.ts` `CreateListingInput`) rather than the policy prose itself, since policy text is hand-written and not derived from the schema.
- [2026-08-16] The documented data-request channel (`docs/DATA_POLICY.md`) is a placeholder email `pendiente-definir@alojamientosolidario.co` with a real SLA (24h ack / 5 business days resolution) attached. When surfacing it in user-facing copy, show it honestly labeled as "en proceso de habilitación" rather than hiding the TBD status or fabricating a different-looking real address — and always lead with the self-service PIN-based resolve/retire flow, which works today with no backend dependency.
- [2026-08-16] `app/admin/page.tsx` calls `POST ${API_BASE_URL}/admin` (list_all + per-status actions, `x-admin-key` header) but `openapi.yaml` only documents `/listings`, `/listings/report`, `/listings/resolve`, `/listings/upload-url` — `/admin` has never been in the contract. This is pre-existing, not something introduced recently. Don't silently "fix" this by editing openapi.yaml on an unrelated task; it needs an explicit decision (flag it to the user or wait to be asked) since documenting it is effectively defining the contract, not just describing it.
- [2026-08-16] Real admin authentication is explicitly deferred to "Fase 2" in `ROADMAP.md` section 10 ("Panel de administración con autenticación real... si el volumen de reportes lo justifica"). The two hardcoded demo keys (`colombia2026admin`, `admin`) in `app/admin/page.tsx` are intentional for the MVP, not a bug — don't "harden" them unless asked.
- [2026-08-16] `lib/api.ts`'s `MOCK_LISTINGS` module array is the single shared offline data store for the whole app within a browser tab session (public feed, PublishModal's created listings, and now the admin panel all read/mutate the same array). This is a feature, not a coincidence: admin actions taken offline via `setAdminListingStatus` actually change what `fetchListings` shows on the public feed in the same tab. Keep new offline-fallback code pointed at this same array rather than inventing a parallel one.
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
