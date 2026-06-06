# ThemeParks Web

Next.js marketing and analytics site for ThemeParks. Park discovery, live waits, crowd forecasts, and trends — **no login**. Trip planning happens in the [mobile app](../themeparks_flutter).

## Status

**Documentation phase.** UX specs live in `docs/`. Application code not yet scaffolded.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/PLATFORM_SPLIT.md](docs/PLATFORM_SPLIT.md) | Canonical web vs mobile feature boundary |
| [docs/UX_INFORMATION_ARCHITECTURE.md](docs/UX_INFORMATION_ARCHITECTURE.md) | Routes, shell, sitemap |
| [docs/UX_SCREEN_INVENTORY.md](docs/UX_SCREEN_INVENTORY.md) | Per-page specs and API mapping |
| [docs/UX_ANALYTICS.md](docs/UX_ANALYTICS.md) | Evaluation surfaces on web |

## Related repos

| Repo | Role |
|------|------|
| [themeparks_flutter](../themeparks_flutter) | iOS/Android mobile app (auth + itinerary) |
| [themeparks-backend](../Documents/GitHub/themeparks-backend) | Flask API |

## API

Web uses read-only endpoints against the Flask backend. See `docs/PLATFORM_SPLIT.md` for the full list. Default base URL: `http://localhost:5000`.
