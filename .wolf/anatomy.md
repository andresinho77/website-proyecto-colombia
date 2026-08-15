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
- `openapi.yaml` — API contract snapshot for frontend/backend integration (~452 tok)
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

- `page.tsx` — AdminPage — renders form — uses useState (~2216 tok)
  - fn `AdminPage` L8-201 (~2147 tok)

## app/terminos-y-privacidad/

- `page.tsx` — TerminosYPrivacidadPage (~1096 tok)
  - fn `TerminosYPrivacidadPage` L7-75 (~1030 tok)

## components/

- `EmergencyBanner.tsx` — EmergencyBanner (~523 tok)
- `Footer.tsx` — Footer (~650 tok)
  - section `FooterProps` L7-59 (~612 tok)
- `HeroButtons.tsx` — HeroButtons (~1094 tok)
  - section `HeroButtonsProps` L6-71 (~1068 tok)
- `ImageUploader.tsx` — ImageUploader — uses useState (~1238 tok)
  - section `ImageUploaderProps` L7-131 (~1184 tok)
- `ListingCard.tsx` — ListingCard — renders form, map — uses useState (~3359 tok)
  - section `ListingCardProps` L21-301 (~3250 tok)
- `ListingGrid.tsx` — ListingGrid (~762 tok)
  - section `ListingGridProps` L8-83 (~713 tok)
- `Navbar.tsx` — Navbar (~854 tok)
  - section `NavbarProps` L7-68 (~809 tok)
- `PrivacyPolicyModal.tsx` — PrivacyPolicyModal (~1068 tok)
  - section `PrivacyPolicyModalProps` L6-83 (~1040 tok)
- `PublishModal.tsx` — CITIES — renders form — uses useState, useEffect; resets the full form (incl. `tipo` from `defaultTipo`) on every open since the component never unmounts (~3900 tok)
  - section `PublishModalProps` L10-368 (~3670 tok)
- `SearchFilters.tsx` — CITIES — renders map (~1642 tok)
  - section `SearchFiltersProps` L7-145 (~1595 tok)
- `ShareModal.tsx` — ShareModal (~1057 tok)
  - section `ShareModalProps` L7-94 (~1010 tok)

## docs/

- `DATA_POLICY.md` — DATA_POLICY (~467 tok)
- `SAFETY.md` — SAFETY (~367 tok)

## lib/

- `api.ts` — Contrato de `NEXT_PUBLIC_API_URL` (ver README → "Validación local"); `fetchListings` aplica `toPublicFeed` (solo `estado=activo`, orden `creadoEn` desc) a la respuesta de API y al fallback mock; `resolveListing` valida PIN contra el mock en el fallback offline. (~2470 tok)
  - fn `resolveApiBaseUrl` L18-251 (~2217 tok)
- `localStorage.ts` — Exports SavedAuthorListing, getMyListings, saveMyListing, removeMyListing (~343 tok)
- `types.ts` — Exports ListingType, ListingStatus, Listing, FilterState, CreateListingInput (~262 tok)

## scripts/

- `local-server.mjs` — Declares PORT (~348 tok)

## tests/

- `feed.test.tsx` — onOpenPublish (~639 tok)
- `landing.test.tsx` — La landing es la única superficie que llama a la API en el primer render. (~700 tok)
- `setup.ts` — `next/link` (Navbar, Footer) observa el viewport para prefetch. jsdom no (~194 tok)

## tests/fixtures/

- `listings.ts` — Fixtures deterministas para las suites de render. No se reutilizan los (~329 tok)
