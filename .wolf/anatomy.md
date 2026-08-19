# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-14T22:09:03.677Z
> Files: 48 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.eslintrc.json` — ESLint configuration (~33 tok)
- `.gitignore` — Git ignore rules (~244 tok)
- `.nvmrc` (~1 tok)
- `AGENTS.md` — OpenWolf (~68 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `GEMINI.md` — OpenWolf (~68 tok)
- `next-env.d.ts` — / <reference types="next" /> (~66 tok)
- `next.config.mjs` — Next.js configuration (~54 tok)
- `openapi.yaml` — API contract snapshot for frontend/backend integration; now includes proposed `GET /zones` (`ZonesResponse`) and `zona`/`barrio` split on `Listing`/`CreateListingInput` (US-4.4), plus proposed `POST /listings/{id}/contact` (`ContactListingRequest`/`Response`) + a note that `GET /listings` shouldn't return raw `whatsapp` (US-6.5) — both drafted 2026-08-17/18 to align with infra colleague, not yet backend-confirmed (~610 tok)
- `package-lock.json` — npm lock file (~82487 tok)
- `package.json` — Node.js package manifest (~398 tok)
- `postcss.config.mjs` — Declares config (~42 tok)
- `README.md` — Project documentation (~1432 tok)
- `ROADMAP.md` — Refugio Temporal — Plataforma de Alojamiento de Emergencia (~5479 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~221 tok)
- `tsconfig.json` — TypeScript configuration (~171 tok)
- `vitest.config.mts` — Configuración del paso 3 del contrato de validación (`npm run validate`). (~321 tok)

## .claude/

- `settings.json` (~514 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .github/workflows/

- `frontend-ci.yml` — CI: "Frontend Next.js CI/CD Pipeline" (~788 tok)

## app/

- `globals.css` — Styles: 9 rules, 1 layers (~261 tok)
- `layout.tsx` — metadata (~238 tok)
- `page.tsx` — Home — uses useState, useCallback, useEffect (~1342 tok)
  - fn `Home` L16-143 (~1140 tok)

## app/admin/

- `page.tsx` — AdminPage — renders form — uses useState, useCallback, useMemo; reusable `loadListings` (login + manual refresh, via `fetchAdminListings`), 4 explicit status actions incl. `reportado`, `sortForTriage` (reportado → reportes desc → newest), status filter row with live counts, offline/demo banner (~3200 tok)
  - fn `AdminPage` L8-296 (~3100 tok)

## app/terminos-y-privacidad/

- `page.tsx` — TerminosYPrivacidadPage; data collected/purpose/15-30-90 retention/deletion channel, matches PrivacyPolicyModal.tsx content (no "Nombre" field, US-7.1) (~1096 tok)
  - fn `TerminosYPrivacidadPage` L7-88 (~1030 tok)

## components/

- `EmergencyBanner.tsx` — EmergencyBanner (~523 tok)
- `Footer.tsx` — Footer; OFFICIAL_CHANNELS array renders external links to Cruz Roja Colombiana, UNGRD, gov.co (alcaldías) with target=_blank rel=noopener noreferrer (~750 tok)
  - section `FooterProps` L7-79 (~612 tok)
- `HeroButtons.tsx` — HeroButtons (~1094 tok)
  - section `HeroButtonsProps` L6-71 (~1068 tok)
- `ImageUploader.tsx` — ImageUploader — uses useState (~1238 tok)
  - section `ImageUploaderProps` L7-131 (~1184 tok)
- `ListingCard.tsx` — ListingCard — renders form, map — uses useState; one-line anti-fraud reinforcement under the WhatsApp button; "Contactar" is now a button calling `getContactLink` (US-6.5 reveal-on-click, Turnstile-token-optional) instead of a static `wa.me` href; opens a blank tab synchronously (no noopener/noreferrer — needs the reference) then redirects it once the number resolves, to survive popup blockers (bug-013) (~3470 tok)
  - section `ListingCardProps` L21-305 (~3250 tok)
- `ListingGrid.tsx` — ListingGrid; threads `turnstileToken`/`onTurnstileConsumed` down to each `ListingCard` (US-6.5) (~762 tok)
  - section `ListingGridProps` L8-83 (~713 tok)
- `Navbar.tsx` — Navbar (~854 tok)
  - section `NavbarProps` L7-68 (~809 tok)
- `PrivacyPolicyModal.tsx` — PrivacyPolicyModal; data collected/purpose/15-30-90 retention/deletion channel, matches terminos-y-privacidad/page.tsx content (no "Nombre" field, US-7.1) (~1250 tok)
  - section `PrivacyPolicyModalProps` L6-93 (~1040 tok)
- `PublishModal.tsx` — CITIES — renders form — uses useState, useEffect; resets the full form (incl. `tipo` from `defaultTipo`) on every open since the component never unmounts; mandatory anti-fraud warning banner below the header (~4050 tok)
  - section `PublishModalProps` L10-375 (~3670 tok)
- `SearchFilters.tsx` — CITIES — renders map (~1642 tok)
  - section `SearchFiltersProps` L7-145 (~1595 tok)
- `ShareModal.tsx` — ShareModal (~1057 tok)
  - section `ShareModalProps` L7-94 (~1010 tok)
- `Turnstile.tsx` — US-6.5: `useInvisibleTurnstile()` hook (loads Cloudflare script once, renders one invisible widget, exposes `{ token, containerRef, refresh }`) + `TurnstileContainer`; degrades to `token: null` gracefully if unset/blocked — callers must never block on it (~900 tok)

## docs/

- `DATA_POLICY.md` — DATA_POLICY (~467 tok)
- `SAFETY.md` — SAFETY (~367 tok)

## lib/

- `api.ts` — Contrato de `NEXT_PUBLIC_API_URL` (ver README → "Validación local"); `fetchListings` aplica `toPublicFeed` (solo `estado=activo`, orden `creadoEn` desc) a la respuesta de API y al fallback mock; `resolveListing` valida PIN contra el mock en el fallback offline; `fetchAdminListings`/`setAdminListingStatus` centralizan el loader y las acciones de `/admin` (mismo contrato de wire, con fallback offline a `MOCK_LISTINGS` para las 2 claves demo); `getContactLink` (US-6.5) — KNOWN GAP (bug-014, no corregido aún): solo cae al fallback offline ante fallo de red, no ante una respuesta HTTP de error. (~3150 tok)
  - fn `resolveApiBaseUrl` L18-251 (~2217 tok)
- `localStorage.ts` — Exports SavedAuthorListing, getMyListings, saveMyListing, removeMyListing (~343 tok)
- `types.ts` — Exports ListingType, ListingStatus, Listing, FilterState, CreateListingInput (~262 tok)
- `zones.ts` — Temporary frontend-only US-4.4 macro-zone catalog (`ZONES_BY_CITY_SLUG`, Norte/Sur/Centro-style areas per city, each using that city's real classification scheme researched via WebSearch — not individual barrios) + `getZonesForCityName(cityName)`; stand-in until infra exposes the real catalog via API. (~750 tok)

## scripts/

- `local-server.mjs` — Declares PORT (~348 tok)
- `stop-local-dev.sh` — Kills whatever `start-local-dev.sh` left running: processes on ports 3000/4000 (Next.js, Fastify/tsx backend) and the `proyecto-colombia-localstack` docker container. Run via `npm run dev:stopLocal`. (~250 tok)

## tests/

- `api-contact.test.ts` — getContactLink (US-6.5): API success, offline fallback on network failure, error on unknown id (~350 tok)
- `feed.test.tsx` — onOpenPublish; plus a "ListingCard contact reveal" suite (US-6.5): synchronous window.open + redirect to wa.me, error + pending-tab close on failure (~950 tok)
- `landing.test.tsx` — La landing es la única superficie que llama a la API en el primer render. (~700 tok)
- `setup.ts` — `next/link` (Navbar, Footer) observa el viewport para prefetch. jsdom no (~194 tok)

## tests/fixtures/

- `listings.ts` — Fixtures deterministas para las suites de render. No se reutilizan los (~329 tok)
