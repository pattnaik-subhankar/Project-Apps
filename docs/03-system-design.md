# 03 — System Design
**ReadyHome India** · Version 1.0 · 2026-08-11

## 1. System context
Single-user-per-browser, zero-backend. One logical "system": a static web app. No servers, queues, DBs, or third-party APIs at runtime. Outbound links are the only external dependency at runtime (Amazon.in product pages) plus one read-only feed: the official IMD CAP RSS (cap-sources.s3.amazonaws.com/in-imd-en/rss.xml, CORS `*`, 15-min cached).

## 2. Component breakdown
```
[Static CDN (GitHub Pages)]
        │ serves
        ▼
[App shell index.html] ──▶ [CSS design system]
        │                        │
        ▼                        ▼
[data.js: CITIES x46] ◀──▶ [app.js]
                              │  ├─ resolveCity(q) / nearestCity(lat,lng)
                              │  ├─ genRisk(c) → level+class
                              │  ├─ buildPlan(c) → ordered sections
                              │  ├─ render() → tabs + panels + checklists
                              │  └─ state → localStorage
                              ▼
                        [assets/*.jpg illustrations]
```

## 3. Key flows
### 3.1 Generate a plan (main path)
1. On load, `fetchAlerts()` pulls the official IMD CAP feed (15-min cache); matching warnings render in the alert slot above the tabs
2. User types city OR taps 📍 (geolocation permission)
2. `resolveCity` fuzzy-matches; suggestions render (debounced, ≤6 shown)
3. On select: `buildPlan(city)` runs synchronously → section list
4. `render()` builds DOM; first section auto-opens; progress bar recalcs
5. URL hash updated (`#plan/<city>`) for shareable/refreshable state
6. Total time from click to first section visible: **<100 ms** (verified in smoke test)

### 3.2 Checklist toggle
1. Click checkbox → `state.set(section, index, checked)`
2. localStorage write (`readyhome_chk_<section>`), progress % recomputed, bar animates
3. Print view: `@media print` shows all sections expanded, checkboxes as squares

### 3.3 Export
- **PDF:** browser Print → Save as PDF (print CSS strips nav/tabs, expands all)
- **Markdown:** serializes plan (risk profile, every section's items with ✓/☐, buy list, disclaimers) → Blob download `.md`

## 4. Data storage design
| Data | Where | Format | Lifetime |
|---|---|---|---|
| City dataset | static `data.js` | JS object, ~46 records × 9 fields | versioned with repo |
| Checklist state | localStorage | `readyhome_chk_<sectionId>` → `{itemId: bool}` | until user clears |
| Kit inventory | localStorage | `readyhome_kit` → `[{n,c,e}]` | until user removes |
| IMD alerts cache | localStorage | `readyhome_alerts` → `{t, list}` (15-min TTL) | refreshed |
| Last city | localStorage | `readyhome_last_city` | convenience |
| Last drill | localStorage | `readyhome_last_drill` (ISO date) | until next drill |
| Nothing else | — | zero PII, zero analytics | — |

## 5. Consistency & correctness
- **Deterministic plans:** `buildPlan` is a pure function of the city record — same city ⇒ same sections, reproducible in tests
- **Single source of truth** for content: `data.js` (city) + `app.js` (section templates) — docs must not diverge; quarterly review
- **Link verification at ship time:** every Amazon ASIN probed HTTP 200 before commit (34/34); dead links replaced (e.g., flashlight B0DFQ5CTX4 → B0B66WNMGX)

## 6. Failure & degradation analysis
| Scenario | Detection | Behavior |
|---|---|---|
| Geolocation denied | permission error | input fallback with message |
| City not covered | no match ≥ threshold | "Location not covered — try nearest city" + suggestions |
| localStorage disabled | write throws | in-memory state, warn once |
| Broken image asset | browser 404 | alt text carries the meaning (accessibility net) |
| Old cached JS/CSS | version drift | immutable filenames on next deploy; hard-refresh note in README |

## 7. Performance budget
- Total page weight: ~5 MB (28 illustrations + 7 guide images, avg ~140 KB, compressed Aug 2026 from 14.9 MB)
- LCP: <1.5 s on 4G (hero is CSS/text; images lazy-load below fold)
- JS: single file, no framework, no external libs → zero blocking third-party requests
- Render: pure DOM creation (~200 nodes), no reflows beyond batch insert

## 8. Security & privacy
- No PII collection, no cookies, no tracking pixels
- Content Security Policy-friendly: no inline third-party scripts
- Outbound links only via user click; `rel="noopener"` on external anchors
- All risk data public/government-sourced; disclaimers surface source authority

## 9. Operations
- Deploy: push → Pages rebuild (~1–2 min) → live at /Project-Apps/
- Monitoring: none needed (static); availability = GitHub's
- Backup: git history is the backup; rollback = revert
