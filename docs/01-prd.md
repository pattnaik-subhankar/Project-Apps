# 01 — Product Requirements Document (PRD)
**ReadyHome India — Location-based Disaster Preparedness Plan Generator**
Version 1.0 · 2026-08-11 · Status: **Launched (v1 live on GitHub Pages)**

## 1. Problem statement
India is among the most disaster-prone countries in the world: cyclones (Odisha alone has faced Fani 2019, Phailin 2013, the 1999 super cyclone), urban floods, heatwaves and earthquakes. Most households are unprepared: they do not know their own city's risk profile, what to stock, or what to do in the first 72 hours of a disaster. Generic preparedness advice is ignored because it is not personal.

**ReadyHome fixes this:** type your city → get a complete, personalized preparedness plan in seconds.

## 2. Target users & personas
- **P1 — Urban family with elderly parents** (primary): 30–60, lives in a cyclone/flood city, parents on BP/diabetes medication. Wants a concrete plan + shopping list + elderly-care protocol.
- **P2 — Young professional / student**: mobile-first, wants the essentials fast, checks lists off, shares with family.
- **P3 — NGO / society secretary / local leader**: uses the generated plan to brief a community (print-to-PDF).

## 3. Goals & success metrics
| Goal | Metric |
|---|---|
| Any Indian city user gets a plan in <5 seconds | generate time from click to rendered plan |
| Plans adapt to real local risk | % of sections that change between cities (verified: Bhubaneswar 20 vs Patna 21 sections) |
| Users complete preparation | checklist completion % (localStorage) |
| Users can act immediately | buy-list links resolve to live products (34/34 verified HTTP 200) |
| Shareable | print-to-PDF + .md download used |

## 4. Scope
### 4.1 In scope (v1 — live)
- 63 cities & towns with risk profiles (cyclone, flood, BIS seismic zone, heatwave, tsunami/surge)
- Personalized plan generation: 21 sections, adaptive to city risk
- Interactive checklists with automatic save + preparedness % bar
- Emergency numbers (national + state), family plan, 72-hour playbook, 2-week sustain
- Water/food/cooking/power/first aid/health/tools/go-bags/home hardening/quake/heat/flood/docs/DIY
- Shopping: 3 budget tiers + 34 direct Amazon.in product links (quality VFM picks)
- 7-step "How it works" visual guide (numbered step cards with illustrations)
- Print-to-PDF, plan download (.md), geolocation → nearest covered city
- Disclaimer: risk profiles are indicative; official government sources remain authoritative

### 4.2 Out of scope (v1)
- District-level granularity (only major cities)
- Multilingual content
- Real-time IMD warning push
- Server-side PDF generation, accounts, backend of any kind

## 5. Feature requirements (summary)
| # | Feature | Priority | Status |
|---|---|---|---|
| F1 | City search + suggestions + "use my location" | P0 | ✅ live |
| F2 | Adaptive risk-profile generation | P0 | ✅ live |
| F3 | 21 plan sections with checklists | P0 | ✅ live |
| F4 | Checklist persistence + progress bar | P0 | ✅ live |
| F5 | Print / PDF / .md export | P0 | ✅ live |
| F6 | Shopping buy list (34 verified links) | P0 | ✅ live |
| F7 | 7-step visual guide | P0 | ✅ live |
| F8 | More cities (district-level Odisha first) | P1 | backlog |
| F9 | Multilingual (Odia, Hindi, Tamil, Telugu, Bengali) | P1 | backlog |
| F10 | Server-side printable PDF | P1 | backlog |
| F11 | IMD warning integration / shelter maps | P2 | backlog |
| F12 | Offline PWA support | P2 | backlog |

## 6. Non-functional requirements
- **Performance:** full plan renders client-side in <100 ms after city resolution; zero network calls after page load
- **Availability:** static hosting (GitHub Pages) — no server to fail
- **Privacy:** zero PII collected; checklists stay in the browser (localStorage)
- **Accessibility:** WCAG 2.1 AA target — semantic HTML, keyboard-operable tabs, focus styles, alt text
- **Content trust:** every risk claim cites IMD / NDMA / BIS / state records; disclaimers present

## 7. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Product links rot / prices change | links are ASIN-stable product pages; prices labeled "≈ Aug 2026, check live"; search-URL fallbacks documented |
| Risk data becomes stale | data.js is a single file, reviewed quarterly; sources cited per city |
| Users treat plan as official advice | persistent disclaimer + footer with 112/1078 |
| Mobile layout regressions | viewport-tested at 390px & 1280px; tab chips scroll horizontally (fixed 914px-wall bug) |

## 8. Success criteria (post-launch, next 90 days)
- ≥1,000 unique plans generated
- ≥30% of users check ≥1 checklist item
- 0 broken buy links reported by users
- 5 city-specific improvements contributed back (more cities, better local data)

---
*Part of the ReadyHome India project (github.com/pattnaik-subhankar/Project-Apps)*
