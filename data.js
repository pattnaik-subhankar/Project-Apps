/* ReadyHome India — location dataset
   Risk scale 0-3: 0=none/low, 1=low, 2=moderate, 3=high.
   quake = BIS seismic zone number (2,3,4,5). Profiles are indicative,
   compiled from IMD/NDMA/BIS zone maps and state disaster records.
   Government sources remain authoritative for official decisions. */

const CITIES = [
  // ---- Odisha (home state focus) ----
  { n: "Bhubaneswar", s: "Odisha", lat: 20.2961, lng: 85.8245, cyc: 3, flood: 2, quake: 2, heat: 3, tsu: 1, emg: "OSDMA 0674-2395398 · BMC 0674-2531100", note: "Capital. Fani 2019 wind/glass damage; urban flooding; severe summer heat." },
  { n: "Puri", s: "Odisha", lat: 19.8135, lng: 85.8312, cyc: 3, flood: 2, quake: 2, heat: 2, tsu: 2, emg: "OSDMA 0674-2395398", note: "Coastal. Direct cyclone landfall zone (Fani 2019)." },
  { n: "Cuttack", s: "Odisha", lat: 20.4625, lng: 85.8828, cyc: 3, flood: 3, quake: 2, heat: 3, tsu: 0, emg: "OSDMA 0674-2395398", note: "Mahanadi/Kathajodi flood city; cyclone wind exposure." },
  { n: "Paradip", s: "Odisha", lat: 20.3165, lng: 86.6085, cyc: 3, flood: 2, quake: 2, heat: 2, tsu: 2, emg: "OSDMA 0674-2395398", note: "Port town, direct cyclone + surge exposure." },
  { n: "Balasore", s: "Odisha", lat: 21.4935, lng: 86.9321, cyc: 3, flood: 3, quake: 3, heat: 2, tsu: 2, emg: "OSDMA 0674-2395398", note: "Cyclone landfall + flood prone; near seismic zone III." },
  { n: "Berhampur", s: "Odisha", lat: 19.3148, lng: 84.7941, cyc: 3, flood: 2, quake: 2, heat: 3, tsu: 2, emg: "OSDMA 0674-2395398", note: "Ganjam coast, cyclone exposure, heat." },
  { n: "Rourkela", s: "Odisha", lat: 22.2604, lng: 84.8536, cyc: 2, flood: 1, quake: 2, heat: 2, tsu: 0, emg: "OSDMA 0674-2395398", note: "Inland industrial city, moderate exposure." },
  { n: "Sambalpur", s: "Odisha", lat: 21.4669, lng: 83.9812, cyc: 2, flood: 2, quake: 2, heat: 3, tsu: 0, emg: "OSDMA 0674-2395398", note: "Mahanadi basin, flood + heat." },

  // ---- East & Northeast ----
  { n: "Kolkata", s: "West Bengal", lat: 22.5726, lng: 88.3639, cyc: 3, flood: 3, quake: 3, heat: 2, tsu: 1, emg: "WB disaster 1070/112", note: "Cyclone (Amphan 2020), urban flood, zone III." },
  { n: "Patna", s: "Bihar", lat: 25.5941, lng: 85.1376, cyc: 1, flood: 3, quake: 4, heat: 3, tsu: 0, emg: "Bihar disaster 1070/112", note: "Ganga floods; seismic zone IV; extreme heat." },
  { n: "Guwahati", s: "Assam", lat: 26.1445, lng: 91.7362, cyc: 1, flood: 3, quake: 5, heat: 1, tsu: 0, emg: "ASDMA 0361-2237221", note: "Brahmaputra floods; seismic zone V (highest)." },
  { n: "Ranchi", s: "Jharkhand", lat: 23.3441, lng: 85.3096, cyc: 0, flood: 1, quake: 2, heat: 2, tsu: 0, emg: "112", note: "Low risk city; heat moderate." },

  // ---- South ----
  { n: "Chennai", s: "Tamil Nadu", lat: 13.0827, lng: 80.2707, cyc: 3, flood: 3, quake: 3, heat: 3, tsu: 2, emg: "TN disaster 1070/112", note: "Cyclone (Vardah 2016), 2015 floods; zone III." },
  { n: "Visakhapatnam", s: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, cyc: 3, flood: 2, quake: 2, heat: 2, tsu: 2, emg: "AP disaster 1070/112", note: "Cyclone-prone coast (Hudhud 2014)." },
  { n: "Vijayawada", s: "Andhra Pradesh", lat: 16.5062, lng: 80.648, cyc: 2, flood: 3, quake: 3, heat: 3, tsu: 0, emg: "AP disaster 1070/112", note: "Krishna floods, heat, zone III." },
  { n: "Hyderabad", s: "Telangana", lat: 17.385, lng: 78.4867, cyc: 1, flood: 2, quake: 2, heat: 3, tsu: 0, emg: "TS disaster 1070/112", note: "Urban flash floods; severe heat." },
  { n: "Bengaluru", s: "Karnataka", lat: 12.9716, lng: 77.5946, cyc: 0, flood: 1, quake: 2, heat: 1, tsu: 0, emg: "112", note: "Low hazard; urban waterlogging only." },
  { n: "Mangaluru", s: "Karnataka", lat: 12.9141, lng: 74.856, cyc: 2, flood: 1, quake: 3, heat: 1, tsu: 1, emg: "112", note: "West coast, cyclone possible, zone III." },
  { n: "Kochi", s: "Kerala", lat: 9.9312, lng: 76.2673, cyc: 1, flood: 2, quake: 3, heat: 1, tsu: 1, emg: "Kerala disaster 1070/112", note: "Monsoon floods 2018-19; zone III." },
  { n: "Thiruvananthapuram", s: "Kerala", lat: 8.5241, lng: 76.9366, cyc: 1, flood: 2, quake: 3, heat: 1, tsu: 1, emg: "112", note: "Low cyclone exposure; monsoon rain floods." },
  { n: "Coimbatore", s: "Tamil Nadu", lat: 11.0168, lng: 76.9558, cyc: 1, flood: 2, quake: 3, heat: 2, tsu: 0, emg: "112", note: "Moderate; zone III." },
  { n: "Puducherry", s: "Puducherry", lat: 11.9416, lng: 79.8083, cyc: 3, flood: 2, quake: 3, heat: 2, tsu: 2, emg: "112", note: "Coastal cyclone belt; zone III." },
  { n: "Tirupati", s: "Andhra Pradesh", lat: 13.6288, lng: 79.4192, cyc: 2, flood: 1, quake: 2, heat: 3, tsu: 1, emg: "AP disaster 1070/112", note: "Cyclone fringe; heat." },

  // ---- West ----
  { n: "Mumbai", s: "Maharashtra", lat: 19.076, lng: 72.8777, cyc: 2, flood: 3, quake: 3, heat: 1, tsu: 1, emg: "BMC 1916 / 112", note: "2005 floods; cyclone possible; zone III." },
  { n: "Surat", s: "Gujarat", lat: 21.1702, lng: 72.8311, cyc: 2, flood: 3, quake: 3, heat: 2, tsu: 1, emg: "GJ disaster 1070/112", note: "Tapi floods; cyclone fringe; zone III." },
  { n: "Ahmedabad", s: "Gujarat", lat: 23.0225, lng: 72.5714, cyc: 2, flood: 1, quake: 3, heat: 3, tsu: 0, emg: "GJ disaster 1070/112", note: "Extreme heat; 2001 Bhuj quake felt strongly." },
  { n: "Bhuj", s: "Gujarat", lat: 23.242, lng: 69.6669, cyc: 3, flood: 1, quake: 5, heat: 3, tsu: 1, emg: "GJ disaster 1070/112", note: "2001 M7.7 epicentre; cyclone coast; extreme heat." },
  { n: "Rajkot", s: "Gujarat", lat: 22.3039, lng: 70.8022, cyc: 2, flood: 1, quake: 4, heat: 3, tsu: 0, emg: "GJ disaster 1070/112", note: "Zone IV; heat." },
  { n: "Porbandar", s: "Gujarat", lat: 21.6417, lng: 69.6293, cyc: 3, flood: 1, quake: 4, heat: 2, tsu: 2, emg: "GJ disaster 1070/112", note: "Cyclone + surge coast." },
  { n: "Nagpur", s: "Maharashtra", lat: 21.1458, lng: 79.0882, cyc: 0, flood: 1, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Vidarbha heat; zone III." },

  // ---- North & Central ----
  { n: "Delhi", s: "Delhi NCR", lat: 28.7041, lng: 77.1025, cyc: 0, flood: 2, quake: 4, heat: 3, tsu: 0, emg: "Delhi disaster 011-23381198 / 112", note: "Zone IV; Yamuna floods; extreme heat; winter smog." },
  { n: "Jaipur", s: "Rajasthan", lat: 26.9124, lng: 75.7873, cyc: 0, flood: 1, quake: 3, heat: 3, tsu: 0, emg: "RJ disaster 1070/112", note: "Extreme heat; zone III." },
  { n: "Jodhpur", s: "Rajasthan", lat: 26.2389, lng: 73.0243, cyc: 0, flood: 0, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Desert heat; drought risk." },
  { n: "Lucknow", s: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, cyc: 0, flood: 2, quake: 3, heat: 3, tsu: 0, emg: "UP disaster 1070/112", note: "Heat; Gomti floods; zone III." },
  { n: "Kanpur", s: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, cyc: 0, flood: 2, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Ganga floods; heat." },
  { n: "Varanasi", s: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, cyc: 0, flood: 2, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Ganga floods; heat." },
  { n: "Prayagraj", s: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, cyc: 0, flood: 2, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Ganga-Yamuna confluence floods." },
  { n: "Agra", s: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, cyc: 0, flood: 2, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Yamuna floods; heat." },
  { n: "Gwalior", s: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, cyc: 0, flood: 1, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Heat." },
  { n: "Bhopal", s: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, cyc: 0, flood: 1, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Heat; zone III." },
  { n: "Indore", s: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, cyc: 0, flood: 1, quake: 3, heat: 3, tsu: 0, emg: "112", note: "Heat." },
  { n: "Raipur", s: "Chhattisgarh", lat: 21.2514, lng: 81.6296, cyc: 0, flood: 1, quake: 3, heat: 2, tsu: 0, emg: "112", note: "Low-moderate." },
  { n: "Srinagar", s: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, cyc: 0, flood: 2, quake: 5, heat: 0, tsu: 0, emg: "JK disaster 1070/112", note: "Zone V; 2005 quake; Jhelum floods; winter." },
  { n: "Dehradun", s: "Uttarakhand", lat: 30.3165, lng: 78.0322, cyc: 0, flood: 1, quake: 4, heat: 1, tsu: 0, emg: "UK disaster 1070/112", note: "Zone IV; landslide risk." },
  { n: "Chandigarh", s: "Chandigarh", lat: 30.7333, lng: 76.7794, cyc: 0, flood: 1, quake: 4, heat: 2, tsu: 0, emg: "112", note: "Zone IV." },
  { n: "Amritsar", s: "Punjab", lat: 31.634, lng: 74.8723, cyc: 0, flood: 1, quake: 4, heat: 2, tsu: 0, emg: "112", note: "Zone IV; heat." },
];

/* National emergency numbers (verified, Govt of India) */
const NATIONAL_EMG = [
  ["112", "Unified emergency (police, fire, health, disaster)"],
  ["1078", "Disaster / earthquake / flood helpline (NDMA)"],
  ["108", "Ambulance"],
  ["101", "Fire"],
  ["100", "Police"],
  ["14567", "Senior citizen helpline"],
];

/* Generic plan content builders (used by app.js) */
const HAZARD_LABEL = { cyc: "Cyclone", flood: "Flood", quake: "Earthquake", heat: "Heatwave", tsu: "Tsunami" };
const LEVEL = ["None/Low", "Low", "Moderate", "High"];
