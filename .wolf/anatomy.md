# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-13T05:54:50.391Z
> Files: 63 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~45 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `next-env.d.ts` — / <reference types="next" /> (~66 tok)
- `next.config.mjs` — Next.js configuration (~54 tok)
- `openapi.yaml` — API contract aligned with the frontend TypeScript listing types (~1865 tok)
- `package-lock.json` — npm lock file (~63152 tok)
- `package.json` — Node.js package manifest with pinned OpenWolf tooling (~208 tok)
- `pnpm-lock.yaml` — pnpm lock file (~45925 tok)
- `postcss.config.mjs` — Declares config (~42 tok)
- `README.md` — Project documentation (~909 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~221 tok)
- `tsconfig.json` — TypeScript configuration (~171 tok)

## .claude/

- `settings.json` (~514 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .github/workflows/

- `frontend-ci.yml` — CI: "Frontend Next.js CI/CD Pipeline" (~189 tok)

## app/

- `globals.css` — Styles: 9 rules, 1 layers (~261 tok)
- `layout.tsx` — metadata (~238 tok)
- `page.tsx` — Home — uses useState, useCallback, useEffect (~1342 tok)
  - fn `Home` L16-143 (~1140 tok)

## app/admin/

- `page.tsx` — API_BASE_URL — renders form — uses useState (~2234 tok)
  - fn `AdminPage` L9-202 (~2147 tok)

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
- `index.html` — Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026 (~6672 tok)
- `index.txt` (~683 tok)

## out/404/

- `index.html` — 404: This page could not be found. (~1973 tok)

## out/_next/static/HOF2yz6D1OalNE2HcSrsy/

- `_buildManifest.js` (~64 tok)
- `_ssgManifest.js` (~23 tok)

## out/_next/static/chunks/

- `119-70a322dc176dc550.js` — r: E, R, f, l (~8198 tok)
- `2200cc46-b3ffb43353249b08.js` — i: m, h, g + 42 more (~49382 tok)
- `945-32d2a150707db878.js` — n: u, o, P + 12 more (~35606 tok)
- `framework-6e06c675866dc992.js` — f: m, h, w + 24 more (~39995 tok)
- `main-0172c061a1600c6c.js` — r: a, o, i + 13 more (~33302 tok)
- `main-app-18eb0d5f7ef914bd.js` (~132 tok)
- `polyfills-42372ed130431b0a.js` — Declares e (~32155 tok)
- `webpack-903109f39686bc1d.js` — Declares d (~1063 tok)

## out/_next/static/chunks/app/

- `layout-923d2f878232ca52.js` (~66 tok)
- `page-0f7577454672a2e6.js` (~15199 tok)

## out/_next/static/chunks/app/_not-found/

- `page-769ce2aa7a3949cf.js` — Declares s (~499 tok)

## out/_next/static/chunks/app/admin/

- `page-668c299ce58e456c.js` — m: a, o, i + 4 more (~2839 tok)

## out/_next/static/chunks/app/terminos-y-privacidad/

- `page-364101b6981c6a5d.js` (~1313 tok)

## out/_next/static/chunks/pages/

- `_app-0c3037849002a4aa.js` (~80 tok)
- `_error-a647cd2c75dc4dc7.js` (~71 tok)

## out/_next/static/css/

- `a38a32a26dffba46.css` — Styles: 130 vars, 3 animations (~8163 tok)

## out/admin/

- `index.html` — Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026 (~1803 tok)
- `index.txt` (~766 tok)

## out/terminos-y-privacidad/

- `index.html` — Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026 (~5591 tok)
- `index.txt` (~2172 tok)

## scripts/

- `local-server.mjs` — Declares PORT (~348 tok)
