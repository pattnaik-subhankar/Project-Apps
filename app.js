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

  /* ---------- curated video guides (YouTube, verified 2026-08) ---------- */
  const VIDEOS = {
    firstaid: { id: "BQNNOh8c8ks", t: "How to do CPR on an Adult", b: "St John Ambulance" },
    water: { id: "11qohzGPDzg", t: "Best Ways to Purify Water", b: "Warrior Poet Society" },
    tools: { id: "kCFRQHAxFys", t: "How to Tie a Bowline Knot", b: "How To Boating" },
    cooking: { id: "5kG9xxeU3UE", t: "Rocket Stove from Tin Cans", b: "The Lokey Lab" },
    harden: { id: "xNwo_a57KGc", t: "Safety From Cyclones While Indoors", b: "NDMA India" },
    quake: { id: "-MKMiFWK6Xk", t: "Drop, Cover & Hold On", b: "San Jose Fire Dept" },
    heat: { id: "jvGC_dQJUtE", t: "How to Treat Heat Stroke", b: "St John Ambulance" },
    flood: { id: "pi_nUPcQz_A", t: "How To Survive Floods?", b: "Dr Binocs Show" },
    gobags: { id: "4tfjFgZo2zo", t: "Build a 72-Hour Go-Bag", b: "365 Survival Things" },
  };
  function videoCard(k) {
    const v = VIDEOS[k];
    if (!v) return "";
    return `<a class="vidcard" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener" aria-label="Watch: ${v.t} on YouTube">
        <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="160" height="90">
        <span class="vplay">▶</span>
        <span class="vinfo"><b>Watch: ${v.t}</b><i>${v.b} · opens YouTube</i></span>
      </a>`;
  }
  function telLinks(s) {
    if (!s) return "";
    return s.split("·").map(function (part) {
      part = part.trim();
      const m = part.match(/(\d[\d\s-]{5,})$/);
      if (!m) return part;
      const num = m[1].replace(/[^0-9]/g, "");
      return part.slice(0, m.index).trim() + ' <a href="tel:' + num + '">' + m[1].trim() + "</a>";
    }).join(" · ");
  }

  /* ---------- quality buy list (Amazon.in direct product pages, Aug 2026) ---------- */
  const BUY = [
    { cat: "⚡", item: "Power bank 20,000 mAh", pick: "Xiaomi Power Bank 4i 33W", price: "₹1,749", url: "https://www.amazon.in/dp/B0DCZ3WDTB" },
    { cat: "⚡", item: "Rechargeable lantern (5000mAh + solar)", pick: "UDee Camping Lantern", price: "~₹900", url: "https://www.amazon.in/dp/B0DQY4NMBD" },
    { cat: "⚡", item: "Flashlight 1000 lm rechargeable", pick: "LED Tactical Torch (USB)", price: "~₹700", url: "https://www.amazon.in/dp/B0B66WNMGX" },
    { cat: "⚡", item: "Hand-crank radio + torch + power bank", pick: "Esky Solar Crank Radio", price: "~₹2,500", url: "https://www.amazon.in/dp/B01GRJZ1LK" },
    { cat: "⚡", item: "Headlamp 1000 lm", pick: "SLONIK CREE LED", price: "~₹1,200", url: "https://www.amazon.in/dp/B07D27L1NR" },
    { cat: "⚡", item: "20 W foldable solar panel", pick: "SUNGOOYUE USB", price: "₹5,998", url: "https://www.amazon.in/dp/B0C5MZ65M3" },
    { cat: "⚡", item: "AA batteries (10)", pick: "Duracell Alkaline", price: "~₹550", url: "https://www.amazon.in/dp/B0GV7HYCQX" },
    { cat: "💧", item: "20 L water drum with tap", pick: "Heavy-duty water jar", price: "~₹800", url: "https://www.amazon.in/dp/B0FBL3KQZL" },
    { cat: "💧", item: "5 L water containers", pick: "BESPORTBLE PC bucket", price: "~₹500", url: "https://www.amazon.in/dp/B092M5D542" },
    { cat: "💧", item: "Water purification tablets", pick: "Aquatabs 49mg (30)", price: "~₹400", url: "https://www.amazon.in/dp/B07DTSRB6S" },
    { cat: "🍳", item: "Butane camping stove (with cylinder)", pick: "2800 W portable stove", price: "₹499", url: "https://www.amazon.in/dp/B0DPCJ6GZL" },
    { cat: "🍳", item: "Butane canisters 220g (3-pack)", pick: "SHoRI high-pressure", price: "₹420", url: "https://www.amazon.in/dp/B0F63HVBLP" },
    { cat: "🍚", item: "Milk powder 1 kg", pick: "Nestlé Everyday", price: "₹615", url: "https://www.amazon.in/dp/B00NYZQX9A" },
    { cat: "🍚", item: "Energy bars (10-pack)", pick: "Yogabar Chocolate Chunk", price: "₹249", url: "https://www.amazon.in/dp/B00STGUN54" },
    { cat: "🍚", item: "Canned fish (4 tins)", pick: "Golden Prize Sardine", price: "~₹700", url: "https://www.amazon.in/dp/B0GCWSVQD5" },
    { cat: "🩹", item: "First aid kit (200 pcs)", pick: "Hospital-grade kit", price: "~₹600", url: "https://www.amazon.in/dp/B08CB1V4CH" },
    { cat: "🩹", item: "BP monitor", pick: "Omron HEM 7120", price: "₹1,849", url: "https://www.amazon.in/dp/B0DB5D2HK2" },
    { cat: "🩹", item: "ORS sachets (30)", pick: "Electral 21.8g", price: "₹598", url: "https://www.amazon.in/dp/B0CKVW61BH" },
    { cat: "🩹", item: "Weekly pill organizer (28 slots)", pick: "JimXen moisture-proof", price: "₹299", url: "https://www.amazon.in/dp/B098LX956V" },
    { cat: "🩹", item: "N95 masks (10)", pick: "3M 9502+", price: "₹536", url: "https://www.amazon.in/dp/B09PBZFRWZ" },
    { cat: "🛠️", item: "Fire extinguisher 2 kg ABC + mount", pick: "SAFE PRO", price: "~₹1,100", url: "https://www.amazon.in/dp/B082R1XQJ8" },
    { cat: "🛠️", item: "Smoke alarm (10-yr battery)", pick: "Kidde photoelectric", price: "~₹1,700", url: "https://www.amazon.in/dp/B0CT3W1WPM" },
    { cat: "🛠️", item: "Multitool 15-in-1 + sheath", pick: "AmazonBasics", price: "₹683", url: "https://www.amazon.in/dp/B07TP4WPGD" },
    { cat: "🛠️", item: "Duct tape heavy duty", pick: "AIPL waterproof", price: "₹168", url: "https://www.amazon.in/dp/B0D5R71FTN" },
    { cat: "🛠️", item: "Folding shovel", pick: "UDee entrenching tool", price: "~₹900", url: "https://www.amazon.in/dp/B0B51ST617" },
    { cat: "🛠️", item: "Tarp 3×3 m waterproof", pick: "SHANNA heavy duty", price: "~₹600", url: "https://www.amazon.in/dp/B0DGL3QVNM" },
    { cat: "🛠️", item: "Nylon rope 10 m × 10 mm", pick: "BSPS industrial-grade", price: "~₹350", url: "https://www.amazon.in/dp/B0BSNRWJD8" },
    { cat: "🛠️", item: "Sandbags (10)", pick: "Carrywell UV-protected", price: "~₹1,100", url: "https://www.amazon.in/dp/B0BVT9Y1D3" },
    { cat: "🛠️", item: "Cut-resistant gloves (pair)", pick: "Schwer ProGuard A9", price: "~₹1,300", url: "https://www.amazon.in/dp/B09N6LLDCR" },
    { cat: "🛠️", item: "Emergency whistle 7-in-1 kit", pick: "TrekEaze (LED + compass)", price: "₹224", url: "https://www.amazon.in/dp/B0CHJZDP7W" },
    { cat: "📄", item: "Waterproof A4 document pouch", pick: "ERITIN zipper pouch", price: "~₹250", url: "https://www.amazon.in/dp/B0FHLP88CC" },
    { cat: "🚗", item: "Car jumper cables 1000 A", pick: "AJIGNA copper-coated", price: "₹473", url: "https://www.amazon.in/dp/B0H6F5SJQ9" },
    { cat: "🔋", item: "Inverter 900 VA pure sinewave", pick: "Luminous Zelio+ 1100", price: "₹6,389", url: "https://www.amazon.in/dp/B01994DUMW" },
    { cat: "🔋", item: "Inverter + battery + trolley combo", pick: "Luminous Zelio 1100 + RC25000", price: "₹22,399", url: "https://www.amazon.in/dp/B09JSW7KSD" },
  ];

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

  /* ---------- seasonal awareness (calendar-based, works offline) ---------- */
  function seasonCallout(c) {
    const m = new Date().getMonth() + 1; // 1..12
    let t = "", pts = [];
    if (c.cyc >= 2 && ((m >= 4 && m <= 6) || (m >= 10 && m <= 12))) {
      t = "🌪️ Cyclone season is on";
      pts = ["Board/tape windows this week if not done", "Test the crank radio + charge power banks", "Confirm go-bags and the safe inner room", "Keep cash + documents pouch within reach"];
    } else if (c.flood >= 2 && m >= 6 && m <= 9) {
      t = "🌧️ Monsoon: flood readiness";
      pts = ["Clear roof drains & gutters now", "Sandbags at doors; valuables raised", "Keep the car above half fuel", "Know two exits from your area"];
    } else if (c.heat >= 2 && m >= 3 && m <= 6) {
      t = "☀️ Heatwave season";
      pts = ["Check parents twice daily 11 AM–4 PM", "ORS + battery fans + ice packs ready", "Shade cloth on west windows", "No outdoor walks for 60+ in peak heat"];
    } else if (m >= 11 || m <= 2) {
      t = "🧥 Winter check";
      pts = ["Warm blankets + clothes in go-bags", "Test fire extinguisher + smoke alarm", "Review pantry rotation"];
    } else {
      t = "📋 Month-end readiness";
      pts = ["Go-bag check on the 1st", "Rotate 6-month-old pantry stock", "Review your family drill"];
    }
    return `<div class="seasonal"><b>${t}</b>${ul(pts)}</div>`;
  }

  /* ---------- live IMD alerts (official CAP feed, CORS-open) ---------- */
  const ALERTS_URL = "https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml";
  let alertsCache = null;
  async function fetchAlerts() {
    try {
      const cached = store.get("alerts", null);
      if (cached && Date.now() - cached.t < 15 * 60000) { alertsCache = cached.list; renderAlerts(); return; }
      const res = await fetch(ALERTS_URL, { headers: { Accept: "application/rss+xml" } });
      if (!res.ok) return;
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const items = [...doc.querySelectorAll("item")].map(it => ({
        title: (it.querySelector("title") || {}).textContent || "",
        desc: (it.querySelector("description") || {}).textContent || "",
        cat: (it.querySelector("category") || {}).textContent || "",
        date: (it.querySelector("pubDate") || {}).textContent || "",
      }));
      store.set("alerts", { t: Date.now(), list: items });
      alertsCache = items;
      renderAlerts();
    } catch (e) { /* offline or blocked — seasonal callout still covers context */ }
  }
  function alertBanner(c) {
    if (!alertsCache || !alertsCache.length) return "";
    const stateTok = norm(c.s);
    const cityTok = norm(c.n);
    const hits = alertsCache.filter(a => {
      const hay = norm(a.title + " " + a.desc);
      return (stateTok && hay.includes(stateTok)) || (cityTok && hay.includes(cityTok));
    }).slice(0, 2);
    if (!hits.length) return "";
    return hits.map(a => `<div class="alertbanner"><b>⚠️ IMD active warning: ${a.title}</b><span>${a.desc} · issued ${(a.date || "").slice(5, 16)}</span></div>`).join("");
  }
  function renderAlerts() {
    const slot = $("alertSlot");
    if (!slot || !plan) return;
    slot.innerHTML = alertBanner(plan.city);
  }

  /* ---------- kit & expiry tracker ---------- */
  function kitHTML() {
    return `
      <div class="kitbox">
        <form id="kitForm" class="kit-form" autocomplete="off">
          <input id="kitName" placeholder="Item — e.g. Aquatabs 30pk, Dal 5kg, Batteries" required maxlength="60">
          <select id="kitCat">
            <option>Water</option><option>Food</option><option>Power</option><option>First aid</option><option>Tools</option><option>Other</option>
          </select>
          <input id="kitExp" type="date" required>
          <button class="btn primary" type="submit">+ Add</button>
        </form>
        <div id="kitList"></div>
        <p class="note">Rotate: eat the oldest stock first. Expired ≠ useless — check quality, but dispose expired medicines safely. Your tracker lives only in this browser.</p>
      </div>`;
  }
  function daysLeft(iso) {
    const t = new Date(iso + "T00:00:00");
    if (isNaN(t)) return null;
    return Math.ceil((t - new Date(new Date().toDateString())) / 86400000);
  }
  function renderKit() {
    const box = $("kitList");
    if (!box) return;
    const items = store.get("kit", []);
    if (!items.length) { box.innerHTML = `<p class="kit-empty">Nothing tracked yet — add your first kit item above (food, water tablets, batteries, medicines…).</p>`; return; }
    const sorted = items.slice().sort((a, b) => (a.e || "9999").localeCompare(b.e || "9999"));
    box.innerHTML = sorted.map((it, i) => {
      const d = daysLeft(it.e);
      let badge = "";
      if (d === null) badge = `<span class="kit-badge ok">no date</span>`;
      else if (d < 0) badge = `<span class="kit-badge exp">expired ${-d}d ago</span>`;
      else if (d <= 30) badge = `<span class="kit-badge soon">${d}d left</span>`;
      else badge = `<span class="kit-badge ok">ok · ${d}d</span>`;
      const cat = it.c || "Other";
      return `<div class="kit-item ${d !== null && d < 0 ? "is-exp" : d !== null && d <= 30 ? "is-soon" : ""}">
        <span class="kit-cat">${cat}</span>
        <b>${it.n}</b>
        <span class="kit-date">${it.e}</span>
        ${badge}
        <button class="kit-rm" data-i="${i}" aria-label="Remove ${it.n}">✕</button>
      </div>`;
    }).join("");
  }
  function kitAdd(n, c, e) {
    const items = store.get("kit", []);
    items.push({ n: n.trim(), c, e });
    store.set("kit", items.slice(-100));
    renderKit();
  }
  function kitRemove(idx) {
    const items = store.get("kit", []);
    items.splice(idx, 1);
    store.set("kit", items);
    renderKit();
  }

  /* ---------- 3-minute evacuation drill ---------- */
  const DRILL_ITEMS = ["Grab your go-bag", "Fill 2 containers with water", "Charge both power banks", "Collect documents pouch + cash", "Switch off main power (practice)", "Move to the safe inner room", "Whistle 3 times (signal practice)"];
  let drillTimer = null, drillEnd = 0;
  function lastDrillText() {
    try {
      const d = localStorage.getItem("readyhome_last_drill");
      return d ? "Last drill: " + new Date(d).toLocaleDateString("en-IN") : "No drill yet — try one today";
    } catch (e) { return ""; }
  }
  function openDrill() {
    const m = $("drillModal"); if (!m) return;
    m.classList.remove("hidden");
    $("drillTimer").textContent = "3:00";
    $("drillList").innerHTML = DRILL_ITEMS.map((it, i) => `<li><label><input type="checkbox" data-i="${i}"> ${it}</label></li>`).join("");
    $("drillDone").classList.add("hidden");
    $("drillStart").textContent = "▶ Start drill";
    $("drillStart").disabled = false;
  }
  function closeDrill() {
    const m = $("drillModal"); if (m) m.classList.add("hidden");
    if (drillTimer) { clearInterval(drillTimer); drillTimer = null; }
  }
  function startDrill() {
    const btn = $("drillStart"); if (!btn) return;
    btn.disabled = true; btn.textContent = "Drill running…";
    drillEnd = Date.now() + 180000;
    drillTimer = setInterval(function () {
      const left = Math.max(0, drillEnd - Date.now());
      const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
      $("drillTimer").textContent = mm + ":" + String(ss).padStart(2, "0");
      if (left === 0) {
        clearInterval(drillTimer); drillTimer = null;
        $("drillDone").classList.remove("hidden");
        try { localStorage.setItem("readyhome_last_drill", new Date().toISOString()); } catch (e) {}
        const ld = $("lastDrill"); if (ld) ld.textContent = "Last drill: " + new Date().toLocaleDateString("en-IN");
        btn.textContent = "▶ Run again"; btn.disabled = false;
      }
    }, 250);
  }
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
      { id: "kit", icon: "🧰", title: "Kit & expiry tracker", tag: "core" },
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
        ${seasonCallout(c)}
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
          ${NATIONAL_EMG.map(e => `<div class="emg-card"><b><a href="tel:${e[0]}">${e[0]}</a></b><span>${e[1]}</span></div>`).join("")}
          ${c.emg ? `<div class="emg-card wide"><b>${telLinks(c.emg.split("·")[0].trim())}</b><span>${telLinks(c.emg.split("·").slice(1).join(" · ").trim()) || "State emergency contact"}</span></div>` : ""}
        </div>
        <div class="callrow">
          <a class="callbtn" href="tel:112">📞 Call 112</a>
          <a class="callbtn" href="tel:1078">📞 NDMA 1078</a>
        </div>
        <p class="note">Save <b>112</b> as ICE on every family phone. Print this section and pin it near the door. Phones die in disasters — paper doesn't.</p>`,
      family: () => `
        <div class="drillbar">
          <button id="drillBtn" class="btn primary">🏃 Run a 3-minute drill</button>
          <span id="lastDrill" class="drill-last">${lastDrillText()}</span>
        </div>
        ${checklist("family", [
        "Assign roles: commander (power/go-bags), food & water, documents & cash, medical kit",
        "Meeting points: (A) strongest inner room · (B) open ground nearby · (C) out-of-city relative",
        "Pick one relative outside the state as the check-in line (SMS works when calls fail)",
        "Full home drill every 3 months · go-bag check on the 1st of every month",
        "Elderly plan: one adult always knows where parents' meds are",
      ])}`,
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
        ${videoCard("water")}
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
        ${videoCard("cooking")}
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
        ${videoCard("firstaid")}
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
      ]) + videoCard("tools"),
      gobags: () => checklist("gobags", [
        "Each bag (≤8 kg): 3 L water, 3-day food, change of clothes, blanket, torch, whistle, power bank",
        "Adult add-ons: ₹2,000 cash, ID copies, pocket multitool, N95 masks",
        "Senior bag: 7-day meds, BP monitor, glasses, walking stick, comfort items",
        "Common bag: documents pouch, first aid kit, ₹5,000 cash, chargers, rope, tarp",
        "Car kit: 10 L water, blanket, tool kit, jumper cables, flashlight",
        "Check bags on the 1st of every month; swap expired food",
      ]) + videoCard("gobags"),
      harden: () => checklist("harden", [
        "Board windows with 12 mm plywood + screws (pre-cut, stored)",
        "Reinforce roof; fix leaks before the season",
        "Trim overhanging tree branches (Apr–May & Oct–Nov)",
        "Tie down or bring in loose items — they become missiles at 150 km/h",
        "Sandbags at the door + clear roof drains/gutters before monsoon",
        "Know the main breaker; licensed wiring check before cyclone season",
        "Check home insurance covers cyclone/flood damage",
      ]) + videoCard("harden"),
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
        ${videoCard("quake")}
        </div><div class="imgbox"><img src="assets/earthquake-drill.jpg" alt="Earthquake drill"><div class="price">30-minute task: practice the drill with parents until automatic — twice a year.</div></div></div>`,
      heat: () => checklist("heat", [
        "No outdoor activity 11 AM–4 PM; coolest room + fan (inverter = heat insurance)",
        "Hydration: 2.5–3 L/day; ORS twice daily on heat alerts; no alcohol/caffeine",
        "Home cooling without power: cross-ventilation at night, wet curtain, shade cloth on west windows",
        "Recognize heatstroke: hot dry skin, confusion, rapid pulse → cool immediately + call 112",
        "Store: 24 ORS packets, battery fans, ice packs; check parents every 2 hrs on red-alert days",
      ]) + videoCard("heat"),
      flood: () => checklist("flood", [
        "Sandbags at doors, valuables raised 1 ft+, vehicles to high ground, drains cleared",
        "NEVER walk/drive through moving water: 15 cm knocks you over, 60 cm floats a car",
        "Electrocution risk: cut main power BEFORE water enters; no switches with wet hands",
        "If water enters: power off first, move to a higher floor",
        "After: purify all water; check for snakes; disinfect floors/walls",
        "Know two exits from your area; keep the car above half fuel always",
      ]) + videoCard("flood"),
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
      kit: () => kitHTML(),
      shop: () => `
        <p class="note"><b>Quality bar:</b> known brands, 3.8★+, mid-range value picks — no cheap junk. Prices ≈ Aug 2026; always check the live price before buying.</p>
        <div class="buy-wrap">
          <table class="buy-table">
            <thead><tr><th>Item</th><th>Quality pick</th><th>~Price</th><th></th></tr></thead>
            <tbody>
              ${BUY.map(b => `<tr><td class="bi">${b.cat} ${b.item}</td><td>${b.pick}</td><td class="pr">${b.price}</td><td><a class="buy" target="_blank" rel="noopener" href="${b.url}">Buy →</a></td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="tiers">
          <div class="tier"><h4>₹5,000 · STARTER (week 1)</h4>${ul(["2× Xiaomi power banks", "UDee lantern + Cloyster flashlight", "Esky crank radio", "First aid kit + Aquatabs + bottles", "2-week dry food + Yogabar", "Whistles, duct tape, pouch"])}</div>
          <div class="tier"><h4>₹15,000 · FAMILY (month 1)</h4>${ul(["Starter items + SUNGOOYUE solar panel", "Butane stove + SHoRI canisters", "8× 20 L drums", "AmazonBasics multitool + rope + tarp", "SAFE PRO extinguisher + Kidde alarm", "Omron BP monitor + pill organizer"])}</div>
          <div class="tier"><h4>₹30,000 · COMPLETE (month 2)</h4>${ul(["Family items + Luminous inverter combo", "10 sandbags + UDee shovel", "Golden Prize cans + Everyday powder", "Car jumper cables + glovebox kit", "Window boards + brackets", "2-week medicine buffer + 3M masks"])}</div>
        </div>
        <p class="note">Links open Amazon.in product pages directly. Prices move — the table is a shopping guide, not a quote.</p>`,
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
    renderAlerts();
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

  function sectionTotals() {
    if (plan._totals) return plan._totals;
    const t = {};
    plan.sections.forEach(function (sec) {
      try {
        const div = document.createElement("div");
        div.innerHTML = plan.content[sec.id]();
        t[sec.id] = div.querySelectorAll("input[data-chk]").length;
      } catch (e) { t[sec.id] = 0; }
    });
    plan._totals = t;
    return t;
  }
  function renderProgress() {
    const totals = sectionTotals();
    let done = 0, total = 0;
    Object.keys(totals).forEach(function (k) {
      if (k === "overview" || k === "numbers") return;
      total += totals[k];
      const saved = store.get("chk_" + k, {});
      Object.values(saved).forEach(function (v) { if (v) done++; });
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
      try {
        const div = document.createElement("div");
        div.innerHTML = plan.content[sec.id]();
        const saved = store.get("chk_" + sec.id, {});
        div.querySelectorAll("input[data-chk]").forEach(function (cb) {
          const label = cb.parentElement && cb.parentElement.querySelector("label") ? cb.parentElement.querySelector("label").innerText : cb.id;
          const done = cb.checked || !!saved[cb.id];
          md += "- [" + (done ? "x" : " ") + "] " + label + "\n";
        });
      } catch (e) {}
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
    $("locInput").addEventListener("focus", function () { this.select(); });
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
    document.addEventListener("click", function (e) {
      const t = e.target;
      if (t.closest && t.closest("#drillBtn")) openDrill();
      else if (t.closest && t.closest("#drillClose")) closeDrill();
      else if (t.closest && t.closest("#drillStart")) startDrill();
      else if (t.closest && t.closest(".kit-rm")) { kitRemove(+t.closest(".kit-rm").dataset.i); }
    });
    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "kitForm") {
        e.preventDefault();
        const n = $("kitName").value.trim();
        const c = $("kitCat").value;
        const ex = $("kitExp").value;
        if (n && ex) { kitAdd(n, c, ex); $("kitName").value = ""; $("kitExp").value = ""; }
      }
    });
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
    fetchAlerts();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
