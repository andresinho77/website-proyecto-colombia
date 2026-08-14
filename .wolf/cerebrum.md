# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-08-13

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->
- User wants `ROADMAP.md` to be the single source of truth for feature status and future direction.
- User prefers `README.md` to stay focused on basic project information and setup, not epic-by-epic status.
- User wants both documentation domains reconciled together: product/engineering docs and OpenWolf process docs.

## Key Learnings

- **Project:** website-proyecto-colombia
- **Description:** React / Next.js 14 Web Application for **Alojamiento Solidario Colombia** (`website-proyecto-colombia`). Designed for survivors, volunteers, and citizens following the August 10, 2026 earthquake in Co

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->
- [2026-08-13] No usar `openwolf scan --check` directo en CI para `anatomy.md` porque siempre deriva por `Last scanned`. Normalizar/ignorar ese campo y alertar solo cuando haya drift estructural real.
- [2026-08-13] Evitar `concurrency.group` global para CI+deploy de Pages; usar grupo por ref para CI y grupo dedicado para deploy a `main` para evitar cancelaciones cruzadas. (Histórico: el deploy de Pages se eliminó el 2026-08-14; ver Decision Log.)

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
- [2026-08-14] GitHub Pages approach removed entirely (workflow `deploy-pages` job + Pages artifact, ROADMAP references). Supersedes the 2026-08-13 dual-path decision. Entrega única: este repo hace build/type-check y expone el artefacto estático `out/`; el despliegue productivo (S3/CloudFront) lo hace `infra-proyecto-colombia`. `output: 'export'` en `next.config.mjs` se mantiene porque produce ese artefacto.
- [2026-08-13] ~~Delivery split: this repo publishes a permanent public mock on GitHub Pages~~ — superseded 2026-08-14 (GitHub Pages removed). Production deployment path (S3/CloudFront and infra automation) is owned by `infra-proyecto-colombia`.
- [2026-08-13] Documentation governance formalized: when docs disagree, `ROADMAP.md` prevails until reconciliation.
