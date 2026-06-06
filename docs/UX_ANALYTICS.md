# Web UX — Analytics & Evaluation

How crowd and wait **evaluation** surfaces work on the Next.js web app. “Analytics” here means data insight for trip research—not behavioral event tracking (no Mixpanel/Firebase spec in this phase).

**Platform split:** [PLATFORM_SPLIT.md](./PLATFORM_SPLIT.md)  
**Overlap with mobile:** `themeparks_flutter/docs/UX_ANALYTICS.md`

---

## Terminology

| Term | Meaning |
|------|---------|
| **Evaluation** | Crowd calendar, trends, live waits — help users decide when to visit |
| **Strategic** | Choosing a date (calendar) |
| **Tactical** | Checking current waits |
| **Analysis** | Historical patterns (trends) |
| **Product analytics** | Page views, CTA clicks — out of scope for docs; add SDK later if needed |

---

## Web analytics surfaces

| Surface | Route | API | Status target |
|---------|-------|-----|---------------|
| Live wait times | `/parks/[id]/waits` | `GET /wait-times/park/{park_id}` | Ship P0 |
| Crowd calendar | `/parks/[id]/calendar` | `GET /api/forecast/{park_id}/range` | Ship P0 |
| Trends | `/parks/[id]/trends` | `GET /wait-times/aggregates` | Ship P1 — replace Flutter mock |
| Best/worst summary | Calendar page | Derived from forecast range | Ship P0 |
| Confidence copy | Calendar page | `forecastAccuracy` field when present | Ship P1 |
| Live vs plan | — | — | **Not on web** (no itineraries) |
| Post-visit feedback | — | — | **Mobile only** |

---

## Live wait times

### Purpose

Let anonymous users sanity-check current conditions before installing the app.

### Data contract

```
GET /wait-times/park/{park_id}?stale_after_minutes=15
```

Response: `attractions[]` with `attraction_name`, `wait_time_minutes`, `status`, `access_features[]` (Lightning Lane).

### UX requirements

| Requirement | Detail |
|-------------|--------|
| Refresh cadence | Client re-fetch every 5–10 minutes; show “Last updated {time}” |
| Staleness | If backend marks stale, show amber banner: “Data may be outdated” |
| Sort / filter | By wait time, name; filter open attractions |
| LL badges | Display “Single Pass” / “Multi Pass” per backend mapping |
| Accessibility | Wait level as text + color |
| CTA | Footer: “Get live replans in the park” → `/download` |

### User-facing copy

- Hint: “Wait times typically refresh every 5–10 minutes.”
- Closed attraction: “Closed” — not a numeric wait

---

## Crowd calendar

### Purpose

Answer “which day should we go?” — primary strategic evaluation on web.

### Data contract

```
GET /api/forecast/{park_id}/range?max_days=30
```

### UX requirements

| Requirement | Detail |
|-------------|--------|
| Grid | 30-day view; cell color by `crowd_level` |
| Legend | Low / Moderate / High / Very High with numeric thresholds |
| Best / worst | Highlight min and max `crowd_level` days in range |
| Selection | Tap day → side panel or modal with level + guidance |
| Conversion CTA | On date select: “Plan for {date} in the app” → `/download?park={id}&date={date}` |
| Error | Retry; optional mock-free — do not fabricate forecast data on web |

### Confidence copy (P1)

When API exposes `forecastAccuracy` or similar:

- High: “Forecast based on 2+ years of historical waits”
- Low / missing: “Forecast is indicative — check live waits closer to your visit”

---

## Trends & historical analytics

### Purpose

Answer “can I trust the calendar?” via typical wait curves.

### Data contract

```
GET /wait-times/aggregates?park_id={id}&day_of_week={0-6}&top_attractions=10&hours_start=9&hours_end=22
```

Optional: `date=` for specific historical anchor.

### UX requirements

| Requirement | Detail |
|-------------|--------|
| Charts | Daily curve (hour × p50/p90); top attractions heatmap or table |
| Day selector | Day-of-week tabs |
| Text summaries | Below each chart: “Peak waits usually 11 AM–2 PM on Saturdays” |
| No mock data | Unlike current Flutter `_TrendsTab`, web must not use random/demo series |
| Empty / 503 | Clear message; link to calendar as fallback |
| CTA | “Turn insights into an optimized day” → `/download` |

### Migration note

Flutter `park_details.dart` `_TrendsTab` (~line 1992) uses demo random data. Web implementation sets the standard; mobile should match.

---

## What web analytics deliberately omits

| Capability | Why omitted |
|------------|-------------|
| Itinerary `expected_wait_minutes` | No itineraries on web |
| `replan-status` / live vs plan delta | Day-of product on mobile |
| `GET /api/itineraries/*/evaluations` | Post-visit tied to owned trips |
| GPS-anchored replan | Mobile only |
| User accounts / saved comparisons | No auth on web |

---

## Overlap rules with mobile

| Surface | Web | Mobile | Rule |
|---------|:---:|:------:|------|
| Live waits | Yes | Yes | Same API; web table-first, mobile list + map |
| Crowd calendar | Yes | Yes | Same API; web drives SEO + download CTA |
| Trends | Yes | Yes | Same aggregates API; both must use real data |
| Best/worst summary | Yes | Yes | Same derivation from forecast range |
| Live vs plan | No | Yes | Mobile-only |
| Post-visit feedback | No | Planned | Mobile-only |

When the same data appears on both platforms, **wording and crowd level colors should match** for brand trust.

---

## Refresh and staleness (user-facing)

| Data type | Recommended refresh | Copy |
|-----------|---------------------|------|
| Live waits | 5–10 min | “Updates every few minutes” |
| Crowd forecast | Daily / on page load | “Forecasts updated daily” |
| Wait aggregates | On demand / cache 1h | “Based on historical patterns” |
| Events | Daily | “Schedule subject to change” |

---

## Future: product analytics SDK (optional)

If added later, track on web only:

- `download_cta_click` (source page, park, date)
- `calendar_date_selected`
- `park_page_view`

Do not block MVP on SDK. Spec CTA `?ref=` query param on `/download` for lightweight attribution until then.

---

## Cross-links

- [UX_SCREEN_INVENTORY.md](./UX_SCREEN_INVENTORY.md) — page layouts
- Mobile analytics: `themeparks_flutter/docs/UX_ANALYTICS.md`
- API reference: `themeparks-backend/API_INTEGRATION_GUIDE.md`
