# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-13T08:27:54.320Z
> Files: 68 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~98 tok)
- `AGENTS.md` — OpenWolf (~68 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `GEMINI.md` — OpenWolf (~68 tok)
- `next-env.d.ts` — / <reference types="next" /> (~66 tok)
- `next.config.mjs` — Next.js configuration (~54 tok)
- `openapi.yaml` — API contract snapshot for frontend/backend integration (~420 tok)
- `package-lock.json` — npm lock file (~81808 tok)
- `package.json` — Node.js package manifest (~285 tok)
- `postcss.config.mjs` — Declares config (~42 tok)
- `README.md` — Project documentation with roadmap handoff note (~909 tok)
- `ROADMAP.md` — Product source of truth for architecture and epic status (~7600 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~221 tok)
- `tsconfig.json` — TypeScript configuration (~171 tok)

## docs/

- `DATA_POLICY.md` — Operational process for data deletion/anon requests and SLA (~780 tok)
- `SAFETY.md` — Abuse/fraud response runbook and escalation policy (~620 tok)

## .claude/

- `settings.json` (~514 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .github/workflows/

- `frontend-ci.yml` — CI: "Frontend Next.js CI/CD Pipeline" (~198 tok)

## app/

- `globals.css` — Styles: 9 rules, 1 layers (~261 tok)
- `layout.tsx` — metadata (~238 tok)
- `page.tsx` — Home — uses useState, useCallback, useEffect (~1342 tok)
  - fn `Home` L16-143 (~1140 tok)

## app/admin/

- `page.tsx` — API_BASE_URL — renders form — uses useState (~2234 tok)
  - fn `AdminPage` L9-202 (~2147 tok)

## .wolf/

- `STATUS.md` — Session handoff: concluded work and next quest (~560 tok)
- `memory.md` — Session action log table (~140 tok)

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
- `PublishModal.tsx` — CITIES — renders form — uses useState (~3766 tok)
  - section `PublishModalProps` L10-346 (~3670 tok)
- `SearchFilters.tsx` — CITIES — renders map (~1642 tok)
  - section `SearchFiltersProps` L7-145 (~1595 tok)
- `ShareModal.tsx` — ShareModal (~1057 tok)
  - section `ShareModalProps` L7-94 (~1010 tok)

## lib/

- `api.ts` — Default API Gateway endpoint URL (replaced dynamically when deployed) (~2103 tok)
- `localStorage.ts` — Exports SavedAuthorListing, getMyListings, saveMyListing, removeMyListing (~343 tok)
- `types.ts` — Exports ListingType, ListingStatus, Listing, FilterState, CreateListingInput (~262 tok)

## out/

- `404.html` — 404: This page could not be found. (~1973 tok)
- `index.html` — Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026 (~6586 tok)
- `index.txt` (~683 tok)

## out/404/

- `index.html` — 404: This page could not be found. (~1973 tok)

## out/_next/static/baZi6li9jM6LKKUqcsSIf/

- `_buildManifest.js` (~64 tok)
- `_ssgManifest.js` (~23 tok)

## out/_next/static/chunks/

- `117-1e02df43ae98fde9.js` — n: u, o, P + 12 more (~35610 tok)
- `553-a0e3144f561166e1.js` — r: E, R, f, l (~8202 tok)
- `fd9d1056-a4cd4812f5295779.js` — i: m, h, g + 42 more (~49382 tok)
- `framework-f66176bb897dc684.js` — f: m, h, w + 24 more (~39994 tok)
- `main-16f69fe406c8616e.js` — r: a, o, i + 13 more (~33295 tok)
- `main-app-25e40f6dfbfb8cee.js` (~132 tok)
- `polyfills-42372ed130431b0a.js` — Declares e (~32155 tok)
- `webpack-03f7c6bc932ce1e3.js` — Declares d (~1063 tok)

## out/_next/static/chunks/app/

- `layout-4defc4299f43c6cd.js` (~66 tok)
- `page-26e23b8752bda89c.js` (~15041 tok)

## out/_next/static/chunks/app/_not-found/

- `page-6c6a9a71742e9aad.js` — Declares s (~499 tok)

## out/_next/static/chunks/app/admin/

- `page-94dfe751fe55ed2f.js` — m: a, o, i + 4 more (~2840 tok)

## out/_next/static/chunks/app/terminos-y-privacidad/

- `page-2f26052047e146fa.js` (~1313 tok)

## out/_next/static/chunks/pages/

- `_app-72b849fbd24ac258.js` (~80 tok)
- `_error-7ba65e1336b92748.js` (~71 tok)

## out/_next/static/css/

- `60974f517971ebd2.css` — Styles: 130 vars, 3 animations (~8094 tok)

## out/admin/

- `index.html` — Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026 (~1804 tok)
- `index.txt` (~766 tok)

## out/terminos-y-privacidad/

- `index.html` — Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026 (~5591 tok)
- `index.txt` (~2173 tok)

## scripts/

- `local-server.mjs` — Declares PORT (~348 tok)
