# ReadyHome India — Complete Audit Report
**Date:** 2026-08-12 · **Scope:** code, data, assets, functionality, PWA, performance, mobile, accessibility, links
**Audit method:** static analysis (node --check, ref/bracket integrity, dataset eval) + live browser audit (puppeteer: console/network errors, city matrix, checklist persistence, offline reload, mobile overflow, a11y DOM pass) + vision-model QA of screenshots.

## Scorecard

| Area | Result | Notes |
|---|---|---|
| Code integrity | ✅ PASS | app.js syntax OK, CSS braces balanced, all 12 HTML refs exist |
| Data integrity | ✅ PASS (2 fixes) | 65 unique cities, 0 malformed records, risk ranges valid, emg+note present |
| Assets | ✅ PASS (1 fix) | 30 files, 0 zero-byte; **14.87 MB → 4.65 MB** after compression |
| Core functionality | ✅ PASS | city matrix: Patna 21 tabs + quake ✓, Chennai 21 ✓, Bhadrak 20 ✓, Bhubaneswar 20 ✓ |
| Seasonal callout | ✅ PASS | correct for August (monsoon flood readiness), works offline |
| Checklists & persistence | ✅ PASS (1 fix) | toggles persist to localStorage; progress math fixed |
| Export (.md) | ✅ PASS (1 fix) | now downloads full plan with ✓/☐ per item |
| Shopping | ✅ PASS | 34 Amazon.in links render in shop tab (4 tiers incl. quality bar) |
| Video guides | ✅ PASS | 9 curated links (St John, NDMA, fire dept); oEmbed-verified; spot-checked live |
| One-tap helplines | ✅ PASS | 6 national + state numbers as tel: links; 2 call buttons |
| PWA / offline | ✅ PASS | SW v2 active, manifest present, offline reload serves full shell |
| Mobile | ✅ PASS | 390 px: no horizontal overflow; chips scroll in own bar |
| Accessibility (quick) | ✅ PASS* | 1 h1, 0 imgs missing alt, 0 unnamed buttons, lang=en; *tab chips < 44 px (see notes) |
| Console / network errors | ✅ PASS | 0 console errors, 0 failed requests during audit |
| Drill mode | ✅ PASS | opens, 7 items, timer ticks, last-drill persisted |
| Docs accuracy | ✅ PASS (2 fixes) | city counts 46→65, page-weight claim corrected |

## Issues found & fixed (this audit)

| # | Severity | Issue | Fix |
|---|---|---|---|
| A-01 | 🔴 High | **Duplicate city records** — Cuttack, Puri, Balasore, Sambalpur existed twice (original 46 + new district batch), shadowing richer originals (Balasore zone III, Puri tsu 2) | Removed 4 duplicate district entries; added 6 new non-duplicate districts (Koraput, Rayagada, Keonjhar, Angul, Nuapada, Gajapati) → **65 unique cities** |
| A-02 | 🔴 High | **Progress bar miscalculation** — one checkbox = 100% (total counted only items the user had touched) | New `sectionTotals()` computes true per-section item counts (detached render, cached per plan); progress = checked / full plan total |
| A-03 | 🔴 High | **.md download near-empty** — exported only checked items with index labels ("- [x] 0") | Rewritten: full plan dump, every checklist item with ✓/☐ label text |
| A-04 | 🟠 Medium | **Page weight 14.87 MB** (28 images @ up to 2848 px) vs documented ~2.4 MB | All images resized (max 1200 px; guide 1024 px) + q82 progressive → **4.65 MB (−69%)**; docs updated to real numbers |
| A-05 | 🟡 Low | SW cache name `readyhome-v1` would serve stale pre-compression files | Bumped to `readyhome-v2` (fresh precache on next visit) |
| A-06 | 🟡 Low | Input pre-filled with default city — users had to manually clear to search | Select-all on focus (`this.select()`) |

## Known limitations (not bugs, tracked)

1. **Leh (Ladakh) not covered** — dataset scope is 65 major cities/towns; district-level expansion (esp. Odisha) is the roadmap. P1: more states.
2. **Tab chips < 44 px tap targets** (27 buttons < 40 px measured) — deliberate compact horizontal chip bar; meets WCAG 2.2 24 px minimum, not 44 px AAA. Acceptable; can bump to 36 px in a polish pass.
3. **Full load ~5 s on cold 4G** — dominated by YouTube thumbnails (lazy-loaded, below fold); hero LCP stays fast (text + CSS). Compressed images cut ~10 s off the previous worst case.
4. **No live IMD alerts** — seasonal callout is calendar-based (reliable, offline); live IMD district-warning push remains P1 (T-RH-201).
5. **External links offline** — YouTube/Amazon need network (labels + alt text carry meaning offline).
6. **Amazon links** — 34 present in shop tab; last full HTTP-200 sweep at commit `8ca9739` (all passed); prices labeled "≈, check live".

## Verification evidence
- Static: `node --check` clean; CSS braces balanced; dataset eval → 65 records, unique, ranges valid
- Live: 0 console errors, 0 4xx/network failures; Patna 21 / Chennai 21 / Bhadrak 20 tabs; offline reload OK; mobile no overflow; checklist → `readyhome_chk_family` written
- Screenshots + vision-model QA: desktop & 390 px layouts clean (guide cards, video card, seasonal banner)

## Verdict
**Ship-ready.** All high-severity issues resolved; two real bugs (progress math, .md export) were caught by this audit and are now fixed. Remaining items are roadmap (Leh, IMD live alerts) or deliberate design trade-offs (chip size).

## Addendum v1.1 (2026-08-12, post-audit features)

Shipped after the audit (commits de4d85a, 93045d2) — no regressions observed; live-verified:

- **Live IMD warnings (T-RH-201 ✅)** — official CAP feed (cap-sources.s3.amazonaws.com/in-imd-en/rss.xml, CORS *), fetched client-side, matched to plan state/city, 72 h freshness filter, 15-min cache, silent offline fallback. Verified: Jaipur shows active rainfall warning; stale (>72 h) warnings correctly suppressed.
- **Kit & expiry tracker (T-RH-204 ✅)** — new 22nd section; add items (name/category/expiry), sorted list with expired / ≤30 d / ok badges, rotate (remove), localStorage 
eadyhome_kit, 100-item cap. Verified: add → reload → persists.
- Section counts changed: Bhubaneswar 20→21, Patna 21→22, Bhadrak 20→21.
- Docs updated: PRD F-table (F13/F14), tickets T-RH-201/204 moved to shipped, system design storage + CAP feed, frontend spec components.

New known limitation: CAP feed warnings are state-level text matches; district-level granularity + severity colours = next step.

## Addendum v1.2 (2026-08-12)

- **Alert severity colours** — warnings classified (extreme/high/med/info) with colour-coded banners; duplicate-titled warnings deduped.
- **Map & shelter card (T-RH-104 partial)** — OSM embed in Overview (no API key, lazy), shelter search links (OSM + Google Maps), district-control-room reminder.
- **Shareable deep links** — plans live at `#plan/<city>` (replaceState, deep-linkable + refresh-safe); 🔗 Link (clipboard copy) and 📲 Share (WhatsApp) buttons added to the topbar.
- Section counts unchanged (map lives inside Overview).

## Addendum v1.3 (2026-08-12) — curated coordinates

- **Help-point coordinates shipped (T-RH-104 complete)**: 62 cities · 322 verified points from OSM Overpass (cyclone/emergency shelters, hospitals, fire stations, police; nearest-4 per category; 31.5 KB static shelters.js, precached offline).
- **Leaflet map** (key-free OSM tiles) in the Overview card: city marker + help-point markers with popups (name, category, distance), auto-fit bounds; offline → static point table + OSM links. Amritsar has no points yet (Overpass timeout) → graceful fallback.
- SW bumped to 
eadyhome-v3 (shelters.js precached).
- Process note: the original background curation job was killed by a session error mid-run (55/65 cities); resumed with a resumable script + mirror fallback (overpass-api.de → kumi.systems → private.coffee) and fixed an OSM node field bug (lon, not lng).

## Addendum v1.3b (2026-08-12) — Amritsar + alert engine v2

- Amritsar curated (5 points: hospitals + Ram Bagh Police Station) → **63/65 cities, 327 points**.
- **Alert engine v2**: fetchAlerts now fetches each recent item's linked CAP XML and parses authoritative `<cap:severity>` + `<cap:areaDesc>`; banners tag matches as "Your area" (district/city in areaDesc) vs "Your state" vs "Regional"; severity colors come from the CAP field (Extreme→extreme, Severe→high, Moderate→med, Minor→info) with keyword fallback. Verified: Bhubaneswar→Kerala-Odisha item (state tag), Jaipur→East Rajasthan item (state tag).

## Addendum v1.4 (2026-08-12) — i18n framework + Hindi UI (T-RH-102 partial)

- **i18n framework shipped**: `TR` dictionaries (en/hi), `t()` helper with `{var}` interpolation, `applyLang()` re-renders static chrome + rebuilds the live plan, language switcher in topbar, persisted (`readyhome_lang`), `<html lang>` synced. Odia/Tamil slot in as pure data later.
- **Translated**: topbar buttons, hero (incl. lede + search), 7-step guide, all 22 section titles, risk labels + HIGH/MODERATE/LOW, risk chips, seasonal callout headers, IMD alert banners (prefix + Your area/state/Regional tags), kit badges/placeholders/categories, drill modal, progress line, footer. **Checklists stay English** — honest lang-note shown in hero; native review needed before content translation.
- **Bugs caught in verification (lesson-worthy)**: (1) i18n dict named `L` shadowed the **Leaflet global `L`** inside the IIFE — map silently never initialized (retry branch made it error-free); renamed dict → `TR`. (2) `alertBanner`'s local `const t` (timestamp) shadowed the `t()` translator once i18n landed. (3) Deferred unpkg Leaflet script + DOMContentLoaded race → initLeaflet self-retry (250 ms) added. All fixed and verified live.
- SW bumped to `readyhome-v4`.

## Addendum v1.4b (2026-08-12) — Odia + Tamil shipped (T-RH-102 complete)

- **Odia + Tamil dictionaries added as pure data** (109 keys each, verified parity with en/hi, zero missing keys). Switcher now has **4 languages**: English / हिंदी / ଓଡ଼ିଆ / தமிழ்.
- Verified live: all four render section titles, risk labels, progress line, topbar; Leaflet map renders in every language (6 markers); Odia persists across reload; zero page errors.
- Honest boundary unchanged: checklist content stays English until native review (lang-note per language).
- Note: the earlier "Odia/Tamil" attempt died to an LLM timeout mid-turn (nothing was written) — re-done this pass; lesson: verify file state after timeout-recovery turns, don't trust the last status message.
