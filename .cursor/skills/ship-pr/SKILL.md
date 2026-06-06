---
name: ship-pr
description: >-
  One-command git ship: test, commit, push, draft PR, optional merge. Use when
  the user wants to stop manually using GitHub for commit/PR/merge, or says
  ship-pr, ship branch, auto PR, or merge my branch.
---

# Ship PR (automated git workflow)

**Script:** `./scripts/ship-pr.sh` from repo root (`themeparks-web`, `themeparks_flutter`, or `themeparks-backend`).

## Quick use

```bash
cd themeparks-web
git checkout -b feat/my-change

# Default — ship to main (test, commit, push, PR, wait for CI, squash merge)
./scripts/ship-pr.sh -m "feat: describe why" -a --merge

# Draft PR only (no merge) — when user explicitly wants an open PR without landing on main
./scripts/ship-pr.sh -m "feat: describe why" -a

# Already committed and pushed — merge only
./scripts/ship-pr.sh --no-commit --merge

# Merge immediately without waiting for CI (user-requested only)
./scripts/ship-pr.sh --no-commit --merge-now
```

## Auth (pick one)

- `gh auth login` (recommended), or
- `export GH_TOKEN=...`, or
- Git credential helper (HTTPS GitHub remote)

## GitHub Action backup

Pushing any non-`main` branch runs `.github/workflows/auto-draft-pr.yml`, which creates/updates a **draft PR** automatically.

## Agent rules

1. Never run on `main` / `staging` — create a feature branch first.
2. When the user asks to ship, commit, PR, or merge to `main`: run `./scripts/ship-pr.sh -m "…" -a --merge` (or `--no-commit --merge` if nothing left to commit).
3. Do **not** stop after opening a draft PR unless the user asked for draft-only or CI must be fixed first.
4. Use `-a` when agent added new untracked files (skills, docs).
5. Prefer `--merge` (waits for CI) over `--merge-now` unless user explicitly wants instant merge.
6. **Web (this repo):** docs-only today — tests skipped until Next.js is scaffolded; then `npm test` when `package.json` has a test script.
7. **Flutter:** `flutter test`. **Backend:** `python3 -m pytest`.
8. Do not commit secrets, `.env`, or build artifacts (`node_modules/`, `.next/`).
9. **Not for staging deploy** — use backend `commit-and-deploy-staging` for Cloud Run API/ingest.

## Sibling repos

Same skill and script pattern:

| Repo | Skill path |
|------|------------|
| themeparks_flutter | `themeparks_flutter/.cursor/skills/ship-pr/SKILL.md` |
| themeparks-backend | `themeparks-backend/.cursor/skills/ship-pr/SKILL.md` |

Cross-repo features: ship each touched repo from its own root on a feature branch.
