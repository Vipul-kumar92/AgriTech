/**
 * Parse spoken English or Hindi agricultural voice commands into structured form fields.
 */

const CROP_ALIASES = [
  ['चावल', 'Rice'],
  ['धान', 'Rice'],
  ['paddy', 'Rice'],
  ['गेहूं', 'Wheat'],
  ['मक्का', 'Maize'],
  ['कपास', 'Cotton(lint)'],
  ['cotton', 'Cotton(lint)'],
  ['गन्ना', 'Sugarcane'],
  ['बाजरा', 'Bajra'],
  ['ज्वार', 'Jowar'],
  ['मूंगफली', 'Groundnut'],
  ['सोयाबीन', 'Soyabean'],
  ['soybean', 'Soyabean'],
  ['जौ', 'Barley'],
  ['आलू', 'Potato'],
  ['प्याज', 'Onion'],
  ['चना', 'Gram'],
];

const STATE_ALIASES = [
  ['पंजाब', 'Punjab'],
  ['हरियाणा', 'Haryana'],
  ['उत्तर प्रदेश', 'Uttar Pradesh'],
  ['मध्य प्रदेश', 'Madhya Pradesh'],
  ['राजस्थान', 'Rajasthan'],
  ['बिहार', 'Bihar'],
  ['गुजरात', 'Gujarat'],
  ['महाराष्ट्र', 'Maharashtra'],
  ['पश्चिम बंगाल', 'West Bengal'],
  ['कर्नाटक', 'Karnataka'],
  ['तमिलनाडु', 'Tamil Nadu'],
  ['आंध्र प्रदेश', 'Andhra Pradesh'],
  ['तेलंगाना', 'Telangana'],
  ['केरल', 'Kerala'],
  ['ओडिशा', 'Odisha'],
  ['असम', 'Assam'],
  ['छत्तीसगढ़', 'Chhattisgarh'],
  ['झारखंड', 'Jharkhand'],
  ['उत्तराखंड', 'Uttarakhand'],
  ['हिमाचल', 'Himachal Pradesh'],
];

const SEASON_ALIASES = [
  ['खरीफ', 'Kharif'],
  ['रबी', 'Rabi'],
  ['ग्रीष्म', 'Summer'],
  ['शरद', 'Autumn'],
  ['शीत', 'Winter'],
  ['संपूर्ण वर्ष', 'Whole Year'],
];

export function parseAgriVoiceTranscript(transcript, categories = { crops: [], states: [], seasons: [] }) {
  const lower = (transcript || '').toLowerCase();
  const updates = {};
  const matchedFields = [];

  const crops = categories.crops || [];
  const states = categories.states || [];
  const seasons = categories.seasons || [];

  // 1. Crop match (English direct or Hindi/common alias)
  let matchedCrop = crops.find((c) => lower.includes(c.toLowerCase()));
  if (!matchedCrop) {
    const alias = CROP_ALIASES.find(([kw]) => lower.includes(kw));
    if (alias) {
      matchedCrop = crops.find((c) => c.toLowerCase() === alias[1].toLowerCase()) || alias[1];
    }
  }
  if (matchedCrop) {
    updates.crop = matchedCrop;
    matchedFields.push(matchedCrop);
  }

  // 2. State match
  let matchedState = states.find((s) => lower.includes(s.toLowerCase()));
  if (!matchedState) {
    const alias = STATE_ALIASES.find(([kw]) => lower.includes(kw));
    if (alias) {
      matchedState = states.find((s) => s.toLowerCase() === alias[1].toLowerCase()) || alias[1];
    }
  }
  if (matchedState) {
    updates.state = matchedState;
    matchedFields.push(matchedState);
  }

  // 3. Season match
  let matchedSeason = seasons.find((sn) => lower.includes(sn.toLowerCase().trim()));
  if (!matchedSeason) {
    const alias = SEASON_ALIASES.find(([kw]) => lower.includes(kw));
    if (alias) {
      matchedSeason = seasons.find((sn) => sn.toLowerCase().trim() === alias[1].toLowerCase()) || alias[1];
    }
  }
  if (matchedSeason) {
    updates.season = matchedSeason;
    matchedFields.push(matchedSeason.trim());
  }

  // 4. Area (hectares / acres)
  const areaMatch = lower.match(/(\d+(?:\.\d+)?)\s*(hectare|hectares|ha|हेक्टेयर|acre|acres|एकड़)/);
  if (areaMatch) {
    const rawVal = parseFloat(areaMatch[1]);
    const isAcre = /acre|एकड़/.test(areaMatch[2]);
    const haVal = isAcre ? +(rawVal * 0.4047).toFixed(2) : rawVal;
    if (haVal > 0) {
      updates.area = haVal;
      matchedFields.push(`${haVal} ha`);
    }
  }

  // 5. Rainfall
  const rainMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:mm|millimeter|millimeters|rain|rainfall|वर्षा|बारिश)/);
  if (rainMatch) {
    updates.annual_rainfall = parseFloat(rainMatch[1]);
    matchedFields.push(`${updates.annual_rainfall} mm`);
  }

  // 6. Fertilizer
  const fertMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg\s*)?(?:fertilizer|urea|npk|खाद|उर्वरक)/);
  if (fertMatch) {
    updates.fertilizer = parseFloat(fertMatch[1]);
    matchedFields.push(`${updates.fertilizer} kg fert`);
  }

  // 7. Pesticide
  const pestMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg\s*)?(?:pesticide|कीटनाशक|दवाई)/);
  if (pestMatch) {
    updates.pesticide = parseFloat(pestMatch[1]);
    matchedFields.push(`${updates.pesticide} kg pest`);
  }

  return { updates, matchedFields };
}
