"""
AI Crop Doctor: Pest, Disease & Nutrient Deficiency Triage Engine
Combines ICAR-aligned differential diagnosis with live 3-day Open-Meteo spray window verification.
"""

from typing import Dict, Any, List, Optional
from backend.app.services.weather_service import fetch_live_weather


SYMPTOM_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "yellow_leaves_uniform",
        "category": "nutrient",
        "label_en": "Uniform Yellowing of Older / Lower Leaves",
        "label_hi": "निचली व पुरानी पत्तियों का एकसमान पीला पड़ना",
        "cue_en": "Pale green to yellow foliage starting from older bottom leaves",
        "cue_hi": "नीचे की पुरानी पत्तियों से शुरू होकर पूरा पौधा हल्का पीला दिखना",
    },
    {
        "id": "interveinal_chlorosis",
        "category": "nutrient",
        "label_en": "Yellow Streaks Between Veins / Rusty Khaira Spots",
        "label_hi": "नसों के बीच पीलापन / खैरा रोग के कत्थई धब्बे",
        "cue_en": "Green veins with yellow tissue between veins or reddish-brown specks",
        "cue_hi": "पत्तियों की नसें हरी व बीच का भाग पीला या कत्थई-जंग जैसे धब्बे",
    },
    {
        "id": "purplish_leaves_stunted",
        "category": "nutrient",
        "label_en": "Purplish / Dark Stunted Leaves & Weak Roots",
        "label_hi": "पत्तियों का बैंगनी होना व पौधे की वृद्धि रुकना",
        "cue_en": "Purple tint along older leaf blades and slow early tillering",
        "cue_hi": "पुरानी पत्तियों पर बैंगनी रंग और कल्ले/जड़ विकास में कमी",
    },
    {
        "id": "scorched_leaf_margins",
        "category": "nutrient",
        "label_en": "Scorched / Burnt Leaf Tips & Edges",
        "label_hi": "पत्तियों के किनारे व नोक झुलसना (किनारा जलन)",
        "cue_en": "Brown drying starting along outer margins of mature leaves",
        "cue_hi": "पुरानी पत्तियों के बाहरी किनारों से सूखना और झुलसना",
    },
    {
        "id": "brown_leaf_spots",
        "category": "fungal",
        "label_en": "Brown Spots, Diamond Lesions, or Rust Pustules",
        "label_hi": "पत्तियों पर भूरे धब्बे, झुलसा या पीला/भूरा रतुआ",
        "cue_en": "Spindle/round necrotic lesions, orange-yellow rust streaks, or blight rings",
        "cue_hi": "पत्तियों पर गोल/आँख जैसे भूरे धब्बे या पीले/नारंगी रतुआ पाउडर",
    },
    {
        "id": "white_powdery_coating",
        "category": "fungal",
        "label_en": "White Powdery Growth on Leaves & Pods",
        "label_hi": "पत्तियों व फलियों पर सफेद आटे जैसा चूर्ण (छाछ्या)",
        "cue_en": "Chalky white fungal patches covering upper leaf surfaces and buds",
        "cue_hi": "पत्तियों की ऊपरी सतह व कलियों पर सफेद पाउडर जैसी परत",
    },
    {
        "id": "dead_heart_stem_borer",
        "category": "pest",
        "label_en": "Dead Heart / Dried Central Shoot or Bore Holes",
        "label_hi": "गोभ सूखना (डेड हार्ट) या तने में छेद",
        "cue_en": "Central whorl pulls out easily with rot/frass; white earheads later",
        "cue_hi": "बीच की गोभ सूखकर आसानी से बाहर निकल आती है या तने में छेद व बुरादा",
    },
    {
        "id": "chewed_leaves_caterpillar",
        "category": "pest",
        "label_en": "Chewed / Windowed Leaves, Pod or Boll Caterpillars",
        "label_hi": "कटी/जालीदार पत्तियाँ, फली या टिंडे में सुंडी (इल्ली)",
        "cue_en": "Ragged leaf margins, folded leaves, or larvae boring pods/cobs",
        "cue_hi": "पत्तियाँ मुड़ी या खाई हुई, या फली/भुट्टे/टिंडे में छेद करने वाली सुंडी",
    },
    {
        "id": "sucking_pests_curling",
        "category": "pest",
        "label_en": "Leaf Curling, Honeydew & Aphids / Whiteflies / Hoppers",
        "label_hi": "पत्तियाँ मुड़ना, चिपचिपा पदार्थ व माहू / सफेद मक्खी / फुदका",
        "cue_en": "Upward/downward leaf curl, sooty mold, tiny insects under leaves",
        "cue_hi": "पत्तियों के नीचे छोटे कीड़े (चेपा/तेला), पत्तियों का मुड़ना व चिपचिपापन",
    },
    {
        "id": "root_rot_wilting",
        "category": "root_soil",
        "label_en": "Sudden Plant Wilting, Yellow Collapse & Root Rot",
        "label_hi": "पौधे का अचानक मुरझाना (उकठा) व जड़ सड़न",
        "cue_en": "Plants droop despite soil moisture; darkened stem base or rotted roots",
        "cue_hi": "खेत में नमी होने पर भी पौधा मुरझाना व जड़/तना आधार काला सड़ना",
    },
]


DIAGNOSIS_RULES: Dict[str, Dict[str, Any]] = {
    "yellow_leaves_uniform": {
        "category": "nutrient",
        "condition_en": "Nitrogen (N) Deficiency / Early Vegetative Chlorosis",
        "condition_hi": "नाइट्रोजन (N) की कमी / प्रारंभिक हरितहीनता",
        "cause_en": "Insufficient basal/split nitrogen, leaching after heavy rain, or cold-soil slow mineralization.",
        "cause_hi": "बेसल/टॉप-ड्रेसिंग नाइट्रोजन की कमी, अधिक बारिश से रिसाव या ठंडी मिट्टी में धीमा अवशोषण।",
        "organic_en": "Top-dress enriched Vermicompost (500 kg/ha) or spray Jeevamrut / Seaweed extract (3 ml/L water).",
        "organic_hi": "500 किग्रा/हेक्टेयर वर्मीकम्पोस्ट डालें या जीवामृत / समुद्री शैवाल अर्क (3 मिली/लीटर पानी) का छिड़काव करें।",
        "chemical_en": "Top-dress Urea @ 35–45 kg/ha OR foliar spray Urea 2% (20 g/L water; 500 L spray solution/ha).",
        "chemical_hi": "यूरिया 35–45 किग्रा/हेक्टेयर टॉप-ड्रेसिंग करें या 2% यूरिया घोल (20 ग्राम/लीटर पानी) का छिड़काव करें।",
        "chemical_per_ha": {"product": "Urea (46% N) Foliar Spray / Top-dress", "amount": 35.0, "unit": "kg"},
        "organic_per_ha": {"product": "Vermicompost / Bio-Nitrogen Liquid", "amount": 2.0, "unit": "L"},
        "prevention_en": "Apply nitrogen in 2–3 split doses instead of single heavy application; avoid applying ahead of heavy rain.",
        "prevention_hi": "नाइट्रोजन एक साथ न देकर 2–3 किस्तों में दें और भारी बारिश से ठीक पहले यूरिया न डालें।",
    },
    "interveinal_chlorosis": {
        "category": "nutrient",
        "condition_en": "Zinc / Iron Micronutrient Deficiency (Khaira Syndrome Risk)",
        "condition_hi": "जिंक / आयरन सूक्ष्म पोषक तत्व की कमी (खैरा रोग जोखिम)",
        "cause_en": "Alkaline/calcareous soil pH (>7.5) or waterlogged paddy conditions locking soil Zinc and Iron.",
        "cause_hi": "क्षारीय मिट्टी (pH > 7.5) या धान के खेत में लगातार जलभराव से जिंक व आयरन की उपलब्धता कम होना।",
        "organic_en": "Apply Zinc Solubilizing Bacteria (ZSB) @ 2.5 L/ha mixed with well-rotted FYM.",
        "organic_hi": "जिंक घोलक बैक्टीरिया (ZSB) 2.5 लीटर/हेक्टेयर सड़ी गोबर खाद में मिलाकर डालें।",
        "chemical_en": "Spray Zinc Sulphate (ZnSO₄ 21%) @ 5 g/L + Slaked Lime @ 2.5 g/L (500 L/ha) OR Chelated Zinc-EDTA @ 1 g/L.",
        "chemical_hi": "जिंक सल्फेट (5 ग्राम/लीटर) + बुझा चूना (2.5 ग्राम/लीटर) या चिलेटेड जिंक-EDTA (1 ग्राम/लीटर) का छिड़काव करें।",
        "chemical_per_ha": {"product": "Zinc Sulphate (21% ZnSO₄)", "amount": 2.5, "unit": "kg"},
        "organic_per_ha": {"product": "ZSB Bio-Consortium", "amount": 2.5, "unit": "L"},
        "prevention_en": "Incorporate 25 kg/ha Zinc Sulphate once every 2–3 crop seasons during final field preparation.",
        "prevention_hi": "अंतिम जुताई के समय प्रति 2–3 सीजन में एक बार 25 किग्रा/हेक्टेयर जिंक सल्फेट मिट्टी में मिलाएं।",
    },
    "purplish_leaves_stunted": {
        "category": "nutrient",
        "condition_en": "Phosphorus (P) Deficiency / Cold-Induced Root Slowdown",
        "condition_hi": "फॉस्फोरस (P) की कमी / जड़ विकास अवरोध",
        "cause_en": "Inadequate basal DAP/SSP or cold soil temperatures restricting early root phosphorus uptake.",
        "cause_hi": "बुवाई के समय DAP/SSP की कमी या कम तापमान में जड़ों द्वारा फॉस्फोरस ग्रहण न कर पाना।",
        "organic_en": "Soil drench Phosphate Solubilizing Bacteria (PSB) @ 2.5 L/ha with compost.",
        "organic_hi": "फॉस्फेट घोलक बैक्टीरिया (PSB) 2.5 लीटर/हेक्टेयर खाद के साथ जड़ों के पास दें।",
        "chemical_en": "Foliar spray Mono Ammonium Phosphate (NPK 12:61:0) @ 5 g/L OR DAP 2% filtrate spray (2.5 kg/ha).",
        "chemical_hi": "पानी में घुलनशील NPK 12:61:0 (5 ग्राम/लीटर पानी) का पर्णीय छिड़काव करें।",
        "chemical_per_ha": {"product": "Water-Soluble NPK 12:61:0", "amount": 2.5, "unit": "kg"},
        "organic_per_ha": {"product": "PSB Bio-Culture", "amount": 2.5, "unit": "L"},
        "prevention_en": "Always place 100% of recommended DAP/SSP near the seed zone at sowing rather than late broadcasting.",
        "prevention_hi": "फॉस्फोरस (DAP/SSP) हमेशा बुवाई के समय बीज के पास मिट्टी में मिलाएं, बाद में छिड़काव कम असरदार होता है।",
    },
    "scorched_leaf_margins": {
        "category": "nutrient",
        "condition_en": "Potassium (K) Deficiency / Moisture-Salt Margin Stress",
        "condition_hi": "पोटाश (K) की कमी / किनारा झुलसन तनाव",
        "cause_en": "Low exchangeable soil Potassium causing weak stalk strength, poor grain weight, and edge scorching.",
        "cause_hi": "मिट्टी में पोटाश की कमी से पत्तियों के किनारे जलना, तना कमजोर होना और दाने हल्के रह जाना।",
        "organic_en": "Apply Potash Mobilizing Bacteria (KMB) @ 2.5 L/ha or wood ash compost enrichment.",
        "organic_hi": "पोटाश मोबिलाइजिंग बैक्टीरिया (KMB) 2.5 लीटर/हेक्टेयर सिंचाई या खाद के साथ दें।",
        "chemical_en": "Foliar spray Sulphate of Potash (NPK 00:00:50) @ 5–10 g/L (2.5–4 kg/ha) during dry daylight hours.",
        "chemical_hi": "सल्फेट ऑफ पोटाश (NPK 00:00:50) 5–10 ग्राम/लीटर पानी के साथ छिड़काव करें।",
        "chemical_per_ha": {"product": "Potassium Sulphate (00:00:50)", "amount": 3.0, "unit": "kg"},
        "organic_per_ha": {"product": "KMB Bio-Liquid", "amount": 2.5, "unit": "L"},
        "prevention_en": "Include Muriate of Potash (MOP) in basal fertilizer based on Soil Health Card instead of Urea/DAP alone.",
        "prevention_hi": "केवल यूरिया-DAP पर निर्भर न रहकर बुवाई में पोटाश (MOP) को भी शामिल करें।",
    },
    "brown_leaf_spots": {
        "category": "fungal",
        "condition_en": "Fungal Foliar Blight / Leaf Spot / Cereal Rust Complex",
        "condition_hi": "फफूंद जनित पत्ती झुलसा / भूरे धब्बे / रतुआ रोग",
        "cause_en": "High canopy humidity (>80%), morning dew, and excess nitrogen favoring fungal spore germination.",
        "cause_hi": "अधिक नमी (>80%), सुबह की ओस और अतिरिक्त यूरिया के कारण फफूंद बीजाणुओं का तेजी से फैलाव।",
        "organic_en": "Spray Pseudomonas fluorescens @ 5 g/L (2.5 kg/ha) or Neem-garlic emulsion cleanly on upper/lower leaves.",
        "organic_hi": "स्यूडोमोनास फ्लोरेसेंस (5 ग्राम/लीटर या 2.5 किग्रा/हेक्टेयर) का पत्तियों पर छिड़काव करें।",
        "chemical_en": "Spray Propiconazole 25% EC @ 1 ml/L (500 ml/ha) OR Azoxystrobin + Tebuconazole @ 1 ml/L; repeat after 14 days if needed.",
        "chemical_hi": "प्रोपिकोनाज़ोल 25% EC (1 मिली/लीटर पानी — 500 मिली/हेक्टेयर) या एज़ोक्सीस्ट्रोबिन+टेबुकोनाज़ोल का छिड़काव करें।",
        "chemical_per_ha": {"product": "Propiconazole 25% EC / Mancozeb", "amount": 0.5, "unit": "L"},
        "organic_per_ha": {"product": "Pseudomonas fluorescens WP", "amount": 2.5, "unit": "kg"},
        "prevention_en": "Avoid excess Urea during cloudy/humid weather, maintain proper plant spacing, and use Carbendazim seed treatment.",
        "prevention_hi": "बादल व नमी वाले मौसम में अतिरिक्त यूरिया न डालें, हवा के लिए उचित दूरी रखें व बीजोपचार करें।",
    },
    "white_powdery_coating": {
        "category": "fungal",
        "condition_en": "Powdery Mildew (Erysiphe / Oidium Fungal Infection)",
        "condition_hi": "चूर्णिल आसिता (छाछ्या / सफेद चूर्ण फफूंद रोग)",
        "cause_en": "Cool mornings followed by warm dry afternoons (18–28°C) encouraging surface conidia spread.",
        "cause_hi": "सुबह की ठंडक व दिन की हल्की गर्मी (18–28°C) में फफूंद का सफेद चूर्ण तेजी से फैलना।",
        "organic_en": "Spray Wettable Sulphur 80% WDG @ 2 g/L (1 kg/ha) during cooler morning/evening hours (avoid >35°C sun).",
        "organic_hi": "घुलनशील गंधक (Wettable Sulphur 80%) 2 ग्राम/लीटर पानी के साथ सुबह या शाम छिड़काव करें (तेज धूप में न करें)।",
        "chemical_en": "Spray Hexaconazole 5% EC @ 2 ml/L (1 L/ha) OR Myclobutanil 10% WP @ 0.5 g/L.",
        "chemical_hi": "हेक्साकोनाज़ोल 5% EC (2 मिली/लीटर — 1 लीटर/हेक्टेयर) या माइक्लोब्यूटानिल का छिड़काव करें।",
        "chemical_per_ha": {"product": "Hexaconazole 5% EC", "amount": 1.0, "unit": "L"},
        "organic_per_ha": {"product": "Wettable Sulphur 80% WDG", "amount": 1.0, "unit": "kg"},
        "prevention_en": "Remove heavily infected lower leaves early and avoid dense nitrogen-heavy canopy shading.",
        "prevention_hi": "अधिक संक्रमित निचली पत्तियाँ हटाएं और अत्यधिक घनी वानस्पतिक वृद्धि से बचें।",
    },
    "dead_heart_stem_borer": {
        "category": "pest",
        "condition_en": "Stem Borer / Shoot Borer Larval Infestation",
        "condition_hi": "तना छेदक / गोभ सुंडी कीट प्रकोप",
        "cause_en": "Larvae tunnel inside stem vascular core, cutting nutrient flow and causing dried central shoots.",
        "cause_hi": "इल्ली तने के भीतर घुसकर मुख्य नली काट देती है जिससे बीच की गोभ सूख (डेड हार्ट) जाती है।",
        "organic_en": "Install 12–15 Pheromone traps/ha + release Trichogramma bio-cards @ 50,000 eggs/ha + Neem Azadirachtin 1500 ppm @ 3 ml/L.",
        "organic_hi": "12–15 फेरोमोन ट्रैप/हेक्टेयर लगाएं, ट्राइकोग्रामा कार्ड छोड़ें तथा नीम तेल (1500 ppm) 3 मिली/लीटर छिड़काव करें।",
        "chemical_en": "Apply Cartap Hydrochloride 4% GR @ 18–20 kg/ha OR spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L (150 ml/ha).",
        "chemical_hi": "कार्टैप हाइड्रोक्लोराइड 4% GR (18–20 किग्रा/हेक्टेयर) या क्लोरेंट्रानिलिप्रोल 18.5% SC (150 मिली/हेक्टेयर) का प्रयोग करें।",
        "chemical_per_ha": {"product": "Chlorantraniliprole 18.5% SC", "amount": 0.15, "unit": "L"},
        "organic_per_ha": {"product": "Neem Oil 1500 ppm", "amount": 1.5, "unit": "L"},
        "prevention_en": "Clip rice seedling tips before transplanting, destroy stubble after harvest, and use bird perches (20/ha).",
        "prevention_hi": "रोपाई से पहले धान की पत्तियों के ऊपरी सिरे काटें, कटाई बाद ठूंठ नष्ट करें व खेत में पक्षी मचान (20/हे.) लगाएं।",
    },
    "chewed_leaves_caterpillar": {
        "category": "pest",
        "condition_en": "Chewing Caterpillars / Pod Borer / Leaf Folder / Armyworm",
        "condition_hi": "पत्ती लपेटक / फली छेदक सुंडी / फॉल आर्मीवर्म",
        "cause_en": "Lepidopteran larvae feeding actively on foliage, whorls, or developing pods/bolls during evening/night.",
        "cause_hi": "रात्रि व शाम के समय सक्रिय सुंडियाँ जो पत्तियाँ, कलियाँ और फलियों/भुट्टों को खाती हैं।",
        "organic_en": "Spray Bacillus thuringiensis (Bt) @ 2 g/L (1 kg/ha) or Beauveria bassiana @ 5 g/L + Neem Oil 1500 ppm @ 3 ml/L.",
        "organic_hi": "बैसिलस थुरिंजिएंसिस (Bt) 2 ग्राम/लीटर (1 किग्रा/हे.) या ब्यूवेरिया बेसियाना + नीम तेल का शाम को छिड़काव करें।",
        "chemical_en": "Spray Emamectin Benzoate 5% SG @ 0.4 g/L (200 g/ha) OR Spinosad 45% SC @ 0.35 ml/L.",
        "chemical_hi": "इमामेक्टिन बेंजोएट 5% SG (0.4 ग्राम/लीटर — 200 ग्राम/हेक्टेयर) या स्पिनोसैड का छिड़काव करें।",
        "chemical_per_ha": {"product": "Emamectin Benzoate 5% SG", "amount": 0.2, "unit": "kg"},
        "organic_per_ha": {"product": "Bt Bio-Insecticide", "amount": 1.0, "unit": "kg"},
        "prevention_en": "Install 10–12 T-shaped bird perches/ha, monitor moth catches with pheromone traps, and avoid spraying during bee pollination hours.",
        "prevention_hi": "खेत में पक्षियों के बैठने के लिए खूंटी (T-perch) लगाएं और मधुमक्खियों के बचाव हेतु छिड़काव शाम को करें।",
    },
    "sucking_pests_curling": {
        "category": "pest",
        "condition_en": "Sap-Sucking Pest Complex (Aphids / Whitefly / Jassids / BPH)",
        "condition_hi": "रस चूसक कीट (माहू / सफेद मक्खी / हरा तेला / भूरा फुदका)",
        "cause_en": "Dry warm spells or excess lush nitrogen growth attracting sucking pests that also transmit viral diseases.",
        "cause_hi": "गर्म-शुष्क मौसम व अधिक हरियाली से रस चूसक कीटों का प्रकोप (जो वायरस रोग भी फैलाते हैं)।",
        "organic_en": "Install 15 Yellow Sticky Traps/ha + spray Neem Azadirachtin 1500 ppm @ 4 ml/L (2 L/ha) targeting leaf undersides.",
        "organic_hi": "15 पीले चिपचिपे जाल (Yellow Sticky Trap)/हेक्टेयर लगाएं और नीम तेल (4 मिली/लीटर) पत्तियों के नीचे छिड़कें।",
        "chemical_en": "Spray Imidacloprid 17.8% SL @ 0.4 ml/L (200 ml/ha) OR Thiamethoxam 25% WG @ 0.25 g/L (125 g/ha).",
        "chemical_hi": "इमिडाक्लोप्रिड 17.8% SL (200 मिली/हेक्टेयर) या थायमेथोक्साम 25% WG (125 ग्राम/हेक्टेयर) का छिड़काव करें।",
        "chemical_per_ha": {"product": "Imidacloprid 17.8% SL", "amount": 0.2, "unit": "L"},
        "organic_per_ha": {"product": "Neem Azadirachtin 1500 ppm", "amount": 2.0, "unit": "L"},
        "prevention_en": "Keep field bunds weed-free, avoid indiscriminate synthetic pyrethroids (which trigger pest resurgence), and use sticky traps early.",
        "prevention_hi": "खेत की मेड़ों को खरपतवार-मुक्त रखें और बार-बार सिंथेटिक पाइरेथ्रॉइड के अंधाधुंध छिड़काव से बचें।",
    },
    "root_rot_wilting": {
        "category": "root_soil",
        "condition_en": "Fusarium Wilt / Collar & Root Rot Soil-Borne Disease",
        "condition_hi": "उकठा (फ्यूजेरियम विल्ट) व जड़/तना सड़न रोग",
        "cause_en": "Soil-borne pathogens blocking xylem vessels in waterlogged patches or poorly drained heavy soils.",
        "cause_hi": "खेत में जलभराव व मिट्टी जनित फफूंद द्वारा जड़ों की जल-वाहिनियों (जाइलम) का अवरुद्ध होना।",
        "organic_en": "Drench root zones with Trichoderma viride @ 2.5 kg/ha mixed in 250 kg moist compost or 500 L water.",
        "organic_hi": "ट्राइकोडर्मा विरिडी (2.5 किग्रा/हेक्टेयर) को गोबर खाद या 500 लीटर पानी में घोलकर जड़ों के पास सिंचित करें (ड्रेचिंग)।",
        "chemical_en": "Spot-drench infected patches with Carbendazim 50% WP @ 2 g/L OR Copper Oxychloride 50% WP @ 3 g/L (1.5 kg/ha).",
        "chemical_hi": "प्रभावित पौधों की जड़ों में कार्बेन्डाजिम (2 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर) से ड्रेचिंग करें।",
        "chemical_per_ha": {"product": "Copper Oxychloride 50% WP", "amount": 1.5, "unit": "kg"},
        "organic_per_ha": {"product": "Trichoderma viride Bio-Agent", "amount": 2.5, "unit": "kg"},
        "prevention_en": "Ensure field drainage channels, remove and burn wilted plants safely away from field, and practice crop rotation.",
        "prevention_hi": "जल निकासी व्यवस्था ठीक करें, सूखे पौधों को उखाड़कर खेत से बाहर नष्ट करें और फसल चक्र अपनाएं।",
    },
}


def _refine_crop_specific_condition(crop: str, symptom_id: str, base_rule: Dict[str, Any]) -> Dict[str, str]:
    """Customize condition labels with authentic crop-specific pathology/entomology context."""
    c = crop.strip().lower()
    en = base_rule["condition_en"]
    hi = base_rule["condition_hi"]

    if c in ("rice", "paddy"):
        if symptom_id == "brown_leaf_spots":
            en = "Rice Blast (Pyricularia oryzae) / Brown Spot"
            hi = "धान का झोंका (ब्लास्ट) / भूरा धब्बा रोग"
        elif symptom_id == "interveinal_chlorosis":
            en = "Khaira Disease of Rice (Zinc Deficiency)"
            hi = "धान का खैरा रोग (जिंक की कमी)"
        elif symptom_id == "dead_heart_stem_borer":
            en = "Yellow Stem Borer of Rice (Dead Heart / White Ear)"
            hi = "धान का पीला तना छेदक (गोभ सूखना)"
    elif c == "wheat":
        if symptom_id == "brown_leaf_spots":
            en = "Wheat Yellow/Brown Rust or Alternaria Leaf Blight"
            hi = "गेहूँ का पीला/भूरा रतुआ (गेरुई) या झुलसा रोग"
        elif symptom_id == "sucking_pests_curling":
            en = "Wheat Earhead Aphid (Rhopalosiphum maidis)"
            hi = "गेहूँ का माहू / चेपा कीट"
    elif "cotton" in c:
        if symptom_id == "sucking_pests_curling":
            en = "Cotton Whitefly / Jassids & Leaf Curl Risk"
            hi = "कपास की सफेद मक्खी / तेला व पत्ता मरोड़ जोखिम"
        elif symptom_id == "chewed_leaves_caterpillar":
            en = "Cotton Bollworm Complex (Pink / American Bollworm)"
            hi = "कपास की गुलाबी / अमेरिकन सुंडी (बॉलवर्म)"
    elif c in ("gram", "arhar/tur", "urad", "moong(green gram)", "masoor"):
        if symptom_id == "chewed_leaves_caterpillar":
            en = "Gram / Pulse Pod Borer (Helicoverpa armigera)"
            hi = "दलहन फली छेदक सुंडी (हेलिकोवर्पा)"
        elif symptom_id == "root_rot_wilting":
            en = "Pulse Fusarium Wilt / Dry Root Rot"
            hi = "दलहन उकठा रोग (विल्ट / जड़ सड़न)"
    elif c == "sugarcane":
        if symptom_id == "dead_heart_stem_borer":
            en = "Sugarcane Top / Early Shoot Borer"
            hi = "गन्ने का चोटी / अगेती तना बेधक"
    elif c in ("potato", "onion"):
        if symptom_id == "brown_leaf_spots":
            en = "Early / Late Blight or Purple Blotch"
            hi = "आलू/प्याज का झुलसा (ब्लाइट) या बैंगनी धब्बा रोग"

    return {"condition_en": en, "condition_hi": hi}


def _evaluate_3day_spray_window(weather: Dict[str, Any]) -> Dict[str, Any]:
    """Link 7-day forecast to spray suitability over the next 3 days & suggest best dry slots."""
    forecast = weather.get("forecast_7_days", [])
    advisory = weather.get("spray_advisory", {})
    wind_kmh = float(weather.get("wind_speed_kmh", 10.0) or 10.0)
    spray_status = advisory.get("spray_status", "SAFE")

    dry_days_en = []
    dry_days_hi = []
    for day in forecast[:5]:
        rain = float(day.get("precipitation_mm", 0.0) or 0.0)
        prob = int(day.get("precipitation_prob_pct", 0) or 0)
        if rain < 2.0 and prob < 45:
            dry_days_en.append(f"{day.get('day_label')} ({day.get('date')})")
            dry_days_hi.append(f"{day.get('day_label')} ({day.get('date')})")

    if spray_status == "DELAY_SPRAY":
        verdict = "DELAY"
        verdict_en = "DELAY SPRAYING — Wait for Clear Window"
        verdict_hi = "छिड़काव अभी टालें — साफ मौसम की प्रतीक्षा करें"
    elif spray_status in ("CAUTION", "IRRIGATION_ALERT"):
        verdict = "CAUTION"
        verdict_en = "SPRAY WITH CAUTION (Use Morning/Evening Dry Window)"
        verdict_hi = "सावधानी के साथ सुबह या शाम को छिड़काव करें"
    else:
        verdict = "OPTIMAL"
        verdict_en = "OPTIMAL TO SPRAY — Dry & Calm 3-Day Window"
        verdict_hi = "छिड़काव के लिए उत्तम समय — अगले 3 दिन मौसम अनुकूल"

    return {
        "verdict": verdict,
        "verdict_en": verdict_en,
        "verdict_hi": verdict_hi,
        "weather_source": weather.get("source", "Open-Meteo"),
        "state": weather.get("state", "Punjab"),
        "temperature_c": weather.get("temperature_c", 28.0),
        "humidity_pct": weather.get("relative_humidity_pct", 60),
        "wind_speed_kmh": wind_kmh,
        "next_3_days_rain_mm": advisory.get("next_3_days_rain_mm", 0.0),
        "max_precip_prob_3d_pct": advisory.get("max_precip_prob_3d_pct", 0),
        "advice_en": advisory.get("advisory_en", ""),
        "advice_hi": advisory.get("advisory_hi", ""),
        "recommended_spray_days": dry_days_en[:3],
        "best_time_of_day_en": "Early Morning (6:00–9:00 AM) or Late Afternoon (4:00–6:00 PM) at calm wind (<15 km/h)",
        "best_time_of_day_hi": "सुबह (6:00–9:00 बजे) या शाम (4:00–6:00 बजे) शांत हवा (<15 km/h) में छिड़काव करें",
        "forecast_preview": forecast[:5],
    }


def diagnose_crop_issue(
    crop: str,
    state: str,
    season: str,
    symptoms: List[str],
    severity: str = "moderate",
    growth_stage: str = "vegetative",
    area_ha: float = 1.0,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> Dict[str, Any]:
    """Run ICAR differential triage for selected symptoms and compute area-scaled remedies + weather spray window."""
    valid_symptoms = [s for s in symptoms if s in DIAGNOSIS_RULES]
    if not valid_symptoms:
        valid_symptoms = ["yellow_leaves_uniform"]

    severity_multiplier = {"mild": 0.85, "moderate": 1.0, "severe": 1.2}.get(severity.lower(), 1.0)
    safe_area = max(0.1, float(area_ha))

    weather = fetch_live_weather(state=state, lat=lat, lon=lon)
    spray_window = _evaluate_3day_spray_window(weather)

    diagnoses: List[Dict[str, Any]] = []
    for idx, sym_id in enumerate(valid_symptoms[:3]):
        rule = DIAGNOSIS_RULES[sym_id]
        refined = _refine_crop_specific_condition(crop, sym_id, rule)
        sym_meta = next((item for item in SYMPTOM_CATALOG if item["id"] == sym_id), {})

        chem_spec = rule["chemical_per_ha"]
        org_spec = rule["organic_per_ha"]

        total_chem_qty = round(chem_spec["amount"] * safe_area * severity_multiplier, 2)
        total_org_qty = round(org_spec["amount"] * safe_area * severity_multiplier, 2)
        water_liters = round(450.0 * safe_area)

        urgency = (
            "Immediate (within 24–48 hrs on clear window)"
            if severity.lower() == "severe"
            else "Prompt (within 2–4 days)"
            if severity.lower() == "moderate"
            else "Preventive / Early Spot Action"
        )

        diagnoses.append({
            "rank": idx + 1,
            "symptom_id": sym_id,
            "symptom_label_en": sym_meta.get("label_en", sym_id),
            "symptom_label_hi": sym_meta.get("label_hi", sym_id),
            "category": rule["category"],
            "condition_en": refined["condition_en"],
            "condition_hi": refined["condition_hi"],
            "cause_en": rule["cause_en"],
            "cause_hi": rule["cause_hi"],
            "urgency": urgency,
            "organic_control": {
                "instructions_en": rule["organic_en"],
                "instructions_hi": rule["organic_hi"],
                "product": org_spec["product"],
                "total_quantity": total_org_qty,
                "unit": org_spec["unit"],
            },
            "chemical_control": {
                "instructions_en": rule["chemical_en"],
                "instructions_hi": rule["chemical_hi"],
                "product": chem_spec["product"],
                "total_quantity": total_chem_qty,
                "unit": chem_spec["unit"],
                "water_volume_liters": water_liters,
            },
            "prevention_en": rule["prevention_en"],
            "prevention_hi": rule["prevention_hi"],
        })

    return {
        "crop": crop.strip(),
        "state": weather.get("state", state.strip()),
        "season": season.strip(),
        "growth_stage": growth_stage,
        "severity": severity,
        "area_hectares": round(safe_area, 2),
        "primary_diagnosis": diagnoses[0],
        "diagnoses": diagnoses,
        "spray_window": spray_window,
        "safety_note_en": (
            "Always wear protective gloves & mask while mixing pesticides, observe Pre-Harvest Interval (PHI), "
            "and consult your local Krishi Vigyan Kendra (KVK) before mixing multiple agro-chemicals."
        ),
        "safety_note_hi": (
            "कीटनाशक घोल बनाते समय दस्ताने व मास्क अवश्य पहनें, कटाई पूर्व प्रतीक्षा अवधि (PHI) का पालन करें "
            "तथा एक से अधिक रसायन मिलाने से पहले नजदीकी कृषि विज्ञान केंद्र (KVK) से परामर्श लें।"
        ),
    }
