# ThemeParks Agent Team

Multi-project workspace: **themeparks-web** (Next.js marketing/analytics) + **themeparks-backend** (Flask API) + **themeparks_flutter** (Flutter mobile). Open as one multi-root workspace: `themeparks_flutter/lib/services/themeparks_flutter.code-workspace`. Use role-specific agents and handoffs below. Global standards live in `.cursor/rules/principle-engineer-themepark.mdc` (Flutter/backend repos).

## Agent roles

| Role | Owns | Key paths (this repo) | Invoke when |
|------|------|----------------------|-------------|
| **Lead / Orchestrator** | Scope, sequencing, cross-repo handoffs | All three repos | Task touches 2+ repos or projects |
| **Web** | Marketing site, analytics UX, web docs | `docs/`, `app/` (when scaffolded), `components/` (when scaffolded) | Next.js pages, web UX specs, read-only API surfaces |
| **Backend API** | Flask routes, services, schema | `themeparks-backend/app/routes/`, `app/services/`, `app/models/schema.py` | Endpoints, DB fields, business logic |
| **Flutter UI** | Screens, widgets, UX | `themeparks_flutter/lib/screens/`, `lib/widgets/` | Mobile UI flows, navigation, polish |
| **Flutter Services** | API client, cache, models | `themeparks_flutter/lib/services/`, `lib/models/` | JSON contracts, caching |
| **Data & Ingestion** | Scripts, backfill, Playwright | `themeparks-backend/scripts/`, `data/backfill/` | Disney cookies, wait-time backfill, registry sync |
| **Planner / ML** | Itinerary engine, crowd ML | `themeparks-backend/planner/`, `app/services/crowd_forecast_*` | Scoring, forecast ETL, algorithms |
| **Quality & CI** | Tests, lint, CI | `docs/`, `.github/workflows/`, tests when scaffolded | Regressions, pre-PR checks |

**Status:** Documentation phase — UX specs in `docs/`; Next.js app not yet scaffolded. Trip planning stays in Flutter; web is read-only marketing and analytics.

## Handoff contracts

1. **API changes: Backend → Docs → Flutter Services → Flutter UI** (and Web when consuming new read-only endpoints)
   - Backend: route + service + `schema.py`
   - Docs: `themeparks-backend/API_INTEGRATION_GUIDE.md` with request/response samples
   - Web: update `docs/UX_SCREEN_INVENTORY.md` API mapping; implement pages when scaffolded
   - Flutter Services: models + services in themeparks_flutter
   - Flutter UI: screens last

2. **Platform split**: Web = park discovery, live waits, crowd forecasts, trends (no login). Mobile = auth + itinerary. See `docs/PLATFORM_SPLIT.md`.

3. **No silent failures**: Backend returns consistent JSON errors; web and Flutter show error UI.

4. **Verification before done**: `npm test` when scaffolded; docs-only changes need no test run today. Cross-repo: `pytest tests/` (backend), `flutter test` (Flutter).

5. **README sync**: Architectural changes update `README.md` here, `themeparks-backend/readme.md`, and `themeparks_flutter/README.md`.

6. **Staging ship (backend)**: When a task must land on staging API/ingest, orchestrate via `themeparks-backend` skill `commit-and-deploy-staging`. Do not run `deploy-staging.sh` with uncommitted backend ship paths.

7. **Feature ship (default)**: When the user wants work committed, PR’d, or merged to `main` → skill `ship-pr`: `./scripts/ship-pr.sh -m "…" -a --merge` per touched repo (waits for CI, squash-merges). Use `./scripts/ship-pr.sh --no-commit --merge` only if the branch is already pushed and committed. Lead orchestrates all three repos; avoid manual GitHub PR clicks.

## Path ownership (Web)

| Glob | Owner |
|------|-------|
| `docs/**` | Web |
| `app/**` | Web (when scaffolded) |
| `components/**` | Web (when scaffolded) |
| `scripts/**` | Web / Quality & CI |
| `.github/workflows/**` | Quality & CI |

Web uses read-only Flask endpoints. Do not add auth or itinerary flows here — see `docs/PLATFORM_SPLIT.md`.

## Commands

```bash
# Ship a feature branch to main (no manual GitHub PR clicks)
./scripts/ship-pr.sh -m "feat: your change" -a --merge
# Already committed and pushed — merge only
./scripts/ship-pr.sh --no-commit --merge

# When Next.js is scaffolded:
# npm run dev
# npm test
```

API base URL (when implemented): `http://localhost:5000` (same Flask backend as Flutter). See `docs/PLATFORM_SPLIT.md` and backend `API_INTEGRATION_GUIDE.md`.

## Skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| `ship-pr` | Test → commit → push → PR → merge to main in any touched repo (`./scripts/ship-pr.sh -m "…" -a --merge`) |
| `api-contract-change` | Endpoint or JSON shape changes (backend repo; update web docs when relevant) |
| `pre-pr-checklist` | Before opening a PR |
| `commit-and-deploy-staging` | Backend deploy/ship to staging (skill lives in backend repo) |

Sibling skills in `themeparks_flutter/.cursor/skills/` and `themeparks-backend/.cursor/skills/`: `flutter-feature`, `disney-ingestion`, `planner-change`.

## Delivery mode (cost-aware)

| Task | Prefer |
|------|--------|
| Web UX docs + API mapping | Local Web agent |
| API + mobile + web in one session | Local Lead orchestrating subagents |
| Codebase search | Local `explore` subagent (readonly) |
| CI / repetitive test fixes on a branch | Cloud Agent, narrow scope |
| Disney cookies, Playwright, local DB | Local only (backend) |
| Large refactor with explicit file list | Cloud Agent with acceptance criteria |

## Example prompts

**Web:**
> Update `docs/UX_SCREEN_INVENTORY.md` for [page]. Map read-only endpoints from `API_INTEGRATION_GUIDE.md`. Do not add auth or itinerary. When scaffolded, implement under `app/`.

**Lead (ship to main):**
> Task complete. From a feature branch in each touched repo (web, backend, and/or Flutter): `./scripts/ship-pr.sh -m "…" -a --merge`. Use `--no-commit --merge` only if already committed and pushed. Sequence cross-repo work before shipping; do not push to `main` directly for feature work.

**Backend API:**
> Implement `[METHOD] [path]` in Flask. Follow patterns in existing blueprints. Update `schema.py` if needed. Update `API_INTEGRATION_GUIDE.md`. Notify Web agent if web docs need API mapping updates.
