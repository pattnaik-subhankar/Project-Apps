# 05 — Feature Tickets
**ReadyHome India** · Sprint-style backlog · Generated 2026-08-11

Legend: **P0** shipped · **P1** next · **P2** later. Format: user story → acceptance criteria.

---

## P0 — Shipped (v1, live)

### T-RH-001 City search + geolocation
> As a user, I can type my city (or tap 📍) and get to a plan without hunting.
- [x] Fuzzy match on 46 cities; ≥6 suggestions, keyboard-navigable
- [x] Geolocation resolves to nearest covered city (haversine-lite)
- [x] Unknown input shows "Location not covered — try a nearby city"

### T-RH-002 Adaptive risk engine
> As a user in Patna vs Bhubaneswar, I see *different* plans because my risks differ.
- [x] Risk levels (low/med/high) derived per city from IMD/NDMA/BIS data
- [x] Seismic drill section appears iff quake zone ≥ 3 (Patna 21 sections, Bhubaneswar 20)
- [x] Flood/heat/hardening sections appear iff relevant risk ≥ 2
- [x] Water volume adapts (225 L + 15 L in flood cities)

### T-RH-003 21-section plan + checklists
> As a user, I can work through a complete preparedness plan as checkable items.
- [x] All 21 sections render with illustration + intro + checklist
- [x] Each item toggles; completion persists in localStorage
- [x] Progress bar reflects global completion %

### T-RH-004 Export (print/PDF + markdown)
> As a user, I can turn my plan into a PDF for family or a .md for my own notes.
- [x] Print CSS: all sections expanded, nav hidden, checkboxes as squares
- [x] Markdown download: risk profile + items (✓/☐) + buy list + disclaimers

### T-RH-005 Shopping buy list
> As a user, I can buy the kit from one trustworthy list.
- [x] 3 tiers (Essential / Comfort / Pro), budget label visible
- [x] 34 direct Amazon.in product pages, ASIN-verified HTTP 200 at ship time
- [x] "≈ price · check live" labeling; no affiliate gunk

### T-RH-006 7-step how-it-works guide
> As a new user, I understand the whole flow in one glance.
- [x] Numbered step cards (1–7) with illustrations, 3×2 + full-width final
- [x] Matches user-provided format sample; vision-QA'd clean at 390 px & 1280 px

### T-RH-204 Kit & expiry tracker (shipped v1.1)
> As a user, I track what's in my kit and when it expires.
- [x] Add item (name, category, expiry date) — persisted in localStorage
- [x] Sorted list with badges: expired / ≤30 days / ok
- [x] Remove (rotate) item; 100-item cap; honest note about expired ≠ useless

### T-RH-201 IMD live alerts (shipped v1.1)
> As a user, I see active IMD warnings for my state/city.
- [x] Official CAP feed (cap-sources.s3.amazonaws.com/in-imd-en/rss.xml, CORS-open) fetched client-side
- [x] Matches warnings against plan state + city; shows top 2 as a banner above tabs
- [x] 15-min cache in localStorage; silent graceful fallback offline
- [ ] (next) district-level matching + severity colours

---

## P1 — Next (ready to build)

### T-RH-101 District-level Odisha coverage (+40 towns)
> As a user in Jajpur or Bhadrak, I get a real plan, not "nearest city".
- Add districts: Bhadrak, Jajpur, Kendrapara, Jagatsinghpur, Puri, Ganjam, Bargarh, Sambalpur, Sundargarh, Malkangiri…
- Per-district: cyclone/flood/heat from state records; local helpline numbers (OSDMA district cells)

### T-RH-102 Multilingual (Odia, Hindi, Tamil, Telugu, Bengali)
> As a user who reads Odia/Tamil, I get the plan in my language.
- ✅ 2026-08-12: i18n framework + Hindi UI (topbar, hero, guide, 22 section titles, risk labels, alerts, kit, drill, footer); persisted switcher; checklists stay English until native review
- [ ] Odia + Tamil as pure dictionary data (framework ready); native review for checklist content

### T-RH-103 Server-side printable PDF
> As a user, I get a designed PDF (cover + illustrations), not a browser printout.
- Aliyun FC/Cloudflare Worker renders plan → PDF (reportlab/paged.js)
- Deep-linkable: `…/api/pdf?city=bhubaneswar`

### T-RH-104 Shelter & helpline map — ✅ v1.2 (partial)
> As a user, I see my city on a map and can find shelters.
- [x] OSM embed map card in the Overview panel (no API key, lazy-loaded)
- [x] One-click "find cyclone shelters near <city>" on OSM + Google Maps
- [x] District control room reminder (shelter availability changes by season)
- [x] Curated help-point coordinates for 62 cities (322 points: cyclone/emergency shelters, hospitals, fire stations, police) from OSM Overpass (2026-08-12)
- [x] Leaflet map with city + help-point markers (key-free OSM tiles); offline point table fallback
- [ ] (next) Amritsar retry + district-level cyclone shelter datasets from state agencies

---

## P2 — Later

### T-RH-201 IMD alert integration — ✅ shipped v1.1 (see above)

### T-RH-202 Offline PWA
- Service worker caches app shell + data; checklists fully offline; sync n/a (no backend)

### T-RH-203 Community sharing
- Generate shareable plan link (`#plan/bhubaneswar?prep=started`) + WhatsApp share card

### T-RH-204 Inventory expiry tracker — ✅ shipped v1.1 (see above)

---

## Working agreement
- Every P0 ticket has a shipped artifact + verification (HTTP 200 probes, puppeteer E2E, vision QA)
- Data changes land in `data.js` only, with source note
- New tickets must state: story, acceptance criteria, data source
