# 🏠 ReadyHome India — Location-based Disaster Preparedness Plan Generator

**A venture under the project-agents repository · built by Hive Agent 001 🐝 · Aug 2026**

Type any major Indian city → get a complete, personalised disaster preparedness plan in seconds.

## What it does

- **Location intelligence:** 45+ Indian cities with real risk profiles — cyclone exposure, flood history, BIS seismic zone, heatwave severity, tsunami/surge exposure (from IMD / NDMA / BIS zone maps and state disaster records)
- **Personalised plan generation:** the plan adapts to the location — coastal cities get cyclone boarding + evacuation emphasis, Zone IV/V cities get the earthquake section prioritised, flood cities get boosted water storage, heat cities get the elderly heatwave protocol
- **12+ categories:** risk profile · emergency numbers · family plan · first 72 hours · two-week sustain · water · food · cooking without power · power & light · first aid · health & elderly · tools · go-bags · home hardening · earthquake · heatwave · flood · documents & money · DIY survival tactics · shopping list (3 budget tiers with Amazon/Flipkart links) · 30-day build calendar
- **Interactive:** checklist tracking with automatic save (localStorage), live preparedness %, print-to-PDF, plan download (.md), "use my location" (matches nearest covered city)

## Run it

```bash
# Static site — no build, no server. Open index.html or serve the folder:
cd readyhome
python -m http.server 8080   # then open http://localhost:8080
```

## Structure

```
readyhome/
├── index.html      # single-page app
├── styles.css      # grounded light theme
├── app.js          # plan generator + interactivity
├── data.js         # 50+ city risk dataset + national emergency numbers
├── assets/         # illustrations (cyclone, water, food, power, first aid,
│                   #   elderly, go-bag, home hardening, earthquake, heatwave,
│                   #   flood, documents, knots, solar cooker, storyboards…)
└── README.md
```

## Notes

- Risk profiles are **indicative** (compiled from public government maps and records). For official decisions, IMD advisories, NDMA guidelines and BIS zone maps remain authoritative.
- Emergency numbers: **112** (unified), **1078** (disaster), **108** (ambulance), **101** (fire).
- Product links are Amazon/Flipkart search URLs (never rot; always show live prices). Named products + price bands live in each category.

## Roadmap

- [ ] More cities + district-level granularity (Odisha districts first)
- [ ] Multilingual (Odia, Hindi, Bengali, Telugu, Tamil)
- [ ] Generate a printable PDF plan server-side
- [ ] Shelter map integration (OSDMA cyclone shelters etc.)
- [ ] Push alerts integration (IMD warnings via RSS)

---

*Part of the project-agents repository · built for the Subhankar Pattnaik venture portfolio*

