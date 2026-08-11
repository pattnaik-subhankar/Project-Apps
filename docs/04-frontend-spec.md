# 04 — Frontend Specification
**ReadyHome India** · Version 1.0 · 2026-08-11

## 1. Design system (tokens)
Palette — "warm paper" light theme:
| Token | Value | Use |
|---|---|---|
| `--paper` | `#f7f3ec` | page background |
| `--card` | `#fffdf8` | cards/panels |
| `--ink` | `#22201c` | primary text |
| `--ink-soft` / `--ink-faint` | `#5c564c` / `#8a8274` | secondary / muted |
| `--terra` | `#b4501f` | primary action, badges |
| `--saffron` | `#d9822b` | secondary accent (heat/high) |
| `--forest` | `#3a6b4f` | success / low-risk |
| `--ocean` | `#2b6b8f` | flood/water |
| `--wine` | `#8a3b3b` | danger accents |

Type: `--serif: Georgia` for headings (editorial, calm) · `--sans: Segoe UI` for UI.
Radius: 14 px cards · Shadow: soft layered (`0 1px 2px + 0 8px 24px -12px`).

## 2. Page structure (top → bottom)
1. **Topbar** — brand (house mark + "ReadyHome"), nav: How it works · Cities · Sources
2. **Hero** — headline + search box (`#locInput`), suggestions dropdown, 📍 geolocate, generate button
3. **How it works** — 7 numbered step cards (3×2 grid + full-width final), each: number badge, illustration, bold label, sub-line
4. **Plan view** (hidden until generation) — city header w/ risk chips → progress bar → horizontal tab chips → active panel
5. **Panels (21)** — each: title, illustration, intro, interactive checklist, notes box
6. **Footer** — 112/1078, disclaimer, sources, version

## 3. Component inventory
| Component | Behavior |
|---|---|
| Search suggestions | debounce 150 ms, fuzzy match, ≤6, keyboard navigable (↑↓ Enter) |
| Tab chips | horizontal scroll (nowrap), sticky category wall removed (fix: 914px overlap bug) |
| Checklist item | custom checkbox (accessible `<input type=checkbox>` styled), line-through on check |
| Progress bar | Σ checked/Σ items, animated width, updates on every toggle |
| Risk chip | colored by level: forest (low) / saffron (med) / wine (high) |
| Buy table | tier tabs (Essential/Comfort/Pro), rows: item · price ≈ · link (rel=noopener) |
| Export bar | "Print / PDF" + "Download .md" buttons |

## 4. Responsive behavior
| Breakpoint | Layout |
|---|---|
| ≥901 px | guide grid 3 cols; plan layout 1 col with wide panels |
| 561–900 px | guide grid 2 cols; tab chips horizontal scroll |
| ≤560 px | guide grid 1 col; full-width cards; larger tap targets (≥44 px) |

Mobile-specific fixes already shipped:
- Category wall at 914 px overlapped report → replaced with 60 px horizontal chip bar
- `nav { flex-wrap }` leaked into `#tabs` → `flex-wrap: nowrap` on tabs

## 5. Accessibility
- Semantic landmarks (`header`, `main`, `section`, `footer`), single `h1`
- Keyboard: all controls focusable with visible focus ring; tabs arrow-key navigable
- Color not sole signal: risk levels also carry text labels
- `alt` text on all 27 + 7 illustrations; contrast ≥ 4.5:1 for body text
- Print stylesheet: nav/tabs hidden, all sections expanded, checkboxes squared

## 6. State & URL
- `location.hash` = `#plan/<citySlug>` — deep-linkable, refresh-safe
- localStorage: `readyhome_chk_*`, `readyhome_last_city`
- No global mutable state outside `state` object; re-render is idempotent

## 7. Content guidelines (voice)
- Calm, practical, India-specific ("bottled water for 14 days", "OSDMA · 0674-2395398")
- No scare language: risk framed as "prepare, don't panic"
- Every product shows "≈ price, check live price" (prices drift)
- Sources cited in footer + per-city notes; NDMA/IMD/BIS named

## 8. Acceptance checklist (visual QA)
- [x] 390 px: no horizontal page scroll, chips scroll inside their own bar
- [x] 1280 px: guide grid aligned, cards equal height
- [x] Print preview: single clean doc, no nav
- [x] All images load (verified 24/24 assets + 7 guide images HTTP 200)
- [x] Vision-model QA passed: "no broken images or layout issues"
