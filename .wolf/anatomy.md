# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-13T10:59:48.152Z
> Files: 41 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~98 tok)
- `AGENTS.md` — OpenWolf (~68 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `GEMINI.md` — OpenWolf (~68 tok)
- `next-env.d.ts` — / <reference types="next" /> (~66 tok)
- `next.config.mjs` — Next.js configuration (~54 tok)
- `openapi.yaml` — API contract snapshot for frontend/backend integration (~452 tok)
- `package-lock.json` — npm lock file (~81808 tok)
- `package.json` — Node.js package manifest (~285 tok)
- `postcss.config.mjs` — Declares config (~42 tok)
- `README.md` — Project documentation with roadmap handoff note (~667 tok)
- `ROADMAP.md` — Product source of truth for architecture and epic status (~4777 tok)
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

- `frontend-ci.yml` — CI: "Frontend Next.js CI/CD Pipeline" (~445 tok)

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

## docs/

- `DATA_POLICY.md` — DATA_POLICY (~467 tok)
- `SAFETY.md` — SAFETY (~367 tok)

## lib/

- `api.ts` — Default API Gateway endpoint URL (replaced dynamically when deployed) (~2103 tok)
- `localStorage.ts` — Exports SavedAuthorListing, getMyListings, saveMyListing, removeMyListing (~343 tok)
- `types.ts` — Exports ListingType, ListingStatus, Listing, FilterState, CreateListingInput (~262 tok)

## scripts/

- `local-server.mjs` — Declares PORT (~348 tok)
