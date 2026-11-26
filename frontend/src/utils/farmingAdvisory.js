// Agronomic Crop Calendar, Irrigation Stages & NPK Fertilizer Split Helper
// Aligned with ICAR seasonal crop management principles & commercial Urea/DAP/MOP conversions

const CEREAL_CROPS = new Set([
  'rice', 'paddy', 'wheat', 'maize', 'bajra', 'jowar', 'ragi', 'barley', 'small millets', 'other cereals'
]);

const PULSE_CROPS = new Set([
  'gram', 'arhar/tur', 'urad', 'moong(green gram)', 'moong', 'masoor', 'lentil',
  'horse-gram', 'moth', 'khesari', 'cowpea(lobia)', 'peas & beans (pulses)',
  'other  rabi pulses', 'other kharif pulses', 'other summer pulses'
]);

const OILSEED_CROPS = new Set([
  'groundnut', 'rapeseed &mustard', 'mustard', 'soyabean', 'soybean', 'sunflower',
  'sesamum', 'safflower', 'niger seed', 'castor seed', 'linseed'
]);

const CASH_HORTI_CROPS = new Set([
  'sugarcane', 'cotton', 'cotton(lint)', 'potato', 'onion', 'banana', 'tapioca',
  'sweet potato', 'ginger', 'turmeric', 'dry chillies', 'garlic', 'jute', 'tobacco'
]);

const SEASON_WINDOWS = {
  kharif: {
    sowingEn: 'Mid June – Late July (onset of monsoon)',
    sowingHi: 'जून मध्य – जुलाई अंत (मानसून आगमन पर)',
    harvestEn: 'Late September – November',
    harvestHi: 'सितंबर अंत – नवंबर',
  },
  rabi: {
    sowingEn: 'Late October – Mid December',
    sowingHi: 'अक्टूबर अंत – दिसंबर मध्य',
    harvestEn: 'March – Mid April',
    harvestHi: 'मार्च – अप्रैल मध्य',
  },
  summer: {
    sowingEn: 'February – Mid March',
    sowingHi: 'फरवरी – मार्च मध्य',
    harvestEn: 'May – June',
    harvestHi: 'मई – जून',
  },
  autumn: {
    sowingEn: 'May – June (early pre-monsoon)',
    sowingHi: 'मई – जून (पूर्व-मानसून)',
    harvestEn: 'September – October',
    harvestHi: 'सितंबर – अक्टूबर',
  },
  winter: {
    sowingEn: 'July – August',
    sowingHi: 'जुलाई – अगस्त',
    harvestEn: 'November – January',
    harvestHi: 'नवंबर – जनवरी',
  },
  'whole year': {
    sowingEn: 'Feb–March (Spring) or Sept–Oct (Autumn)',
    sowingHi: 'फरवरी–मार्च (बसंत) या सितंबर–अक्टूबर (शरद)',
    harvestEn: '10–12 Months after planting',
    harvestHi: 'रोपाई के 10–12 माह बाद',
  }
};

export function buildFarmingAdvisory({
  crop = 'Rice',
  season = 'Kharif',
  area = 1,
  fertilizerKg = 100,
  isHindi = false
}) {
  const cropKey = String(crop).trim().toLowerCase();
  const seasonKey = String(season).trim().toLowerCase();
  const safeArea = Math.max(0.1, Number(area) || 1);
  const safeFert = Math.max(0, Number(fertilizerKg) || 0);
  const fertPerHa = safeFert / safeArea;

  const isPulse = PULSE_CROPS.has(cropKey);
  const isOilseed = OILSEED_CROPS.has(cropKey);
  const isCash = CASH_HORTI_CROPS.has(cropKey);

  // Commercial fertilizer composition shares from total NPK nutrient/product input
  // Pulses need high basal DAP (phosphorus) & minimal top-dressed Urea (Rhizobium N-fixation)
  let dapShare = 0.28;
  let mopShare = 0.16;
  let ureaShare = 0.56;

  if (isPulse) {
    dapShare = 0.52;
    mopShare = 0.24;
    ureaShare = 0.24;
  } else if (isOilseed) {
    dapShare = 0.36;
    mopShare = 0.22;
    ureaShare = 0.42;
  } else if (isCash) {
    dapShare = 0.26;
    mopShare = 0.24;
    ureaShare = 0.50;
  }

  const totalDapKg = Math.round(safeFert * dapShare);
  const totalMopKg = Math.round(safeFert * mopShare);
  const totalUreaKg = Math.max(0, Math.round(safeFert - totalDapKg - totalMopKg));

  // Split Urea across Basal (34%), Tillering/Vegetative (33%), Panicle/Flowering (33%)
  const basalUreaKg = Math.round(totalUreaKg * (isPulse ? 1.0 : 0.34));
  const top1UreaKg = isPulse ? 0 : Math.round(totalUreaKg * 0.33);
  const top2UreaKg = isPulse ? 0 : Math.max(0, totalUreaKg - basalUreaKg - top1UreaKg);

  const windowInfo = SEASON_WINDOWS[seasonKey] || {
    sowingEn: 'Align with regional IMD seasonal onset',
    sowingHi: 'क्षेत्रीय मौसम और मानसून की शुरुआत के अनुसार',
    harvestEn: 'At physiological maturity (80–85% grain dry-down)',
    harvestHi: 'पूर्ण परिपक्वता अवस्था (80–85% दाने पकने पर)',
  };

  // Irrigation stages tailored by crop biology
  let irrigationStages = [];
  if (cropKey === 'rice' || cropKey === 'paddy') {
    irrigationStages = isHindi
      ? [
          { stage: 'रोपाई व जड़ जमाव (0–15 दिन)', detail: '2–3 सेमी उथला पानी बनाए रखें' },
          { stage: 'कल्ले फूटने की अवस्था (20–40 दिन)', detail: 'हल्की नमी व पहली टॉप-ड्रेसिंग से पहले जल नियंत्रण' },
          { stage: 'बाली बनना व फूल अवस्था (55–75 दिन)', detail: 'सबसे संवेदनशील चरण — खेत में नमी की कमी न होने दें' },
          { stage: 'कटाई से 10–15 दिन पूर्व', detail: 'समान पकने के लिए अतिरिक्त पानी निकाल दें' },
        ]
      : [
          { stage: 'Transplanting & Rooting (0–15 DAS)', detail: 'Maintain 2–3 cm shallow standing water' },
          { stage: 'Active Tillering (20–40 DAS)', detail: 'Moist saturation ahead of 1st Urea top-dressing' },
          { stage: 'Panicle Initiation & Flowering (55–75 DAS)', detail: 'Critical moisture stage — prevent water stress' },
          { stage: '10–15 Days Before Harvest', detail: 'Drain standing water for uniform grain maturity' },
        ];
  } else if (cropKey === 'wheat' || cropKey === 'barley') {
    irrigationStages = isHindi
      ? [
          { stage: 'CRI अवस्था (बुवाई के 20–25 दिन बाद)', detail: 'पहली एवं सबसे महत्वपूर्ण सिंचाई' },
          { stage: 'कल्ले फूटने व गांठ बनना (40–65 दिन)', detail: 'दूसरी सिंचाई व यूरिया की बची मात्रा दें' },
          { stage: 'फूल आने की अवस्था (80–85 दिन)', detail: 'दाने बनने हेतु पर्याप्त नमी सुनिश्चित करें' },
          { stage: 'दूधिया व सख्त दाना अवस्था (100–115 दिन)', detail: 'दाने का वजन बढ़ाने के लिए हल्की सिंचाई' },
        ]
      : [
          { stage: 'Crown Root Initiation (20–25 DAS)', detail: 'First and most critical irrigation stage' },
          { stage: 'Tillering & Late Jointing (45–65 DAS)', detail: 'Supports tiller survival and stalk strength' },
          { stage: 'Flowering / Anthesis (80–85 DAS)', detail: 'Prevent moisture deficit during pollination' },
          { stage: 'Milk to Dough Grain Filling (100–115 DAS)', detail: 'Light irrigation boosts 1000-grain weight' },
        ];
  } else if (isPulse || isOilseed) {
    irrigationStages = isHindi
      ? [
          { stage: 'बुवाई पूर्व पलेवा / अंकुरण नमी', detail: 'अच्छे जमाव के लिए हल्की नमी जरूरी' },
          { stage: 'फूल आने की पूर्व अवस्था (35–45 दिन)', detail: 'फूल झड़ने से रोकने के लिए मुख्य सिंचाई' },
          { stage: 'फली / दाना भराव अवस्था (60–75 दिन)', detail: 'हल्की सिंचाई — जलभराव से पूरी तरह बचें' },
        ]
      : [
          { stage: 'Pre-Sowing / Emergence Moisture', detail: 'Light moisture ensures uniform stand establishment' },
          { stage: 'Pre-Flowering / Bud Initiation (35–45 DAS)', detail: 'Key irrigation to reduce flower drop' },
          { stage: 'Pod / Siliqua Filling (60–75 DAS)', detail: 'Light irrigation only — avoid root waterlogging' },
        ];
  } else {
    irrigationStages = isHindi
      ? [
          { stage: 'स्थापना एवं प्रारंभिक वृद्धि (0–25 दिन)', detail: 'जड़ क्षेत्र में नियमित हल्की नमी बनाए रखें' },
          { stage: 'वानस्पतिक व कल्ले/शाखा विकास (30–60 दिन)', detail: 'पहली खाद टॉप-ड्रेसिंग के बाद सिंचाई करें' },
          { stage: 'फूल व फल/उपज विकास चरण', detail: 'शुष्क मौसम में 10–14 दिन के अंतराल पर सिंचाई करें' },
        ]
      : [
          { stage: 'Establishment Phase (0–25 DAS)', detail: 'Maintain light uniform root-zone moisture' },
          { stage: 'Active Vegetative Growth (30–60 DAS)', detail: 'Irrigate promptly after fertilizer top-dressing' },
          { stage: 'Reproductive & Bulking Stage', detail: 'Schedule 10–14 day intervals during dry spells' },
        ];
  }

  const splitStages = [
    {
      id: 'basal',
      phase: isHindi ? '1. बेसल खुराक (बुवाई के समय)' : '1. Basal Dose (At Sowing / Planting)',
      timing: isHindi ? '0 दिन (बुवाई के समय मिट्टी में मिलाएं)' : 'Day 0 (Incorporate into root zone before sowing)',
      ureaKg: basalUreaKg,
      dapKg: totalDapKg,
      mopKg: totalMopKg,
      note: isHindi
        ? 'संपूर्ण फॉस्फोरस (DAP) और पोटाश (MOP) बेसल रूप में दें।'
        : 'Apply 100% DAP and 100% MOP as basal placement along with starter Urea.',
    },
    ...(!isPulse
      ? [
          {
            id: 'top1',
            phase: isHindi ? '2. पहली टॉप-ड्रेसिंग (वानस्पतिक वृद्धि)' : '2. First Top-Dressing (Vegetative / Tillering)',
            timing: isHindi ? 'बुवाई के 25–30 दिन बाद (सिंचाई पश्चात)' : '25–30 Days After Sowing (after light irrigation)',
            ureaKg: top1UreaKg,
            dapKg: 0,
            mopKg: 0,
            note: isHindi
              ? 'गीली मिट्टी में छिड़काव करें; भारी बारिश से पहले न डालें।'
              : 'Broadcast on moist soil; avoid applying ahead of heavy rainfall.',
          },
          {
            id: 'top2',
            phase: isHindi ? '3. दूसरी टॉप-ड्रेसिंग (फूल / बाली अवस्था)' : '3. Second Top-Dressing (Panicle / Flowering)',
            timing: isHindi ? 'बुवाई के 50–60 दिन बाद' : '50–60 Days After Sowing',
            ureaKg: top2UreaKg,
            dapKg: 0,
            mopKg: 0,
            note: isHindi
              ? 'दाने/फल भराव को अधिकतम करने के लिए अंतिम नाइट्रोजन खुराक।'
              : 'Final nitrogen boost to support ear-head/boll/fruit filling.',
          },
        ]
      : [
          {
            id: 'top_pulse',
            phase: isHindi ? '2. फोलियर / सूक्ष्म पोषक सहायता (वैकल्पिक)' : '2. Pre-Flowering Micronutrient Support',
            timing: isHindi ? 'बुवाई के 35–40 दिन बाद' : '35–40 Days After Sowing',
            ureaKg: 0,
            dapKg: 0,
            mopKg: 0,
            note: isHindi
              ? 'दलहनी फसलें जड़ों से नाइट्रोजन स्थिरीकरण करती हैं — अतिरिक्त यूरिया की आवश्यकता नहीं है।'
              : 'Legumes fix atmospheric nitrogen via root nodules; avoid excess top-dressed Urea.',
          },
        ]),
  ];

  return {
    sowingWindow: isHindi ? windowInfo.sowingHi : windowInfo.sowingEn,
    harvestWindow: isHindi ? windowInfo.harvestHi : windowInfo.harvestEn,
    fertPerHa: Math.round(fertPerHa),
    totalFertilizerKg: Math.round(safeFert),
    totalUreaKg,
    totalDapKg,
    totalMopKg,
    ureaBags45Kg: +(totalUreaKg / 45).toFixed(1),
    dapBags50Kg: +(totalDapKg / 50).toFixed(1),
    mopBags50Kg: +(totalMopKg / 50).toFixed(1),
    splitStages,
    irrigationStages,
    cropCategory: isPulse
      ? (isHindi ? 'दलहन (नाइट्रोजन स्थिरीकरण)' : 'Pulse / Legume Profile')
      : isOilseed
        ? (isHindi ? 'तिलहन प्रोफ़ाइल' : 'Oilseed Profile')
        : isCash
          ? (isHindi ? 'वाणिज्यिक / बागवानी फसल' : 'Commercial / High-Biomass Crop')
          : CEREAL_CROPS.has(cropKey)
            ? (isHindi ? 'अनाज फसल प्रोफ़ाइल' : 'Cereal Crop Profile')
            : (isHindi ? 'सामान्य फसल प्रोफ़ाइल' : 'Regional Crop Profile'),
  };
}

function classifyShcLevel(value, lowMax, highMin, isHindi) {
  if (value < lowMax) {
    return { code: 'LOW', label: isHindi ? 'कम (Low)' : 'Low', factor: 1.25, tone: 'red' };
  }
  if (value > highMin) {
    return { code: 'HIGH', label: isHindi ? 'अधिक (High)' : 'High', factor: 0.75, tone: 'emerald' };
  }
  return { code: 'MEDIUM', label: isHindi ? 'मध्यम (Medium)' : 'Medium', factor: 1.0, tone: 'amber' };
}

/**
 * Interactive Soil Health Card (SHC) Prescription Engine:
 * Takes soil N, P, K (kg/ha), pH, and Organic Carbon (%), classifies soil fertility status,
 * scales crop target-yield nutrient need, and returns exact Urea/DAP/MOP/Zinc/Gypsum/Lime bags.
 */
export function calculateSoilHealthPrescription({
  crop = 'Rice',
  area = 1,
  predictedYield = 3.5,
  soilN = 240,
  soilP = 14,
  soilK = 190,
  soilPh = 7.1,
  organicCarbon = 0.52,
  isHindi = false,
}) {
  const cropKey = String(crop).trim().toLowerCase();
  const safeArea = Math.max(0.1, Number(area) || 1);
  const nVal = Math.max(0, Number(soilN) || 0);
  const pVal = Math.max(0, Number(soilP) || 0);
  const kVal = Math.max(0, Number(soilK) || 0);
  const phVal = Math.min(10.5, Math.max(3.5, Number(soilPh) || 7.0));
  const ocVal = Math.max(0, Number(organicCarbon) || 0);

  const isPulse = PULSE_CROPS.has(cropKey);
  const isOilseed = OILSEED_CROPS.has(cropKey);
  const isCash = CASH_HORTI_CROPS.has(cropKey);

  // Indian Soil Health Card standard fertility ratings
  const nStatus = classifyShcLevel(nVal, 280, 560, isHindi);
  const pStatus = classifyShcLevel(pVal, 10, 25, isHindi);
  const kStatus = classifyShcLevel(kVal, 108, 280, isHindi);
  const ocStatus = classifyShcLevel(ocVal, 0.5, 0.75, isHindi);

  let phStatus;
  let amendment = null;

  if (phVal < 5.5) {
    phStatus = { code: 'STRONGLY_ACIDIC', label: isHindi ? 'अत्यधिक अम्लीय' : 'Strongly Acidic', tone: 'red' };
    const limeKg = Math.round(500 * safeArea);
    amendment = {
      type: 'LIME',
      product: isHindi ? 'कृषि चूना (Agricultural Lime)' : 'Agricultural Lime (CaCO₃)',
      totalKg: limeKg,
      bags50Kg: +(limeKg / 50).toFixed(1),
      note: isHindi
        ? 'अम्लता सुधार हेतु बुवाई से 15–20 दिन पहले मिट्टी में चूना मिलाएं।'
        : 'Incorporate Lime 15–20 days before sowing to neutralize strong soil acidity.',
    };
  } else if (phVal < 6.5) {
    phStatus = { code: 'SLIGHTLY_ACIDIC', label: isHindi ? 'हल्की अम्लीय' : 'Slightly Acidic', tone: 'amber' };
    const limeKg = Math.round(250 * safeArea);
    amendment = {
      type: 'LIME',
      product: isHindi ? 'हल्का चूना सुधार (Lime)' : 'Agricultural Lime (Light Dose)',
      totalKg: limeKg,
      bags50Kg: +(limeKg / 50).toFixed(1),
      note: isHindi
        ? 'फॉस्फोरस उपलब्धता बढ़ाने के लिए बुवाई से पूर्व हल्का चूना डालें।'
        : 'Apply light Lime ahead of sowing to improve phosphorus availability.',
    };
  } else if (phVal <= 7.5) {
    phStatus = { code: 'NEUTRAL', label: isHindi ? 'उदासीन (उत्तम pH)' : 'Neutral (Optimal)', tone: 'emerald' };
  } else if (phVal <= 8.3) {
    phStatus = { code: 'SLIGHTLY_ALKALINE', label: isHindi ? 'हल्की क्षारीय' : 'Slightly Alkaline', tone: 'amber' };
    const gypKg = Math.round(250 * safeArea);
    amendment = {
      type: 'GYPSUM',
      product: isHindi ? 'कृषि जिप्सम (Gypsum)' : 'Agricultural Gypsum (CaSO₄·2H₂O)',
      totalKg: gypKg,
      bags50Kg: +(gypKg / 50).toFixed(1),
      note: isHindi
        ? 'क्षारीय मिट्टी में सल्फर और कैल्शियम संतुलन हेतु जिप्सम मिलाएं।'
        : 'Incorporate Gypsum before pre-sowing irrigation to counter mild alkalinity.',
    };
  } else {
    phStatus = { code: 'SODIC', label: isHindi ? 'अधिक क्षारीय / ऊसर' : 'Strongly Alkaline / Sodic', tone: 'red' };
    const gypKg = Math.round(600 * safeArea);
    amendment = {
      type: 'GYPSUM',
      product: isHindi ? 'ऊसर सुधार जिप्सम (Gypsum Reclamation)' : 'Gypsum Reclamation Dose',
      totalKg: gypKg,
      bags50Kg: +(gypKg / 50).toFixed(1),
      note: isHindi
        ? 'सोडियम विषाक्तता कम करने हेतु बुवाई से 2–3 सप्ताह पहले जिप्सम + लीचिंग करें।'
        : 'Apply Gypsum 2–3 weeks before sowing followed by light leaching to reclaim sodicity.',
    };
  }

  // ICAR Crop Baseline Target NPK (kg/ha) + gentle target-yield multiplier
  let baseN = 120;
  let baseP = 60;
  let baseK = 40;
  let refYield = 3.5;

  if (isPulse) {
    baseN = 25;
    baseP = 50;
    baseK = 30;
    refYield = 1.2;
  } else if (isOilseed) {
    baseN = 60;
    baseP = 50;
    baseK = 40;
    refYield = 1.6;
  } else if (isCash) {
    baseN = cropKey === 'sugarcane' ? 220 : 160;
    baseP = 80;
    baseK = 80;
    refYield = cropKey === 'sugarcane' ? 60 : 20;
  }

  const yieldRatio = Math.min(1.25, Math.max(0.85, (Number(predictedYield) || refYield) / refYield));
  const targetNPerHa = Math.round(baseN * nStatus.factor * yieldRatio);
  const targetPPerHa = Math.round(baseP * pStatus.factor * yieldRatio);
  const targetKPerHa = Math.round(baseK * kStatus.factor * yieldRatio);

  // Convert target NPK -> DAP (18-46-0), Urea (46-0-0), MOP (0-0-60)
  const dapPerHa = targetPPerHa / 0.46;
  const nFromDap = dapPerHa * 0.18;
  const ureaPerHa = Math.max(0, targetNPerHa - nFromDap) / 0.46;
  const mopPerHa = targetKPerHa / 0.60;

  const totalDapKg = Math.round(dapPerHa * safeArea);
  const totalUreaKg = Math.round(ureaPerHa * safeArea);
  const totalMopKg = Math.round(mopPerHa * safeArea);

  // Zinc Sulphate (21%): higher dose in alkaline/waterlogged Rice/Wheat or low OC soils
  const zincPerHa = phVal >= 7.5 || ocVal < 0.5 || cropKey === 'rice' || cropKey === 'wheat' ? 25 : 12.5;
  const totalZincKg = +(zincPerHa * safeArea).toFixed(1);

  const fymTonnesPerHa = ocVal < 0.5 ? 8 : ocVal <= 0.75 ? 4 : 2;
  const totalFymTonnes = +(fymTonnesPerHa * safeArea).toFixed(1);

  // Split Urea across Basal (34%), Vegetative (33%), Flowering (33%) unless Pulse
  const basalUreaKg = Math.round(totalUreaKg * (isPulse ? 1.0 : 0.34));
  const top1UreaKg = isPulse ? 0 : Math.round(totalUreaKg * 0.33);
  const top2UreaKg = isPulse ? 0 : Math.max(0, totalUreaKg - basalUreaKg - top1UreaKg);

  const splitStages = [
    {
      id: 'basal',
      phase: isHindi ? '1. बेसल खुराक (बुवाई के समय)' : '1. Basal Dose (At Sowing / Planting)',
      timing: isHindi ? '0 दिन (जड़ क्षेत्र में मिलाएं)' : 'Day 0 (Incorporate into soil)',
      ureaKg: basalUreaKg,
      dapKg: totalDapKg,
      mopKg: totalMopKg,
      note: isHindi
        ? `साथ में ${totalZincKg} kg जिंक सल्फेट व ${totalFymTonnes} टन गोबर खाद/कम्पोस्ट मिलाएं।`
        : `Also apply ${totalZincKg} kg Zinc Sulphate & ${totalFymTonnes} t compost/FYM.`,
    },
    ...(!isPulse
      ? [
          {
            id: 'top1',
            phase: isHindi ? '2. पहली टॉप-ड्रेसिंग (वानस्पतिक वृद्धि)' : '2. First Top-Dressing (Tillering / Vegetative)',
            timing: isHindi ? 'बुवाई के 25–30 दिन बाद' : '25–30 Days After Sowing',
            ureaKg: top1UreaKg,
            dapKg: 0,
            mopKg: 0,
            note: isHindi
              ? 'हल्की सिंचाई के बाद छिड़काव करें।'
              : 'Apply after light irrigation on moist field.',
          },
          {
            id: 'top2',
            phase: isHindi ? '3. दूसरी टॉप-ड्रेसिंग (बाली / फूल अवस्था)' : '3. Second Top-Dressing (Flowering / Heading)',
            timing: isHindi ? 'बुवाई के 50–60 दिन बाद' : '50–60 Days After Sowing',
            ureaKg: top2UreaKg,
            dapKg: 0,
            mopKg: 0,
            note: isHindi
              ? 'दाने के बेहतर वजन व भराव के लिए अंतिम नाइट्रोजन खुराक।'
              : 'Final nitrogen top-dress for grain filling & yield realization.',
          },
        ]
      : []),
  ];

  return {
    statuses: {
      n: nStatus,
      p: pStatus,
      k: kStatus,
      oc: ocStatus,
      ph: phStatus,
    },
    targetPerHa: { n: targetNPerHa, p2o5: targetPPerHa, k2o: targetKPerHa },
    totalUreaKg,
    totalDapKg,
    totalMopKg,
    totalZincKg,
    totalFymTonnes,
    ureaBags45Kg: +(totalUreaKg / 45).toFixed(1),
    dapBags50Kg: +(totalDapKg / 50).toFixed(1),
    mopBags50Kg: +(totalMopKg / 50).toFixed(1),
    amendment,
    splitStages,
  };
}
