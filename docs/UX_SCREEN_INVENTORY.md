# Web UX — Screen Inventory

Per-page specifications for the Next.js web application. Implementation phase references these specs.

**IA overview:** [UX_INFORMATION_ARCHITECTURE.md](./UX_INFORMATION_ARCHITECTURE.md)

---

## Global components

| Component | Used on | Behavior |
|-----------|---------|----------|
| `TopNav` | All pages | Logo, Parks link, “Get the app” button → `/download` |
| `Footer` | All pages | Legal placeholders, download CTA |
| `DownloadCTA` | Park pages, calendar, trends | Configurable headline; appends `?park=` `?date=` |
| `ParkStatusBadge` | Park hub, waits | Open / Closed from operating hours |
| `LoadingState` | Data pages | Skeleton rows or spinner |
| `ErrorState` | Data pages | Message + retry button |
| `StaleDataHint` | Waits, calendar | “Updated X min ago · refreshes every 5–10 min” |

---

## 1. Landing (`/`)

**Purpose:** Marketing entry; drive browse or download.

**User question:** What is ThemeParks and why should I use it?

### Sections

| Section | Content |
|---------|---------|
| Hero | Logo, “Plan Smarter, Play Harder”, subcopy on waits + forecasts + app-based planning |
| Primary CTA | “Get the app” → `/download` |
| Secondary CTA | “Browse parks” → `/parks` |
| Feature row | 3 columns: Live waits, Crowd calendar, Smart itineraries (in app) |
| Featured parks | 4–6 Disney/major cards from `GET /parks` |
| Final CTA | Repeat download |

### APIs

| Call | When |
|------|------|
| `GET /parks` | Featured section (filter client-side or top N) |

### States

| State | UX |
|-------|-----|
| Loading | Skeleton cards for featured parks |
| Error | Show hero + static copy; hide featured or show retry |
| Empty parks | Hide featured; show “Browse parks” only |

### CTAs

- Hero: `/download`
- Feature “Smart itineraries”: `/download` (not `/plan`)

---

## 2. Browse Parks (`/parks`)

**Purpose:** Discover all parks; SEO index page.

**Migrates from:** `themeparks_flutter/lib/screens/browse_parks.dart`

### Sections

| Section | Content |
|---------|---------|
| Page title | “Browse Theme Parks” |
| Search | Filter by park name (client-side) |
| Filter chips | All, Disney, Universal, Six Flags, Other |
| Park list | Cards: name, location, country, open/closed, hours summary |
| Pagination | Page size ~20 |

### APIs

| Call | When |
|------|------|
| `GET /parks` | Page load |
| `GET /operating_hours/{park_id}/summary` | Per card or batch (optional) |

### States

| State | UX |
|-------|-----|
| Loading | Skeleton list |
| Error | Full-page error + retry |
| Empty search | “No parks match your search” |
| Pull-to-refresh | N/A on web — use manual refresh button in toolbar |

### Navigation

- Card tap → `/parks/[parkId]`

---

## 3. Park Hub (`/parks/[parkId]`)

**Purpose:** Park overview and gateway to analytics sub-pages.

**Migrates from:** `park_details.dart` header + park pills

### Sections

| Section | Content |
|---------|---------|
| Breadcrumb | Parks → {Park name} |
| Park pills | Switch among resort siblings (e.g. MK, EPCOT, HS, AK) |
| Header | Name, location, `ParkStatusBadge`, today’s hours |
| Quick stats | Current average wait (computed from waits API), today’s crowd level (forecast API) |
| Tab nav | Links to waits, calendar, trends, events |
| Overview body | Short description placeholder, hours table (7-day), download CTA |
| Sticky footer CTA | “Build your itinerary in the app” → `/download?park={id}` |

### APIs

| Call | When |
|------|------|
| `GET /parks/{park_id}` | Header meta |
| `GET /operating_hours/{park_id}` | Hours table |
| `GET /wait-times/park/{park_id}` | Quick stats (optional) |
| `GET /api/forecast/{park_id}?date=today` | Today crowd level (optional) |

### States

| State | UX |
|-------|-----|
| Invalid parkId | 404 page with link to `/parks` |
| Loading | Skeleton header |
| Error | Retry per section |

---

## 4. Live Waits (`/parks/[parkId]/waits`)

**Purpose:** Real-time attraction wait times for evaluation.

**Migrates from:** `park_details.dart` `_RidesTab`

### Sections

| Section | Content |
|---------|---------|
| Page title | “{Park} — Live Wait Times” |
| Stale hint | Last updated timestamp |
| Sort controls | By wait (asc/desc), name A–Z |
| Filter | Open only, has Lightning Lane |
| Table / list | Attraction name, status, wait minutes, LL badges (Single Pass / Multi Pass) |
| Row expand | Optional: LL return time, price from `access_features` |
| Sidebar CTA (desktop) | “Get live replans in the park” → `/download` |
| Mobile footer CTA | Same |

### APIs

| Call | When |
|------|------|
| `GET /wait-times/park/{park_id}?stale_after_minutes=15` | Page load; revalidate every 5–10 min |

### States

| State | UX |
|-------|-----|
| Loading | Skeleton rows |
| Error | Error + retry |
| Empty | “No wait data available” |
| Stale | Amber banner if `stale_after_minutes` exceeded |

### Accessibility

- Wait severity: color + text label (Low / Moderate / High)
- Do not rely on color alone

---

## 5. Crowd Calendar (`/parks/[parkId]/calendar`)

**Purpose:** 30-day crowd forecast for strategic date picking.

**Migrates from:** `themeparks_flutter/lib/widgets/crowd_calendar.dart`

### Sections

| Section | Content |
|---------|---------|
| Page title | “{Park} — Crowd Calendar” |
| Calendar grid | 30 days; color by `crowd_level` |
| Legend | Low, Moderate, High, Very High |
| Best / worst summary | Lowest and highest crowd days in range |
| Confidence copy | `forecastAccuracy` or static trust line |
| Selected day panel | Date, level, short guidance |
| CTA on date select | “Plan for {date} in the app” → `/download?park={id}&date={YYYY-MM-DD}` |

### APIs

| Call | When |
|------|------|
| `GET /api/forecast/{park_id}/range?max_days=30` | Page load |

### States

| State | UX |
|-------|-----|
| Loading | Skeleton calendar |
| Error | Error + retry |
| Partial data | Show available days; note gaps |

### Crowd level mapping

Per API guide: Low (≤3), Moderate (≤6), High (≤8), Very High (&gt;8).

---

## 6. Trends & Analytics (`/parks/[parkId]/trends`)

**Purpose:** Historical wait patterns for trust and comparison.

**Migrates from:** `park_details.dart` `_TrendsTab` — **must use real API, not mock data**

### Sections

| Section | Content |
|---------|---------|
| Page title | “{Park} — Trends & Analytics” |
| Day-of-week selector | Mon–Sun for aggregate query |
| Daily crowd curve | Line chart: hour vs p50/p90 wait |
| Top attractions matrix | Table: attraction × time bucket |
| Character / meet times | Phase 2 if API supports; else omit |
| Footer CTA | “Turn insights into an optimized day” → `/download` |

### APIs

| Call | When |
|------|------|
| `GET /wait-times/aggregates?park_id={id}&day_of_week={dow}&top_attractions=10&hours_start=9&hours_end=22` | Chart load; re-fetch on DOW change |

### States

| State | UX |
|-------|-----|
| Loading | Chart skeleton |
| Error | Error + retry |
| 503 / no data | “Historical data not available for this park yet” |

### Charts

- Provide text summary below each chart (“Typical peak: 11 AM–2 PM”)
- Mobile web: single-column; charts scroll horizontally if needed

---

## 7. Events (`/parks/[parkId]/events`)

**Purpose:** Special schedules, parties, early entry.

**Migrates from:** `themeparks_flutter/lib/widgets/events_tab.dart`

### Sections

| Section | Content |
|---------|---------|
| Page title | “{Park} — Events & Special Hours” |
| Event list | Name, date range, times, type badge |
| Empty state | “No special events in the next 90 days” |
| CTA | Download for itinerary impact (optional copy) |

### APIs

| Call | When |
|------|------|
| `GET /api/events/{park_id}?days=90` | Page load |

---

## 8. Lightning Lane reference (`/parks/[parkId]/lightning-lane`) — Phase 1.5

**Purpose:** Reference LL availability and booking types.

**Migrates from:** `park_details.dart` LL tab + `multi_pass.dart` (reference only)

### APIs

| Call | When |
|------|------|
| `GET /wait-times/park/{park_id}` | `access_features` per attraction |
| `GET /disney/lightning-lane/availability?park_id={id}` | Optional supplement |

**Note:** Multi Pass booking product flow stays on mobile; web is informational.

---

## 9. Download (`/download`)

**Purpose:** Convert web researchers to mobile installers.

### Sections

| Section | Content |
|---------|---------|
| Headline | “Plan your perfect park day” |
| Continuity copy | If `?park=` and/or `?date=` present: “Continue planning for {park} on {date}” |
| Store badges | App Store, Google Play (placeholder links) |
| QR code | Encodes app store URL or `https://themeparky.com/download` |
| Why mobile | Bullets: saved trips, personalized itineraries, GPS replan, notifications (future) |
| What you can do on web | Waits, calendar, trends — research before you go |

### Query params

| Param | Effect |
|-------|--------|
| `park` | Echo park name in continuity copy |
| `date` | Echo date in continuity copy |
| `ref` | Analytics attribution (future) |

### No forms

- No email capture required for MVP
- No login

---

## 10. Redirect pages

| Route | Implementation |
|-------|----------------|
| `/plan`, `/account`, `/login`, `/signup` | Next.js `redirect('/download')` permanent |

---

## Explicitly excluded from web

| Flutter screen | Reason |
|----------------|--------|
| `itinerary_generation.dart` | Mobile product |
| `itinerary_display.dart` | Mobile product |
| `today_screen.dart` | Mobile product |
| Auth screens | Mobile only |
| `wait_times_view.dart` | Legacy; replaced by `/waits` |
| `grouped_parks_view.dart` | Legacy; use `/parks` filters |
| `itinerary.dart` demo | Not user-facing |

---

## Implementation priority

| Priority | Pages |
|----------|-------|
| P0 | `/`, `/parks`, `/parks/[id]`, `/parks/[id]/waits`, `/parks/[id]/calendar`, `/download` |
| P1 | `/parks/[id]/trends`, `/parks/[id]/events`, redirect routes |
| P2 | `/parks/[id]/lightning-lane`, park map (web) |

---

## Cross-links

- [UX_ANALYTICS.md](./UX_ANALYTICS.md)
- [PLATFORM_SPLIT.md](./PLATFORM_SPLIT.md)
- Flutter mobile inventory: `themeparks_flutter/docs/UX_SCREEN_INVENTORY.md`
