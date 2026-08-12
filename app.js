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

  /* ---------- i18n (en/hi shipped; od/ta slot in as data) ---------- */
  let lang = store.get("lang") || "en";
  let noScroll = false;
  const L = {
    en: {
      brand_sub: "Disaster preparedness, personalised",
      print: "🖨 Print / PDF", dl: "⬇ Plan (.md)", link: "🔗 Link", share: "📲 Share", reset: "↺ Reset",
      hero_eyebrow: "Cyclones · Floods · Heatwaves · Earthquakes · Power outages",
      hero_h1a: "Your city. Your risks.", hero_h1b: "A complete preparedness plan in seconds.",
      hero_lede: "Type any major Indian city — ReadyHome maps its real disaster profile (cyclone, flood, seismic zone, heatwave) and builds the full plan: what to stock, what to do in the first 72 hours, how to harden your home, and how to protect your family — including elderly parents.",
      loc_ph: "Type your city — e.g. Bhubaneswar, Chennai, Patna…",
      generate: "Generate plan →", geo: "📍 Use my location", geo_locating: "Locating…",
      hero_note: "45+ Indian cities covered · profiles from IMD / NDMA / BIS zone maps · for exact decisions, official government sources remain authoritative",
      howto_eyebrow: "How it works", howto_title: "Your family prepared, in 7 steps",
      guide_1_t: "Open ReadyHome", guide_1_l: "Works on any phone or laptop, no sign-up",
      guide_2_t: "Type your city", guide_2_l: "60+ cities & towns mapped — or use your location",
      guide_3_t: "Review your risk profile", guide_3_l: "Cyclone, flood, seismic zone, heatwave — your city’s real risks",
      guide_4_t: "Make the family plan", guide_4_l: "Roles, meeting points, elderly care, out-of-city contact",
      guide_5_t: "Build your kit", guide_5_l: "Tiered shopping list with direct product links",
      guide_6_t: "Practice the skills", guide_6_l: "DIY techniques: filter, knots, stove, CPR — with drawings",
      guide_7_t: "Refresh every month", guide_7_l: "Go-bag check on the 1st, drills every quarter — checklists track your progress automatically",
      prog: "Preparedness: {p}%", prog_hint: "checklists save automatically",
      risk_cyc: "Cyclone", risk_flood: "Flood / waterlogging", risk_quake: "Earthquake (zone {z})", risk_heat: "Heatwave", risk_tsu: "Tsunami / surge",
      lvl_high: "HIGH", lvl_mod: "MODERATE", lvl_low: "LOW",
      sec_overview: "Your risk profile", sec_numbers: "Emergency numbers", sec_family: "Family plan", sec_h72: "First 72 hours", sec_sustain: "Two-week sustain", sec_water: "Water", sec_food: "Food", sec_cooking: "Cooking without power", sec_power: "Power & light", sec_firstaid: "First aid", sec_health: "Health & elderly", sec_tools: "Tools & gear", sec_gobags: "Go-bags", sec_kit: "Kit & expiry tracker", sec_harden: "Home hardening", sec_quake: "Earthquake drill", sec_heat: "Heatwave", sec_flood: "Flood", sec_docs: "Documents & money", sec_diy: "DIY survival tactics", sec_shop: "Shopping list", sec_calendar: "30-day build",
      chip_cyclone: "cyclone", chip_flood: "flood", chip_heat: "heat", chip_eq: "EQ zone {z}", chip_none: "low hazard",
      alert_warn: "⚠️ IMD active warning", alert_area: "Your area", alert_state: "Your state", alert_reg: "Regional",
      season_cyc: "🌪️ Cyclone season is on", season_flood: "🌧️ Monsoon: flood readiness", season_heat: "☀️ Heatwave season", season_winter: "🧥 Winter check", season_month: "📋 Month-end readiness",
      generated: "Preparedness plan generated", notfound: "Location not found", notfound_sub: "Try a nearby major city, or use \"Use my location\" (nearest covered city is matched).",
      drill_head: "🏃 3-minute evacuation drill", drill_start: "▶ Start drill", drill_run: "Drill running…", drill_again: "▶ Run again", drill_done: "✅ Done! Review what took longest, then fix it.", last_drill: "Last drill: {d}", no_drill: "No drill yet — try one today",
      kit_ph: "Item — e.g. Aquatabs 30pk, Dal 5kg, Batteries", kit_cat_water: "Water", kit_cat_food: "Food", kit_cat_power: "Power", kit_cat_first: "First aid", kit_cat_tools: "Tools", kit_cat_other: "Other", kit_add: "+ Add", kit_empty: "Nothing tracked yet — add your first kit item above (food, water tanks, batteries, medicines).", kit_no_date: "no date", kit_expired: "expired {d}d ago", kit_dleft: "{d}d left", kit_ok: "ok · {d}d", kit_note: "Rotate: eat the oldest stock first. Expired ≠ useless — check quality, but dispose expired medicines safely. Your tracker lives only in this browser.",
      geo_not_covered: "Location not covered — try a nearby city", geo_denied: "Location access denied. Type your city instead.", reset_confirm: "Reset all checklist progress?", copied: "✅ Copied",
      lang_note: "हिंदी translation in progress — checklist content remains in English",
      footer_brand: "ReadyHome India", footer_vent: " · a venture under the project-agents repository · Built Aug 2026.", footer_disclaimer: "Risk profiles are indicative (IMD/NDMA/BIS zone maps, state disaster records). Always follow official evacuation orders — 112 for any emergency, 1078 for disasters. Nothing here replaces government advisories.",
    },
    hi: {
      brand_sub: "आपदा तैयारी, आपके लिए",
      print: "🖨 प्रिंट / PDF", dl: "⬇ प्लान (.md)", link: "🔗 लिंक", share: "📲 शेयर", reset: "↺ रीसेट",
      hero_eyebrow: "चक्रवात · बाढ़ · लू · भूकंप · बिजली गुल",
      hero_h1a: "आपका शहर। आपके जोखिम।", hero_h1b: "सेकंडों में पूरी तैयारी की योजना।",
      hero_lede: "कोई भी बड़ा भारतीय शहर लिखें — ReadyHome उसकी असली आपदा प्रोफ़ाइल (चक्रवात, बाढ़, भूकंप क्षेत्र, लू) पहचानता है और पूरी योजना बनाता है: क्या रखें, पहले 72 घंटों में क्या करें, घर को कैसे मज़बूत करें, और परिवार — बुज़ुर्ग माता-पिता सहित — की सुरक्षा कैसे करें।",
      loc_ph: "अपना शहर लिखें — जैसे भुवनेश्वर, चेन्नई, पटना…",
      generate: "प्लान बनाएं →", geo: "📍 मेरी लोकेशन", geo_locating: "लोकेशन मिल रही है…",
      hero_note: "45+ भारतीय शहर कवर · प्रोफ़ाइल IMD / NDMA / BIS ज़ोन मानचित्र से · सटीक फ़ैसलों के लिए सरकारी स्रोत ही मान्य हैं",
      howto_eyebrow: "कैसे काम करता है", howto_title: "आपका परिवार तैयार, 7 चरणों में",
      guide_1_t: "ReadyHome खोलें", guide_1_l: "किसी भी फ़ोन या लैपटॉप पर चलता है, साइन-अप नहीं",
      guide_2_t: "अपना शहर लिखें", guide_2_l: "60+ शहर मैप किए गए — या अपनी लोकेशन इस्तेमाल करें",
      guide_3_t: "अपनी जोखिम प्रोफ़ाइल देखें", guide_3_l: "चक्रवात, बाढ़, भूकंप क्षेत्र, लू — आपके शहर के असली जोखिम",
      guide_4_t: "परिवार की योजना बनाएं", guide_4_l: "भूमिकाएँ, मिलने की जगह, बुज़ुर्गों की देखभाल, शहर से बाहर संपर्क",
      guide_5_t: "अपना किट बनाएं", guide_5_l: "सीधे प्रोडक्ट लिंक के साथ चरणबद्ध खरीदारी सूची",
      guide_6_t: "हुनर का अभ्यास करें", guide_6_l: "DIY तकनीकें: फ़िल्टर, गाँठ, चूल्हा, CPR — चित्रों के साथ",
      guide_7_t: "हर महीने ताज़ा करें", guide_7_l: "1 तारीख को गो-बैग जाँच, हर तिमाही अभ्यास — चेकलिस्ट अपने-आप प्रगति ट्रैक करती है",
      prog: "तैयारी: {p}%", prog_hint: "चेकलिस्ट अपने-आप सेव होती है",
      risk_cyc: "चक्रवात", risk_flood: "बाढ़ / जलभराव", risk_quake: "भूकंप (ज़ोन {z})", risk_heat: "लू (हीटवेव)", risk_tsu: "सुनामी / लहर",
      lvl_high: "उच्च", lvl_mod: "मध्यम", lvl_low: "कम",
      sec_overview: "आपकी जोखिम प्रोफ़ाइल", sec_numbers: "आपातकालीन नंबर", sec_family: "परिवार योजना", sec_h72: "पहले 72 घंटे", sec_sustain: "दो सप्ताह की तैयारी", sec_water: "पानी", sec_food: "खाना", sec_cooking: "बिना बिजली खाना पकाना", sec_power: "बिजली और रोशनी", sec_firstaid: "प्राथमिक चिकित्सा", sec_health: "स्वास्थ्य और बुज़ुर्ग", sec_tools: "औज़ार और सामान", sec_gobags: "गो-बैग", sec_kit: "किट और एक्सपायरी ट्रैकर", sec_harden: "घर मज़बूत करना", sec_quake: "भूकंप अभ्यास", sec_heat: "लू (हीटवेव)", sec_flood: "बाढ़", sec_docs: "दस्तावेज़ और पैसे", sec_diy: "DIY उत्तरजीविता तकनीक", sec_shop: "खरीदारी सूची", sec_calendar: "30-दिन की योजना",
      chip_cyclone: "चक्रवात", chip_flood: "बाढ़", chip_heat: "लू", chip_eq: "भूकंप ज़ोन {z}", chip_none: "कम जोखिम",
      alert_warn: "⚠️ IMD सक्रिय चेतावनी", alert_area: "आपका क्षेत्र", alert_state: "आपका राज्य", alert_reg: "क्षेत्रीय",
      season_cyc: "🌪️ चक्रवात का मौसम चल रहा है", season_flood: "🌧️ मानसून: बाढ़ की तैयारी", season_heat: "☀️ लू का मौसम", season_winter: "🧥 सर्दी की जाँच", season_month: "📋 महीने के अंत की तैयारी",
      generated: "तैयारी की योजना बन गई", notfound: "शहर नहीं मिला", notfound_sub: "पास का कोई बड़ा शहर आज़माएं, या \"मेरी लोकेशन\" इस्तेमाल करें (सबसे नज़दीकी कवर शहर मिलेगा)।",
      drill_head: "🏃 3 मिनट का निकासी अभ्यास", drill_start: "▶ अभ्यास शुरू करें", drill_run: "अभ्यास चल रहा है…", drill_again: "▶ फिर चलाएं", drill_done: "✅ हो गया! सबसे ज़्यादा समय लेने वाली चीज़ देखें, फिर सुधारें।", last_drill: "आख़िरी अभ्यास: {d}", no_drill: "अभी तक कोई अभ्यास नहीं — आज एक करें",
      kit_ph: "सामान — जैसे Aquatabs 30pk, दाल 5kg, बैटरी", kit_cat_water: "पानी", kit_cat_food: "खाना", kit_cat_power: "बिजली", kit_cat_first: "प्राथमिक चिकित्सा", kit_cat_tools: "औज़ार", kit_cat_other: "अन्य", kit_add: "+ जोड़ें", kit_empty: "अभी कुछ नहीं जोड़ा गया — ऊपर अपना पहला किट सामान जोड़ें (खाना, पानी टैंक, बैटरी, दवाइयाँ)।", kit_no_date: "कोई तारीख नहीं", kit_expired: "{d} दिन पहले एक्सपायर", kit_dleft: "{d} दिन बाकी", kit_ok: "ठीक · {d} दिन", kit_note: "घुमाएँ: पहले सबसे पुराना स्टॉक खाएँ। एक्सपायर का मतलब बेकार नहीं — गुणवत्ता जाँचें, पर एक्सपायर दवाइयाँ सुरक्षित तरीके से नष्ट करें। आपका ट्रैकर केवल इसी ब्राउज़र में रहता है।",
      geo_not_covered: "लोकेशन कवर नहीं है — पास का शहर आज़माएं", geo_denied: "लोकेशन की अनुमति नहीं मिली। अपना शहर लिखें।", reset_confirm: "सारी चेकलिस्ट प्रगति रीसेट करें?", copied: "✅ कॉपी हुआ",
      lang_note: "हिंदी अनुवाद जारी है — चेकलिस्ट की सामग्री अभी अंग्रेज़ी में है",
      footer_brand: "ReadyHome India", footer_vent: " · project-agents रिपॉज़िटरी का एक वेंचर · अगस्त 2026 में बना", footer_disclaimer: "जोखिम प्रोफ़ाइल संकेतात्मक हैं (IMD/NDMA/BIS ज़ोन मानचित्र, राज्य आपदा रिकॉर्ड)। हमेशा आधिकारिक निकासी आदेशों का पालन करें — किसी भी आपात स्थिति के लिए 112, आपदाओं के लिए 1078। यहाँ कुछ भी सरकारी सलाह की जगह नहीं लेता।",
    },
  };
  function t(k, v) {
    let s = (L[lang] && L[lang][k]) || L.en[k] || k;
    if (v) Object.keys(v).forEach(x => { s = s.split("{" + x + "}").join(v[x]); });
    return s;
  }
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    const active = plan ? ((document.querySelector("#tabs .tab.active") || {}).dataset || {}).sec : null;
    if (plan) {
      noScroll = true;
      plan = buildPlan(plan.city);
      renderPlan();
      if (active && plan.sections.some(s => s.id === active)) showSection(active);
      noScroll = false;
    }
  }

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
    if (c.cyc >= 3) parts.push(t("chip_cyclone"));
    if (c.flood >= 3) parts.push(t("chip_flood"));
    if (c.quake >= 4) parts.push(t("chip_eq", { z: c.quake }));
    if (c.heat >= 3) parts.push(t("chip_heat"));
    return parts.join(" · ") || t("chip_none");
  }

  /* ---------- plan generation ---------- */
  function genRisk(c) {
    return {
      cyc: { label: t("risk_cyc"), lvl: c.cyc, cls: riskCls(c.cyc) },
      flood: { label: t("risk_flood"), lvl: c.flood, cls: riskCls(c.flood) },
      quake: { label: t("risk_quake", { z: c.quake }), lvl: c.quake >= 4 ? 3 : c.quake >= 3 ? 2 : 1, cls: c.quake >= 4 ? "high" : c.quake >= 3 ? "med" : "low" },
      heat: { label: t("risk_heat"), lvl: c.heat, cls: riskCls(c.heat) },
      tsu: { label: t("risk_tsu"), lvl: c.tsu, cls: riskCls(c.tsu) },
    };
  }
  function riskCls(l) { return l >= 3 ? "high" : l === 2 ? "med" : "low"; }

  function waterLitres(c) { return c.flood >= 2 ? 240 : 225; } // flood areas store a bit more

  /* ---------- seasonal awareness (calendar-based, works offline) ---------- */
  function seasonCallout(c) {
    const m = new Date().getMonth() + 1; // 1..12
    let title = "", pts = [];
    if (c.cyc >= 2 && ((m >= 4 && m <= 6) || (m >= 10 && m <= 12))) {
      title = t("season_cyc");
      pts = ["Board/tape windows this week if not done", "Test the crank radio + charge power banks", "Confirm go-bags and the safe inner room", "Keep cash + documents pouch within reach"];
    } else if (c.flood >= 2 && m >= 6 && m <= 9) {
      title = t("season_flood");
      pts = ["Clear roof drains & gutters now", "Sandbags at doors; valuables raised", "Keep the car above half fuel", "Know two exits from your area"];
    } else if (c.heat >= 2 && m >= 3 && m <= 6) {
      title = t("season_heat");
      pts = ["Check parents twice daily 11 AM–4 PM", "ORS + battery fans + ice packs ready", "Shade cloth on west windows", "No outdoor walks for 60+ in peak heat"];
    } else if (m >= 11 || m <= 2) {
      title = t("season_winter");
      pts = ["Warm blankets + clothes in go-bags", "Test fire extinguisher + smoke alarm", "Review pantry rotation"];
    } else {
      title = t("season_month");
      pts = ["Go-bag check on the 1st", "Rotate 6-month-old pantry stock", "Review your family drill"];
    }
    return `<div class="seasonal"><b>${title}</b>${ul(pts)}</div>`;
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
      const now = Date.now();
      const items = [];
      for (const it of doc.querySelectorAll("item")) {
        const item = {
          title: (it.querySelector("title") || {}).textContent || "",
          desc: (it.querySelector("description") || {}).textContent || "",
          cat: (it.querySelector("category") || {}).textContent || "",
          date: (it.querySelector("pubDate") || {}).textContent || "",
          sev: null,
          areas: null,
          link: (it.querySelector("link") || {}).textContent || "",
        };
        const ts = item.date ? new Date(item.date).getTime() : NaN;
        if (!isNaN(ts) && (now - ts) > 72 * 3600000) continue; // skip stale before detail fetch
        if (item.link && item.link.endsWith(".xml")) {
          try {
            const cap = await (await fetch(item.link)).text();
            const sevM = cap.match(/<cap:severity>([^<]*)<\/cap:severity>/);
            if (sevM) item.sev = sevM[1].trim();
            item.areas = [...cap.matchAll(/<cap:areaDesc>([^<]*)<\/cap:areaDesc>/g)].map(m => m[1].trim());
          } catch (e) { /* detail fetch optional — title/desc matching still works */ }
        }
        items.push(item);
      }
      store.set("alerts", { t: Date.now(), list: items });
      alertsCache = items;
      renderAlerts();
    } catch (e) { /* offline or blocked — seasonal callout still covers context */ }
  }
  function alertSeverity(a) {
    const s = norm((a.sev || "") + " " + a.title + " " + a.desc);
    if (a.sev) {
      if (a.sev === "Extreme") return "extreme";
      if (a.sev === "Severe") return "high";
      if (a.sev === "Moderate") return "med";
      if (a.sev === "Minor") return "info";
    }
    if (s.includes("extremelyheavy") || s.includes("extreme") || s.includes("cyclone") || s.includes("stormsurge") || s.includes("torrential")) return "extreme";
    if (s.includes("veryheavy") || s.includes("heatwave") || s.includes("flashflood") || s.includes("landslide")) return "high";
    if (s.includes("heavy") || s.includes("thunderstorm") || s.includes("strongwind")) return "med";
    return "info";
  }
  function areaHits(a, stateTok, cityTok) {
    if (!a.areas || !a.areas.length) return null;
    const areaHay = norm(a.areas.join(" "));
    const hitCity = cityTok && areaHay.includes(cityTok);
    const hitState = stateTok && areaHay.includes(stateTok);
    if (hitCity || hitState) return { area: a.areas.join(", "), level: hitCity ? "city" : "state" };
    return null;
  }
  function alertBanner(c) {
    if (!alertsCache || !alertsCache.length) return "";
    const stateTok = norm(c.s);
    const cityTok = norm(c.n);
    const now = Date.now();
    const seen = new Set();
    const hits = [];
    for (const a of alertsCache) {
      const ts = a.date ? new Date(a.date).getTime() : NaN;
      if (!isNaN(ts) && (now - ts) > 72 * 3600000) continue; // only recent warnings
      const areaHit = areaHits(a, stateTok, cityTok);
      const hay = norm(a.title + " " + a.desc);
      const textHit = (stateTok && hay.includes(stateTok)) || (cityTok && hay.includes(cityTok));
      if (!areaHit && !textHit) continue;
      if (seen.has(a.title)) continue; // dedupe identical titles
      seen.add(a.title);
      const tag = areaHit ? (areaHit.level === "city" ? t("alert_area") : t("alert_state")) : t("alert_reg");
      hits.push({ a, tag });
      if (hits.length >= 2) break;
    }
    if (!hits.length) return "";
    return hits.map(({ a, tag }) => `<div class="alertbanner ${alertSeverity(a)}"><b>${t("alert_warn")} · ${tag}: ${a.title}</b><span>${a.desc} · issued ${(a.date || "").slice(5, 16)}</span></div>`).join("");
  }
  function renderAlerts() {
    const slot = $("alertSlot");
    if (!slot || !plan) return;
    slot.innerHTML = alertBanner(plan.city);
  }

  function mapCard(c) {
    const pts = (window.SHELTERS || {})[c.n] || [];
    const padLng = 0.22, padLat = 0.18;
    const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - padLng},${c.lat - padLat},${c.lng + padLng},${c.lat + padLat}&layer=mapnik&marker=${c.lat},${c.lng}`;
    const icons = { "Cyclone shelter": "🔺", "Emergency shelter": "🏠", "Hospital": "🏥", "Fire station": "🚒", "Police": "👮" };
    const rows = pts.slice(0, 8).map(p => `<div class="pt-row"><span class="pt-ic">${icons[p.cat] || "📍"}</span><b>${p.n}</b><span class="pt-meta">${p.cat} · ${p.d} km</span><a href="https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}" target="_blank" rel="noopener">map ↗</a></div>`).join("");
    return `<div class="mapcard">
      <div class="map-head"><b>🗺️ Map & shelter view</b><a href="${embed}" target="_blank" rel="noopener">Open in OSM ↗</a></div>
      <div class="mapframe" id="leafletMap" data-lat="${c.lat}" data-lng="${c.lng}" data-city="${c.n}"></div>
      ${pts.length ? `<div class="pt-table"><div class="pt-head"><b>Verified help points near ${c.n}</b><span>${pts.length} · OSM data</span></div>${rows}</div>` : `<p class="note">No verified help points near ${c.n} yet — use the shelter search links below.</p>`}
      <div class="map-links">
        <a href="https://www.openstreetmap.org/search?query=cyclone%20shelter%20near%20${encodeURIComponent(c.n)}" target="_blank" rel="noopener">Find cyclone shelters near ${c.n} (OSM)</a>
        <a href="https://www.google.com/maps/search/cyclone+shelter+${encodeURIComponent(c.n)}" target="_blank" rel="noopener">Google Maps</a>
      </div>
      <p class="note">Help points are curated from OpenStreetMap (2026-08). Shelter availability changes with the season — confirm with your district control room before an emergency. ${c.emg || ""}</p>
    </div>`;
  }
  function initLeaflet() {
    if (!plan) return;
    const el = document.getElementById("leafletMap");
    if (!el || el._leafletInit) return;
    if (typeof L === "undefined" || typeof L.map !== "function") { setTimeout(initLeaflet, 250); return; } // Leaflet still loading — retry
    const c = plan.city;
    const lat = +el.dataset.lat, lng = +el.dataset.lng;
    const m = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
    L.marker([lat, lng]).addTo(m).bindPopup("<b>" + c.n + "</b>");
    const pts = (window.SHELTERS || {})[c.n] || [];
    const icons = { "Cyclone shelter": "🔺", "Emergency shelter": "🏠", "Hospital": "🏥", "Fire station": "🚒", "Police": "👮" };
    pts.forEach(p => {
      L.marker([p.lat, p.lng]).addTo(m).bindPopup("<b>" + p.n + "</b><br>" + p.cat + " · " + p.d + " km");
    });
    if (pts.length > 1) {
      const bounds = L.latLngBounds(pts.map(p => [p.lat, p.lng]));
      bounds.extend([lat, lng]);
      m.fitBounds(bounds, { padding: [28, 28] });
    }
    el._leafletInit = true;
  }

  /* ---------- kit & expiry tracker ---------- */
  function kitHTML() {
    return `
      <div class="kitbox">
        <form id="kitForm" class="kit-form" autocomplete="off">
          <input id="kitName" placeholder="${t("kit_ph")}" required maxlength="60">
          <select id="kitCat">
            <option>${t("kit_cat_water")}</option><option>${t("kit_cat_food")}</option><option>${t("kit_cat_power")}</option><option>${t("kit_cat_first")}</option><option>${t("kit_cat_tools")}</option><option>${t("kit_cat_other")}</option>
          </select>
          <input id="kitExp" type="date" required>
          <button class="btn primary" type="submit">${t("kit_add")}</button>
        </form>
        <div id="kitList"></div>
        <p class="note">${t("kit_note")}</p>
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
    if (!items.length) { box.innerHTML = `<p class="kit-empty">${t("kit_empty")}</p>`; return; }
    const sorted = items.slice().sort((a, b) => (a.e || "9999").localeCompare(b.e || "9999"));
    box.innerHTML = sorted.map((it, i) => {
      const d = daysLeft(it.e);
      let badge = "";
      if (d === null) badge = `<span class="kit-badge ok">${t("kit_no_date")}</span>`;
      else if (d < 0) badge = `<span class="kit-badge exp">${t("kit_expired", { d: -d })}</span>`;
      else if (d <= 30) badge = `<span class="kit-badge soon">${t("kit_dleft", { d })}</span>`;
      else badge = `<span class="kit-badge ok">${t("kit_ok", { d })}</span>`;
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
      return d ? t("last_drill", { d: new Date(d).toLocaleDateString("en-IN") }) : t("no_drill");
    } catch (e) { return ""; }
  }
  function openDrill() {
    const m = $("drillModal"); if (!m) return;
    m.classList.remove("hidden");
    $("drillTimer").textContent = "3:00";
    $("drillList").innerHTML = DRILL_ITEMS.map((it, i) => `<li><label><input type="checkbox" data-i="${i}"> ${it}</label></li>`).join("");
    $("drillDone").classList.add("hidden");
    $("drillStart").textContent = t("drill_start");
    $("drillStart").disabled = false;
  }
  function closeDrill() {
    const m = $("drillModal"); if (m) m.classList.add("hidden");
    if (drillTimer) { clearInterval(drillTimer); drillTimer = null; }
  }
  function startDrill() {
    const btn = $("drillStart"); if (!btn) return;
    btn.disabled = true; btn.textContent = t("drill_run");
    drillEnd = Date.now() + 180000;
    drillTimer = setInterval(function () {
      const left = Math.max(0, drillEnd - Date.now());
      const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
      $("drillTimer").textContent = mm + ":" + String(ss).padStart(2, "0");
      if (left === 0) {
        clearInterval(drillTimer); drillTimer = null;
        $("drillDone").classList.remove("hidden");
        try { localStorage.setItem("readyhome_last_drill", new Date().toISOString()); } catch (e) {}
        const ld = $("lastDrill"); if (ld) ld.textContent = t("last_drill", { d: new Date().toLocaleDateString("en-IN") });
        btn.textContent = t("drill_again"); btn.disabled = false;
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
      { id: "overview", icon: "📋", title: t("sec_overview"), tag: "start" },
      { id: "numbers", icon: "📞", title: t("sec_numbers"), tag: "start" },
      { id: "family", icon: "👨‍👩‍👦", title: t("sec_family"), tag: "start" },
      { id: "h72", icon: "⏱️", title: t("sec_h72"), tag: "start" },
      { id: "sustain", icon: "🗓️", title: t("sec_sustain"), tag: "start" },
      { id: "water", icon: "💧", title: t("sec_water"), tag: "core" },
      { id: "food", icon: "🍚", title: t("sec_food"), tag: "core" },
      { id: "cooking", icon: "🍳", title: t("sec_cooking"), tag: "core" },
      { id: "power", icon: "🔋", title: t("sec_power"), tag: "core" },
      { id: "firstaid", icon: "🩹", title: t("sec_firstaid"), tag: "core" },
      { id: "health", icon: "💊", title: t("sec_health"), tag: "core" },
      { id: "tools", icon: "🛠️", title: t("sec_tools"), tag: "core" },
      { id: "gobags", icon: "🎒", title: t("sec_gobags"), tag: "core" },
      { id: "kit", icon: "🧰", title: t("sec_kit"), tag: "core" },
      { id: "harden", icon: "🏠", title: t("sec_harden"), tag: "hazard", show: cycloneEmphasis(c) || floodEmphasis(c) },
      { id: "quake", icon: "🪨", title: t("sec_quake"), tag: "hazard", show: c.quake >= 3 },
      { id: "heat", icon: "🌡️", title: t("sec_heat"), tag: "hazard", show: heatEmphasis(c) },
      { id: "flood", icon: "🌊", title: t("sec_flood"), tag: "hazard", show: floodEmphasis(c) },
      { id: "docs", icon: "📄", title: t("sec_docs"), tag: "core" },
      { id: "diy", icon: "🛠️", title: t("sec_diy"), tag: "core" },
      { id: "shop", icon: "🛒", title: t("sec_shop"), tag: "core" },
      { id: "calendar", icon: "📅", title: t("sec_calendar"), tag: "core" },
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
        <div class="callout"><b>How this plan adapts:</b> ${adaptLine(c)}</div>
        ${mapCard(c)}`,
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
      <div class="eyebrow">${t("generated")}</div>
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
    if (id === "kit") renderKit();
    if (id === "overview") initLeaflet();
    $("secBody").querySelectorAll("input[data-chk]").forEach(cb => cb.onchange = () => {
      const saved = store.get("chk_" + cb.dataset.chk, {});
      saved[cb.id] = cb.checked;
      store.set("chk_" + cb.dataset.chk, saved);
      cb.parentElement.classList.toggle("checked", cb.checked);
      renderProgress();
    });
    if (!noScroll) $("planView").scrollIntoView({ behavior: "smooth", block: "start" });
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
    $("progTxt").textContent = t("prog", { p: pct });
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
      $("resultHead").innerHTML = `<h2>${t("notfound")}</h2><p class="sub">${t("notfound_sub")}</p>`;
      $("tabs").innerHTML = ""; $("secBody").innerHTML = ""; $("planView").classList.add("hidden");
      return;
    }
    $("locInput").value = c.n + ", " + c.s;
    plan = buildPlan(c);
    history.replaceState(null, "", "#plan/" + encodeURIComponent(c.n));
    $("planView").classList.remove("hidden");
    renderPlan();
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      const i = document.createElement("input");
      i.value = t; document.body.appendChild(i); i.select();
      try { document.execCommand("copy"); res(); } catch (e) { rej(e); }
      i.remove();
    });
  }
  function planUrl() {
    return location.origin + location.pathname + "#plan/" + encodeURIComponent(plan ? plan.city.n : "");
  }

  function init() {
    applyLang();
    const langSel = $("langSel");
    if (langSel) {
      langSel.value = lang;
      langSel.onchange = () => { lang = langSel.value; store.set("lang", lang); applyLang(); };
    }
    $("locInput").addEventListener("input", e => renderSuggestions(e.target.value.trim()));
    $("locInput").addEventListener("focus", function () { this.select(); });
    $("locInput").addEventListener("keydown", e => { if (e.key === "Enter") { $("suggestions").classList.add("hidden"); generate(); } });
    $("goBtn").onclick = () => { $("suggestions").classList.add("hidden"); generate(); };
    $("geoBtn").onclick = () => {
      $("geoBtn").textContent = t("geo_locating");
      navigator.geolocation.getCurrentPosition(pos => {
        const c = nearestCity(pos.coords.latitude, pos.coords.longitude);
        $("geoBtn").textContent = t("geo");
        if (c) generate(c.n);
        else { $("locInput").value = t("geo_not_covered"); }
      }, () => {
        $("geoBtn").textContent = t("geo");
        alert(t("geo_denied"));
      }, { timeout: 8000 });
    };
    $("printBtn").onclick = () => window.print();
    $("dlBtn").onclick = downloadPlan;
    $("resetBtn").onclick = () => {
      if (confirm(t("reset_confirm"))) {
        Object.keys(localStorage).filter(k => k.startsWith("readyhome_chk_")).forEach(k => localStorage.removeItem(k));
        if (plan) renderPlan();
      }
    };
    renderSuggestions("");
    const h = (location.hash || "").match(/^#plan\/(.+)$/);
    if (h) {
      try { const nm = decodeURIComponent(h[1]); if (resolveCity(nm)) { generate(nm); } else { generate("Bhubaneswar"); } }
      catch (e) { generate("Bhubaneswar"); }
    } else {
      generate("Bhubaneswar");
    }
    window.addEventListener("hashchange", function () {
      const m = (location.hash || "").match(/^#plan\/(.+)$/);
      if (m) { try { const nm = decodeURIComponent(m[1]); if (resolveCity(nm)) generate(nm); } catch (e) {} }
    });
    $("copyBtn").onclick = function () {
      copyText(planUrl()).then(function () {
        $("copyBtn").textContent = t("copied");
        setTimeout(function () { $("copyBtn").textContent = t("link"); }, 1600);
      }).catch(function () {});
    };
    $("waBtn").onclick = function () {
      if (!plan) return;
      const txt = encodeURIComponent("My ReadyHome preparedness plan for " + plan.city.n + ": " + planUrl());
      window.open("https://wa.me/?text=" + txt, "_blank", "noopener");
    };
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
