# 02 — Technical Architecture
**ReadyHome India** · Version 1.0 · 2026-08-11

## 1. Architecture style
**Zero-backend static single-page application (SPA).** Everything — city data, risk engine, plan generator, state — runs in the browser. Deployed as static files to GitHub Pages.

```
┌─────────────────────────── Browser ───────────────────────────┐
│                                                               │
│  index.html   ── loads ──▶  styles.css                        │
│       │                     (design system)                   │
│       └──────────▶  data.js  ──▶  app.js (orchestrator)       │
│                        │              │                       │
│                        ▼              ▼                       │
│                   CITIES dataset   RISK ENGINE                │
│                   (63 cities)      genRisk()/buildPlan()      │
│                                          │                    │
│                                          ▼                    │
│                                   RENDERER (tabs, panels,     │
│                                   checklists, buy table)      │
│                                          │                    │
│                                          ▼                    │
│                              localStorage (checklist state)   │
└───────────────────────────────────────────────────────────────┘
        │                    │                     │
        ▼                    ▼                     ▼
  GitHub Pages          Print/PDF (.md)       Amazon.in links
  (static CDN)          browser print API     (outbound only)
```

## 2. Component inventory
| Component | File | Responsibility |
|---|---|---|
| App shell | `index.html` | semantic layout, meta, guide section |
| Design system | `styles.css` | tokens (CSS vars), layout, responsive, print |
| Data layer | `data.js` | `CITIES` (63 records) + `NATIONAL_EMG` |
| Orchestrator | `app.js` | location resolution, plan generation, rendering, state |
| Assets | `assets/*.jpg` | 20 section illustrations + 7 guide illustrations |

## 3. Key decisions
| Decision | Rationale |
|---|---|
| **No backend** | zero ops cost, no outage surface, no PII exposure, instant loads; Pages gives global CDN |
| **City-keyed dataset, not geo lookup** | deterministic, auditable, works offline, no API keys/quotas |
| **Client-side state (localStorage)** | checklists persist without accounts; keyed `readyhome_chk_<section>` |
| **Static generation of plans** | all 21 sections are template functions parameterized by city risk — no server render needed |
| **Amazon ASIN product links** | stable across renames/repricing; search-URL fallback documented |
| **GitHub Pages deployment** | free, versioned with the repo, instant rollback via git |

## 4. Data model (data.js)
```js
CITY = {
  n: "Bhubaneswar", s: "Odisha", lat: 20.296, lng: 85.824,
  cyc: 3,   // 0-3 cyclone exposure (IMD history)
  flood: 2, // 0-3 flood/waterlogging risk
  quake: 2, // BIS seismic zone (2-5)
  heat: 3,  // 0-3 heatwave severity
  tsu: 0,   // 0-2 tsunami/surge exposure
  note: "Capital city ...", emg: "OSDMA · 0674-2395398"
}
```

## 5. Risk engine (app.js)
- `resolveCity(q)` — fuzzy match on city/state names (normalized tokens, scoring)
- `nearestCity(lat,lng)` — haversine-lite over the dataset (<5° window)
- `genRisk(c)` — maps raw 0–3/zone values → {level, class: low|med|high}
- `buildPlan(c)` — selects sections by threshold:
  - quake drill shown iff `quake ≥ 3` (Patna zone IV → 21 sections; Bhubaneswar zone II → 20)
  - flood/heat/hardening sections shown iff relevant risk ≥ 2
  - water volume adapts: `225 L + 15 L` in flood cities
- `adaptLine(c)` — human-readable summary of what changed for this city

## 6. State & storage
- localStorage keys: `readyhome_chk_<sectionId>` → `{"<sectionId>_<i>": bool}`
- Progress bar = Σ checked / Σ known items across sections (recomputed on each toggle)
- No cookies, no server calls, no analytics (privacy by design)

## 7. Deployment topology
```
main branch (Project-Apps repo)
   └── index.html, styles.css, app.js, data.js, assets/, docs/
        └── GitHub Pages (Deploy from branch, /root)
             └── https://pattnaik-subhankar.github.io/Project-Apps/
```
CI/CD: none required — Pages rebuilds on push (~1–2 min). Rollback = `git revert`.

## 8. Failure modes
| Failure | Behavior |
|---|---|
| Amazon link 404 | user sees live price page only if link valid; ASINs verified at ship time (34/34) |
| localStorage blocked | app degrades: checklists work in-memory for the session |
| Unsupported city | explicit "Location not covered — try a nearby city" |
| Stale CSS cache | versioned deploy + hard-refresh guidance |

## 9. Evolution path (v2+)
- Serverless function (Aliyun FC / Cloudflare Worker) for server-side PDF + district data API
- IMD RSS → per-city alert banner
- PWA service worker for offline checklists
- i18n: content dictionary per language, same risk engine
