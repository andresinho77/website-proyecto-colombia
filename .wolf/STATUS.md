# STATUS — website-proyecto-colombia

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-08-12

---

## ✅ Done

- OpenWolf initialized for Claude Code in the repository.
- Project context files created: `.wolf/`, `CLAUDE.md`, `.claude/rules/openwolf.md`.
- Environment template and API contract scaffold added for future agent sessions.
- CI workflow updated to run an OpenWolf integrity check.
- Added a new CI stabilization story for build/typecheck pipeline failures in the project plan.

---

## 🚀 Next phase

**Goal:** Finish the US-1.1 hero experience refinement and document the updated flow.

### Review follow-up
- Pinned the OpenWolf dependency for reproducible installs.
- Removed the inaccessible Claude package from the dependency set.
- Kept the OpenWolf scaffold and hooks trackable in the repository.
- Aligned the OpenAPI enum values with the frontend TypeScript models.

### Acceptance criteria
1. The primary hero CTA opens the listings feed and scrolls to it.
2. The secondary hero CTA opens the publish form for offers.
3. The updated behavior is reflected in the project documentation.

### Files to create / edit
| Type | File | Content |
|---|---|---|
| edit | `components/HeroButtons.tsx` | Clarified hero CTA actions and copy |
| edit | `app/page.tsx` | Wired the hero actions to feed scrolling and publish opening |
| edit | `README.md` | Documented the updated hero behavior |
| edit | `plan.md` | Marked US-1.1 as completed |

### Closed decisions
- The first CTA should guide people to browse available support, while the second CTA should immediately start publishing an offer.

### Open decisions
- None.

---

## 📁 Active architecture

- **Stack:** Next.js 14, React, TypeScript, Tailwind CSS
- **Key modules:** home page, hero buttons, publish modal, listings feed
- **Patterns:** client-side interaction state in the home page, shared UI components for the landing experience

---

## ⚠️ External blockers (don't block coding)

- None.

---

## 🔧 Useful commands

```bash
npm run build
```

---

## 📚 References (read IF needed)

- `.wolf/cerebrum.md` — User Preferences + Do-Not-Repeat + Decision Log
- `.wolf/anatomy.md` — token-efficient file index
- `.wolf/buglog.json` — known bugs + fixes
