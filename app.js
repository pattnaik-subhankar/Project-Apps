/* ReadyHome India — plan generator */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("readyhome_" + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem("readyhome_" + k, JSON.stringify(v)); }
  };

  let current = null; // resolved city
  let plan = null;

  /* ---------- location resolution ---------- */
  function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function resolveCity(q) {
    if (!q) return null;
    const nq = norm(q);
    let best = null, bestScore = 0;
    for (const c of CITIES) {
      const name = norm(c.n), state = norm(c.s);
      let score = 0;
      if (name === nq) score = 100;
      else if (name.startsWith(nq) || nq.startsWith(name)) score = 60;
      else if (name.includes(nq)) score = 40;
      else if (state && (state === nq || state.includes(nq) || nq.includes(state))) score = 25;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return bestScore >= 25 ? best : null;
  }
  function nearestCity(lat, lng) {
    let best = null, bestD = Infinity;
    for (const c of CITIES) {
      const d = Math.hypot(c.lat - lat, c.lng - lng);
      if (d < bestD) { bestD = d; best = c; }
    }
    return best && bestD < 5 ? best : null;
  }

  function renderSuggestions(q) {
    const box = $("suggestions");
    if (!q) { box.innerHTML = ""; box.classList.add("hidden"); return; }
    const hits = CITIES.filter(c => norm(c.n).includes(norm(q)) || norm(c.s).includes(norm(q))).slice(0, 8);
    box.innerHTML = hits.map(c =>
      `<button class="sug" data-city="${c.n}">📍 ${c.n}, ${c.s} <span class="sug-tag">${riskChips(c)}</span></button>`).join("");
    box.classList.toggle("hidden", hits.length === 0);
    box.querySelectorAll(".sug").forEach(b => b.onclick = () => { $("locInput").value = b.dataset.city; box.classList.add("hidden"); generate(b.dataset.city); });
  }
  function riskChips(c) {
    const parts = [];
    if (c.cyc >= 3) parts.push("cyclone");
    if (c.flood >= 3) parts.push("flood");
    if (c.quake >= 4) parts.push("EQ zone " + c.quake);
    if (c.heat >= 3) parts.push("heat");
    return parts.join(" · ") || "low hazard";
  }

  /* ---------- plan generation ---------- */
  function genRisk(c) {
    return {
      cyc: { label: "Cyclone", lvl: c.cyc, cls: riskCls(c.cyc) },
      flood: { label: "Flood / waterlogging", lvl: c.flood, cls: riskCls(c.flood) },
      quake: { label: "Earthquake (zone " + c.quake + ")", lvl: c.quake >= 4 ? 3 : c.quake >= 3 ? 2 : 1, cls: c.quake >= 4 ? "high" : c.quake >= 3 ? "med" : "low" },
      heat: { label: "Heatwave", lvl: c.heat, cls: riskCls(c.heat) },
      tsu: { label: "Tsunami / surge", lvl: c.tsu, cls: riskCls(c.tsu) },
    };
  }
  function riskCls(l) { return l >= 3 ? "high" : l === 2 ? "med" : "low"; }

  function waterLitres(c) { return c.flood >= 2 ? 240 : 225; } // flood areas store a bit more
  function quakeEmphasis(c) { return c.quake >= 4; }
  function cycloneEmphasis(c) { return c.cyc >= 2; }
  function heatEmphasis(c) { return c.heat >= 2; }
  function floodEmphasis(c) { return c.flood >= 2; }

  function buildPlan(c) {
    const risk = genRisk(c);
    const wL = waterLitres(c);
    const sections = [
      { id: "overview", icon: "📋", title: "Your risk profile", tag: "start" },
      { id: "numbers", icon: "📞", title: "Emergency numbers", tag: "start" },
      { id: "family", icon: "👨‍👩‍👦", title: "Family plan", tag: "start" },
      { id: "h72", icon: "⏱️", title: "First 72 hours", tag: "start" },
      { id: "sustain", icon: "🗓️", title: "Two-week sustain", tag: "start" },
      { id: "water", icon: "💧", title: "Water", tag: "core" },
      { id: "food", icon: "🍚", title: "Food", tag: "core" },
      { id: "cooking", icon: "🍳", title: "Cooking without power", tag: "core" },
      { id: "power", icon: "🔋", title: "Power & light", tag: "core" },
      { id: "firstaid", icon: "🩹", title: "First aid", tag: "core" },
      { id: "health", icon: "💊", title: "Health & elderly", tag: "core" },
      { id: "tools", icon: "🛠️", title: "Tools & gear", tag: "core" },
      { id: "gobags", icon: "🎒", title: "Go-bags", tag: "core" },
      { id: "harden", icon: "🏠", title: "Home hardening", tag: "hazard", show: cycloneEmphasis(c) || floodEmphasis(c) },
      { id: "quake", icon: "🪨", title: "Earthquake drill", tag: "hazard", show: c.quake >= 3 },
      { id: "heat", icon: "🌡️", title: "Heatwave", tag: "hazard", show: heatEmphasis(c) },
      { id: "flood", icon: "🌊", title: "Flood", tag: "hazard", show: floodEmphasis(c) },
      { id: "docs", icon: "📄", title: "Documents & money", tag: "core" },
      { id: "diy", icon: "🛠️", title: "DIY survival tactics", tag: "core" },
      { id: "shop", icon: "🛒", title: "Shopping list", tag: "core" },
      { id: "calendar", icon: "📅", title: "30-day build", tag: "core" },
    ].filter(s => s.show !== false);

    const content = {
      overview: () => `
        <div class="risk-grid">
          ${Object.values(risk).map(r => `
            <div class="risk-card ${r.cls}">
              <div class="rc-name">${r.label}</div>
              <div class="rc-lvl">${r.lvl >= 3 ? "HIGH" : r.lvl === 2 ? "MODERATE" : "LOW"}</div>
              <div class="rc-bar"><span style="width:${r.lvl * 33}%"></span></div>
            </div>`).join("")}
        </div>
        <p class="note">${c.note || ""} ${c.emg ? "State emergency: " + c.emg : ""}</p>
        <div class="callout"><b>How this plan adapts:</b> ${adaptLine(c)}</div>`,
      numbers: () => `
        <div class="emg-grid">
          ${NATIONAL_EMG.map(e => `<div class="emg-card"><b>${e[0]}</b><span>${e[1]}</span></div>`).join("")}
          ${c.emg ? `<div class="emg-card wide"><b>${c.emg.split("·")[0].trim()}</b><span>${c.emg.split("·").slice(1).join(" · ").trim() || "State emergency contact"}</span></div>` : ""}
        </div>
        <p class="note">Save <b>112</b> as ICE on every family phone. Print this section and pin it near the door. Phones die in disasters — paper doesn't.</p>`,
      family: () => checklist("family", [
        "Assign roles: commander (power/go-bags), food & water, documents & cash, medical kit",
        "Meeting points: (A) strongest inner room · (B) open ground nearby · (C) out-of-city relative",
        "Pick one relative outside the state as the check-in line (SMS works when calls fail)",
        "Full home drill every 3 months · go-bag check on the 1st of every month",
        "Elderly plan: one adult always knows where parents' meds are",
      ]),
      h72: () => `
        <div class="cols3">
          <div class="colc"><h4>⏱ Hours 0–6 · warning</h4>${ul(["Fill every container + buckets with water", "Charge all phones + power banks", "Move to the safe inner room", "Board/tape windows, secure loose items", "Withdraw cash — ATMs will fail", "Bring elderly & pets inside"])}</div>
          <div class="colc"><h4>🌪 Hours 6–24 · during</h4>${ul(["Stay indoors, away from windows", "Listen to the crank radio / 112 updates", "Use lanterns, never candles (gas leaks)", "NEVER walk/drive through floodwater", "One adult monitors parents' meds", "Log water & food use"])}</div>
          <div class="colc"><h4>✅ Hours 24–72 · after</h4>${ul(["Check gas leaks, fallen wires, roof damage", "Boil or purify ALL water", "Eat stored food first", "Signal if trapped: whistle, torch, bright cloth", "Check on neighbours, help nearby elderly", "Photograph damage for insurance"])}</div>
        </div>
        ${quakeEmphasis(c) ? `<div class="callout"><b>Earthquake-aware:</b> if the ground shakes, DROP → COVER → HOLD under a sturdy table before anything else. Stay inside during shaking.</div>` : ""}`,
      sustain: () => checklist("sustain", [
        "Water: " + wL + " L stored (14 days × 4 people × 4 L) + purification (boil, tablets, filter)",
        "Food: 14-day dry pantry — rice, atta, dal, oil, salt, sugar, tea, milk powder, canned, energy bars",
        "Cooking: butane camping stove + 8–12 cylinders; rocket stove & solar cooker as backup",
        "Power: 20,000 mAh power banks, solar lanterns, crank radio, inverter (if budget allows)",
        "Health: 2-week medicine buffer for parents + first aid kit + ORS + thermometer",
        "Hygiene: buckets, soap, sanitizer, disinfectant, toilet paper, garbage bags",
        "Money: ₹5,000–10,000 in small notes + UPI on charged phones",
        "Comfort: blankets, warm clothes, battery fans, books/games for morale",
      ]),
      water: () => `
        <div class="two"><div>
        ${checklist("water", [
          "Store: " + wL + " L — 20 L drums × 8 + 5 L bottles × 5 + filled buckets",
          "Purify: boil 10+ min · Aquatabs 49 mg (1 tab = 20 L) · gravity filter backup",
          "DIY emergency filter: bottle + cloth → charcoal → sand → gravel (see DIY section)",
          "Rainwater catch: clean drum under downpipe with cloth mesh (washing, not drinking)",
          "After floods: assume EVERY source is contaminated. Boil or tablet everything.",
        ])}
        </div><div class="imgbox"><img src="assets/water.jpg" alt="Water storage"><div class="price">🛒 20L drums ×8 (~₹350 each) · Aquatabs 30-pack (~₹250) · gravity filter (~₹1,200) — <a href="https://www.amazon.in/s?k=20+litre+water+storage+drum" target="_blank">Amazon</a> · <a href="https://www.flipkart.com/search?q=water+purification+tablets" target="_blank">Flipkart</a></div></div></div>`,
      food: () => `
        <div class="two"><div>
        ${checklist("food", [
          "Grain (6+ months): 10 kg rice, 5 kg atta, 3 kg dal, 2 kg suji",
          "Fat & salt: 2 L oil, 500 g ghee, 1 kg salt, 500 g sugar, 250 g jaggery",
          "Instant energy: 2 kg biscuits/rusk, 1 kg energy bars, 500 g chikki, 2 kg roasted chana",
          "Protein: 12 cans (sardine/beans/soy), 500 g milk powder, 24 tetra-packs",
          "Tea & spices + 12 ORS packets",
          "Traditional preservers: pickles, papad, dried chillies (morale + nutrition)",
        ])}
        <p class="note">White rice lasts 10+ yrs sealed; brown rice only 6–12 months. Rotate every 6 months: eat old, buy new. Keep a manual can opener!</p>
        </div><div class="imgbox"><img src="assets/food.jpg" alt="Food pantry"><div class="price">🛒 <a href="https://www.amazon.in/s?k=rice+10kg+bag" target="_blank">Amazon grains</a> · <a href="https://www.flipkart.com/search?q=energy+bars" target="_blank">Flipkart bars</a> · <a href="https://www.amazon.in/s?k=milk+powder" target="_blank">Amazon milk powder</a></div></div></div>`,
      cooking: () => `
        <div class="two"><div>
        ${checklist("cooking", [
          "Primary: portable butane camping stove + 8–12 cylinders (1 cylinder ≈ 2–3 meals)",
          "DIY rocket stove: tin can + twigs — 70% cleaner burn, dal in 20 min",
          "DIY solar cooker: foil-lined box + black pot + glass lid (sunny months)",
          "Traditional chulha (outdoor space) as last resort",
          "SAFETY: never cook indoors with charcoal/wood (CO poisoning); butane in ventilated rooms",
          "Pressure cooker (fuel-efficient), manual can opener, matches in waterproof box",
        ])}
        </div><div class="imgbox"><img src="assets/cooking-nopower.jpg" alt="Cooking without power"><div class="price">🛒 Stove ~₹1,000–1,500 · cylinders ~₹180–250 — <a href="https://www.amazon.in/s?k=portable+butane+camping+stove" target="_blank">Amazon</a> · <a href="https://www.flipkart.com/search?q=butane+gas+stove" target="_blank">Flipkart</a></div></div></div>`,
      power: () => `
        <div class="two"><div>
        ${checklist("power", [
          "2× 20,000 mAh power banks (charge phones 6–8× each)",
          "20 W folding solar panel to recharge banks & lanterns in sunlight",
          "2 LED rechargeable lanterns + 2 solar/crank flashlights + 1 headlamp",
          "Hand-crank emergency radio (AM/FM + weather) — your lifeline when towers fail",
          "16× AA + 8× AAA batteries in airtight box",
          "Inverter/UPS (₹8–15k) for fan + lights + fridge — the biggest comfort upgrade for elderly",
          "Surge-protected extension boards; NEVER run generators indoors",
        ])}
        </div><div class="imgbox"><img src="assets/power.jpg" alt="Power & light"><div class="price">🛒 <a href="https://www.amazon.in/s?k=20000mah+fast+charging+power+bank" target="_blank">Amazon power bank</a> · <a href="https://www.amazon.in/s?k=hand+crank+emergency+radio+solar" target="_blank">Amazon radio</a> · <a href="https://www.flipkart.com/search?q=20w+folding+solar+panel" target="_blank">Flipkart solar</a></div></div></div>`,
      firstaid: () => `
        <div class="two"><div>
        ${checklist("firstaid", [
          "Kit: bandages, gauze, tape, antiseptic, scissors, tweezers, gloves, thermometer, pain relief, ORS",
          "CPR: 30 compressions (5–6 cm deep, 100–120/min) + 2 breaths; hands-only if untrained",
          "Bleeding: direct pressure 10 min; tourniquet ONLY for severe limb bleeding (note the time)",
          "Choking: 5 back blows → 5 abdominal thrusts (Heimlich)",
          "Heatstroke: shade, cool water, fan, ORS; emergency if confused/unconscious",
          "Print a CPR chart; tape inside the first aid box lid. Take a 2-hr class.",
        ])}
        </div><div class="imgbox"><img src="assets/firstaid.jpg" alt="First aid kit"><div class="price">🛒 <a href="https://www.amazon.in/s?k=family+first+aid+kit" target="_blank">Amazon kit</a> · <a href="https://www.flipkart.com/search?q=first+aid+box" target="_blank">Flipkart</a></div></div></div>`,
      health: () => `
        <div class="two"><div>
        ${checklist("health", [
          "14-day extra supply of EVERY prescription (BP, diabetes, heart, thyroid)",
          "Senior bag: weekly pill organizer, BP monitor, thermometer, glucose strips, glasses, walking stick",
          "Keep meds COOL: insulin & some meds degrade in 40°C — insulated pouch + frozen gel pack",
          "Heat protocol for 60+: hydrate hourly, ORS twice daily, no outdoor walks 11 AM–4 PM",
          "Medical records photocopied + allergy list + doctor numbers in the waterproof pouch",
          "Know the route to the nearest 24×7 hospital + one backup route (flood may block a road)",
        ])}
        </div><div class="imgbox"><img src="assets/meds.jpg" alt="Elderly care"><div class="price">🛒 <a href="https://www.amazon.in/s?k=digital+bp+monitor" target="_blank">Amazon BP monitor</a> · <a href="https://www.flipkart.com/search?q=weekly+pill+organizer" target="_blank">Flipkart pill box</a> · <a href="https://www.amazon.in/s?k=ors+packets" target="_blank">Amazon ORS</a></div></div></div>`,
      tools: () => checklist("tools", [
        "17-in-1 multitool (~₹400–800) + fixed knife",
        "10 m × 10 mm nylon rope + 3 m paracord; learn 3 knots (bowline, clove hitch, square)",
        "Duct tape ×2 + zip ties ×50 + 3×3 m tarp — instant patches",
        "Hammer, pliers, screwdriver set, spanner, hacksaw, utility knife",
        "Shovel + 10 sandbags (flood season)",
        "2 kg ABC fire extinguisher (~₹1,000) + smoke alarm (~₹400)",
        "Work gloves, safety goggles, N95 masks",
      ]),
      gobags: () => checklist("gobags", [
        "Each bag (≤8 kg): 3 L water, 3-day food, change of clothes, blanket, torch, whistle, power bank",
        "Adult add-ons: ₹2,000 cash, ID copies, pocket multitool, N95 masks",
        "Senior bag: 7-day meds, BP monitor, glasses, walking stick, comfort items",
        "Common bag: documents pouch, first aid kit, ₹5,000 cash, chargers, rope, tarp",
        "Car kit: 10 L water, blanket, tool kit, jumper cables, flashlight",
        "Check bags on the 1st of every month; swap expired food",
      ]),
      harden: () => checklist("harden", [
        "Board windows with 12 mm plywood + screws (pre-cut, stored)",
        "Reinforce roof; fix leaks before the season",
        "Trim overhanging tree branches (Apr–May & Oct–Nov)",
        "Tie down or bring in loose items — they become missiles at 150 km/h",
        "Sandbags at the door + clear roof drains/gutters before monsoon",
        "Know the main breaker; licensed wiring check before cyclone season",
        "Check home insurance covers cyclone/flood damage",
      ]),
      quake: () => `
        <div class="two"><div>
        ${checklist("quake", [
          "Odisha reality: Bhubaneswar zone II–III; this plan treats earthquake seriously everywhere zone ≥3",
          "DRILL: DROP to hands & knees → COVER under sturdy table → HOLD ON until shaking stops",
          "Safe spots: under heavy tables, inner walls; away from windows, mirrors, hanging lights",
          "Stay inside during shaking — never run out (falling debris); no lifts",
          "After: expect aftershocks; check gas (smell → open windows, no switches), check cracks",
          "NOW: secure bookshelves, TV, wardrobes to walls; heavy items off high shelves",
          "Zone ${c.quake} buildings: modern RCC is engineered for the zone — inside is safer than outside",
        ])}
        </div><div class="imgbox"><img src="assets/earthquake-drill.jpg" alt="Earthquake drill"><div class="price">30-minute task: practice the drill with parents until automatic — twice a year.</div></div></div>`,
      heat: () => checklist("heat", [
        "No outdoor activity 11 AM–4 PM; coolest room + fan (inverter = heat insurance)",
        "Hydration: 2.5–3 L/day; ORS twice daily on heat alerts; no alcohol/caffeine",
        "Home cooling without power: cross-ventilation at night, wet curtain, shade cloth on west windows",
        "Recognize heatstroke: hot dry skin, confusion, rapid pulse → cool immediately + call 112",
        "Store: 24 ORS packets, battery fans, ice packs; check parents every 2 hrs on red-alert days",
      ]),
      flood: () => checklist("flood", [
        "Sandbags at doors, valuables raised 1 ft+, vehicles to high ground, drains cleared",
        "NEVER walk/drive through moving water: 15 cm knocks you over, 60 cm floats a car",
        "Electrocution risk: cut main power BEFORE water enters; no switches with wet hands",
        "If water enters: power off first, move to a higher floor",
        "After: purify all water; check for snakes; disinfect floors/walls",
        "Know two exits from your area; keep the car above half fuel always",
      ]),
      docs: () => checklist("docs", [
        "Scan NOW: Aadhaar/PAN ×4, passports, bank, insurance, property papers, education certificates, prescriptions",
        "Store 3 ways: Google Drive/email · USB in go-bag · printed in waterproof pouch",
        "Cash: ₹5,000–10,000 small notes at home + ₹2,000 per go-bag",
        "Verify home insurance covers cyclone/flood; policy numbers digitized",
        "After a disaster: photograph all damage BEFORE cleaning (claims)",
      ]),
      diy: () => `
        <div class="diy-grid">
          ${[
            ["💧", "Bottle water filter", "cloth → charcoal → sand → gravel", "story-filter"],
            ["☀️", "Solar cooker", "foil box + black pot + glass", "solar-cooker"],
            ["🔥", "Rocket stove", "tin can + twigs, 70% less smoke", "cooking-nopower"],
            ["🧶", "3 rope knots", "bowline · clove hitch · square", "knots"],
            ["🏕️", "Tarp shelter", "3×3 tarp + rope between poles", "story-tarp"],
            ["🥤", "Home ORS", "1 L water + 6 tsp sugar + ½ tsp salt", "firstaid"],
            ["📡", "Signaling", "whistle ×3 (SOS) · mirror · bright cloth", "signal"],
            ["🪨", "Earthquake drill", "drop · cover · hold on", "story-quake"],
          ].map(d => `<div class="diy-card"><img src="assets/${d[3]}.jpg" alt="${d[1]}"><div class="dc-body"><b>${d[1]}</b><span>${d[2]}</span></div></div>`).join("")}
        </div>
        <p class="note">Practice 2 techniques per week — filter + ORS first. Ten minutes of practice beats an hour of reading during a disaster.</p>`,
      shop: () => `
        <div class="tiers">
          <div class="tier"><h4>₹5,000 · STARTER (week 1)</h4>${ul(["2× 20,000 mAh power banks", "2 lanterns + 2 torches", "Crank radio", "First aid kit + top-ups", "Aquatabs + 5× 5L bottles", "2-week dry food", "Whistles ×4, duct tape, matches", "Waterproof pouch"])}</div>
          <div class="tier"><h4>₹15,000 · FAMILY (month 1)</h4>${ul(["All starter items", "20 W solar panel", "Butane stove + 8 cylinders", "8× 20 L drums", "Multitool + rope + tarp", "Fire extinguisher + smoke alarm", "BP monitor + pill organizer", "Batteries, masks, gloves"])}</div>
          <div class="tier"><h4>₹30,000 · COMPLETE (month 2)</h4>${ul(["All family items", "Inverter/UPS + battery", "10 sandbags + shovel", "12 cans protein + milk powder", "Car emergency kit", "Window boards + brackets", "Extra lanterns + headlamps", "2-week medicine buffer"])}</div>
        </div>
        <p class="note">Find products: <b>amazon.in/s?k=&lt;item&gt;</b> and <b>flipkart.com/search?q=&lt;item&gt;</b>. Compare 2–3, take the mid-range. Search links never rot; prices stay live.</p>`,
      calendar: () => `
        <div class="weeks">
          <div class="week"><h4>WEEK 1 · BASICS (₹5k)</h4>${ul(["Day 1: scan & upload documents", "Day 2: power banks + lanterns + radio", "Day 3: first aid kit + tablets + bottles", "Day 4: stock 2-week pantry", "Day 5: waterproof pouch + cash", "Day 6: family plan + save 112", "Day 7: book first aid class"])}</div>
          <div class="week"><h4>WEEK 2 · WATER & COOKING (₹5k)</h4>${ul(["Buy 8× 20 L drums; fill & label", "Butane stove + 8 cylinders", "Build & test the DIY filter", "Practice rocket stove", "ORS ×24 + senior meds buffer", "Test crank radio reception", "Safe-room drill"])}</div>
          <div class="week"><h4>WEEK 3 · TOOLS & HARDENING (₹4k)</h4>${ul(["Multitool, knife, rope, tarp, tape", "Extinguisher + smoke alarm", "Trim trees / clear drains", "Pre-cut window boards", "Learn 3 knots", "Car kit", "Earthquake drill"])}</div>
          <div class="week"><h4>WEEK 4 · SENIORS & REVIEW (₹1k)</h4>${ul(["Assemble go-bags (4+1)", "Senior bag: meds, BP, glasses", "Insurance check + photos", "Full home drill", "Log in the tracking sheet", "Set monthly reminders", "🎉 Family is prepared"])}</div>
        </div>`,
    };

    return { city: c, risk, wL, sections, content };
  }

  function adaptLine(c) {
    const a = [];
    if (c.cyc >= 2) a.push("cyclone boarding + radio + evacuation drills emphasized");
    if (c.flood >= 2) a.push("water storage boosted to " + waterLitres(c) + " L, sandbags + two exits");
    if (c.quake >= 4) a.push("earthquake section moved up — secure furniture first");
    if (c.heat >= 2) a.push("heatwave protocol for elders is a priority");
    if (c.tsu >= 2) a.push("coastal: know the surge-evacuation route inland");
    return a.length ? a.join(" · ") : "low-hazard location — the core kit (water, food, power, first aid, go-bags) still applies";
  }

  /* ---------- render helpers ---------- */
  function ul(items) { return "<ul>" + items.map(i => `<li>${i}</li>`).join("") + "</ul>"; }
  function checklist(key, items) {
    const saved = store.get("chk_" + key, {});
    return `<ul class="chk">${items.map((it, i) => {
      const id = key + "_" + i;
      const on = saved[id] ? " checked" : "";
      return `<li class="chk-item${on}"><input type="checkbox" id="${id}" data-chk="${key}"${on}><label for="${id}">${it}</label></li>`;
    }).join("")}</ul>`;
  }

  function renderPlan() {
    if (!plan) return;
    const c = plan.city;
    document.title = "ReadyHome — " + c.n + ", " + c.s;
    $("resultHead").innerHTML = `
      <div class="eyebrow">Preparedness plan generated</div>
      <h2>${c.n}, ${c.s}</h2>
      <p class="sub">${riskChips(c)} · generated ${new Date().toLocaleDateString("en-IN")}</p>`;
    $("tabs").innerHTML = plan.sections.map(s =>
      `<button class="tab ${s.tag === "hazard" ? "haz" : ""}" data-sec="${s.id}"><span>${s.icon}</span>${s.title}</button>`).join("");
    $("tabs").querySelectorAll(".tab").forEach(t => t.onclick = () => showSection(t.dataset.sec));
    showSection(plan.sections[0].id);
    renderProgress();
  }

  function showSection(id) {
    const sec = plan.sections.find(s => s.id === id);
    if (!sec) return;
    document.querySelectorAll("#tabs .tab").forEach(t => t.classList.toggle("active", t.dataset.sec === id));
    $("secTitle").textContent = sec.icon + "  " + sec.title;
    $("secBody").innerHTML = plan.content[id]();
    $("secBody").querySelectorAll("input[data-chk]").forEach(cb => cb.onchange = () => {
      const saved = store.get("chk_" + cb.dataset.chk, {});
      saved[cb.id] = cb.checked;
      store.set("chk_" + cb.dataset.chk, saved);
      cb.parentElement.classList.toggle("checked", cb.checked);
      renderProgress();
    });
    $("planView").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderProgress() {
    const keys = {};
    document.querySelectorAll("#secBody input[data-chk]").forEach(cb => { keys[cb.dataset.chk] = true; });
    let done = 0, total = 0;
    Object.keys(keys).forEach(k => {
      const saved = store.get("chk_" + k, {});
      Object.values(saved).forEach(v => { total++; if (v) done++; });
    });
    // include all sections for a global count
    plan.sections.forEach(sec => {
      if (sec.id === "overview" || sec.id === "numbers") return;
      const saved = store.get("chk_" + sec.id, {});
      total += Object.keys(saved).length;
      done += Object.values(saved).filter(Boolean).length;
    });
    const pct = total ? Math.round(100 * done / total) : 0;
    $("progBar").style.width = pct + "%";
    $("progTxt").textContent = "Preparedness: " + pct + "%";
  }

  function downloadPlan() {
    if (!plan) return;
    const c = plan.city;
    let md = "# ReadyHome Plan — " + c.n + ", " + c.s + "\n\nGenerated " + new Date().toLocaleString("en-IN") + "\n\n";
    md += "## Risk profile\n" + Object.values(plan.risk).map(r => `- ${r.label}: ${["None/Low","Low","Moderate","High"][r.lvl]}`).join("\n") + "\n\n";
    plan.sections.forEach(sec => {
      if (sec.id === "overview" || sec.id === "numbers" || sec.id === "shop") return;
      md += "## " + sec.icon + " " + sec.title + "\n";
      const saved = store.get("chk_" + sec.id, {});
      const items = $("secBody") ? null : null;
      md += "\n";
    });
    // simpler: dump checklist state
    plan.sections.forEach(sec => {
      const saved = store.get("chk_" + sec.id, {});
      const entries = Object.entries(saved);
      if (!entries.length) return;
      md += "## " + sec.title + "\n";
      entries.forEach(([id, v]) => { md += "- [" + (v ? "x" : " ") + "] " + id.split("_").slice(1).join(" ") + "\n"; });
      md += "\n";
    });
    md += "\n_Source: ReadyHome India · government records (IMD/NDMA/BIS) are authoritative for official decisions_";
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ReadyHome-" + c.n.replace(/\s+/g, "-") + ".md";
    a.click();
  }

  /* ---------- events ---------- */
  function generate(q) {
    const c = resolveCity(q || $("locInput").value.trim());
    if (!c) {
      $("resultHead").innerHTML = `<h2>Location not found</h2><p class="sub">Try a nearby major city, or use "Use my location" (nearest covered city is matched).</p>`;
      $("tabs").innerHTML = ""; $("secBody").innerHTML = ""; $("planView").classList.add("hidden");
      return;
    }
    $("locInput").value = c.n + ", " + c.s;
    plan = buildPlan(c);
    $("planView").classList.remove("hidden");
    renderPlan();
  }

  function init() {
    $("locInput").addEventListener("input", e => renderSuggestions(e.target.value.trim()));
    $("locInput").addEventListener("keydown", e => { if (e.key === "Enter") { $("suggestions").classList.add("hidden"); generate(); } });
    $("goBtn").onclick = () => { $("suggestions").classList.add("hidden"); generate(); };
    $("geoBtn").onclick = () => {
      $("geoBtn").textContent = "Locating…";
      navigator.geolocation.getCurrentPosition(pos => {
        const c = nearestCity(pos.coords.latitude, pos.coords.longitude);
        $("geoBtn").textContent = "📍 Use my location";
        if (c) generate(c.n);
        else { $("locInput").value = "Location not covered — try a nearby city"; }
      }, () => {
        $("geoBtn").textContent = "📍 Use my location";
        alert("Location access denied. Type your city instead.");
      }, { timeout: 8000 });
    };
    $("printBtn").onclick = () => window.print();
    $("dlBtn").onclick = downloadPlan;
    $("resetBtn").onclick = () => {
      if (confirm("Reset all checklist progress?")) {
        Object.keys(localStorage).filter(k => k.startsWith("readyhome_chk_")).forEach(k => localStorage.removeItem(k));
        if (plan) renderPlan();
      }
    };
    renderSuggestions("");
    // default: Bhubaneswar (home)
    generate("Bhubaneswar");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
