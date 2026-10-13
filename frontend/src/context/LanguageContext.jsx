import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Full translations dictionary for English and Hindi
export const translations = {
  en: {
    // Header & Brand
    brand_name: 'AgriYield.AI',
    brand_tagline: 'Smart Agriculture & Predictive Intelligence',
    home: 'Home',
    yield_map: 'Yield Map',
    what_if_lab: 'What-If Lab',
    viva_methodology: 'Methodology & Research',
    dataset: 'Dataset',
    benchmarks: 'Benchmarks',
    predict_yield: 'Predict Yield',
    sign_in: 'Sign In',
    register: 'Register',
    sign_out: 'Sign Out',
    profile: 'Profile',
    admin: 'Admin',
    toggle_lang: 'Switch to Hindi (हिन्दी)',

    // Landing Page
    landing_badge: 'AI-Powered Precision Agriculture • Machine Learning',
    landing_hero_h1: 'Predict. Plan.',
    landing_hero_h1_span: 'Grow.',
    landing_hero_desc: 'AI-powered crop yield prediction using 24 years of authentic agricultural, environmental, and farming management data across 30 Indian states. No dummy metrics. 100% empirical machine learning.',
    landing_btn_predict: 'Predict Crop Yield',
    landing_btn_analytics: 'Explore Analytics',
    landing_metric_records: 'Authentic Records',
    landing_metric_crops: '54 Crops • 30 Indian States',
    landing_metric_r2: 'Random Forest Tuned',
    landing_metric_unit: 'Standard Target Unit',
    landing_why_title: 'Why Crop Yield Prediction Matters',
    landing_why_desc: 'Climate variability, unpredictable precipitation, and changing soil nutrient demands make empirical agricultural forecasting crucial for food security, credit risk assessment, and farmer livelihoods.',
    landing_card1_title: 'Farmer Decision Support',
    landing_card1_desc: 'Provides farmers with data-driven yield expectations based on seasonal rainfall, cultivated land size, and chemical input intensity, assisting in harvest logistics.',
    landing_card2_title: 'Explainable AI (XAI)',
    landing_card2_desc: 'Demystifies machine learning predictions by displaying feature influence ranking, clarifying how crop genotype, geography, and inputs shape model behavior without false causality.',
    landing_card3_title: 'Policy & Agricultural Credit',
    landing_card3_desc: 'Enables agricultural banks, insurance providers, and government procurement agencies to benchmark seasonal productivity variations across diverse agro-climatic zones.',
    landing_how_title: 'How It Works',
    landing_how_desc: 'A transparent, leak-free 4-step pipeline from raw farm data to explainable yield estimates.',
    landing_step1_title: 'Enter Farm Parameters',
    landing_step1_desc: 'Select your crop, region, cropping season, cultivated area, annual precipitation, and fertilizer/pesticide usage.',
    landing_step2_title: 'Pipeline Preprocessing',
    landing_step2_desc: 'Scikit-Learn ColumnTransformer calculates application intensities (kg/ha), scales numerical inputs, and one-hot encodes categories.',
    landing_step3_title: 'Random Forest Regression',
    landing_step3_desc: 'Hyperparameter-optimized ensemble model generates an authentic yield prediction in tonnes/ha with empirical interval bounds.',
    landing_step4_title: 'Audit & Insights',
    landing_step4_desc: 'Prediction is securely saved to the platform registry. Explore historical trends, feature influences, and regional productivity comparisons.',
    landing_tech_title: 'Full-Stack Technology Stack',
    landing_tech_desc: 'Enterprise-grade architecture built for high-performance agricultural forecasting.',
    landing_cta_title: 'Ready to test agricultural predictions?',
    landing_cta_desc: 'Experience our machine learning models with real Indian agricultural data or review our 6-model benchmark results.',
    landing_cta_btn1: 'Start Prediction Now',
    landing_cta_btn2: 'View Model Comparison',

    // Dashboard Banner
    dashboard_title: 'AgriTech Workspace Dashboard',
    welcome_back: 'Welcome back',
    dashboard_subtitle: 'Real-time predictive agriculture insights & empirical farm intelligence.',
    new_prediction: 'New Prediction',
    live_cycle: 'Agro-Climatic Cycle: Active',
    ai_precision_badge: '100% Empirical Machine Learning',

    // Agro-Advisory Widget
    agro_advisory_title: "Today's Agro-Climatic Weather & Field Advisory",
    agro_advisory_subtitle: 'Live local parameters optimized for Kharif / Rabi cultivation',
    temp_label: 'Temperature',
    temp_val: '27°C',
    temp_status: 'Optimal for vegetative growth',
    moisture_label: 'Soil Moisture',
    moisture_val: '64%',
    moisture_status: 'Adequate root-zone hydration',
    rainfall_label: 'Precipitation',
    rainfall_val: '780 mm',
    rainfall_status: 'Normal seasonal monsoon',
    active_season_label: 'Current Cycle',
    active_season_val: 'Kharif / Rabi Transition',
    advisory_tip_title: 'Agricultural Advisory for Today:',
    advisory_tip_content: 'Recommended: Maintain optimal NPK nitrogen balance and monitor soil moisture prior to grain filling. Check local humidity to safeguard against early fungal rust.',

    // KPI Cards
    kpi_total_preds: 'Total Predictions Logged',
    kpi_total_preds_sub: 'Verified agricultural audit records',
    kpi_avg_yield: 'Average Predicted Yield',
    kpi_avg_yield_sub: 'Empirical platform mean',
    kpi_most_crop: 'Most Predicted Crop',
    kpi_most_crop_sub: 'Highest query volume',
    kpi_model_score: 'Active Model R² Score',
    kpi_model_sub: 'Random Forest Tuned',
    unit_tonnes_ha: 'tonnes/ha',

    // Quick Action Cards
    quick_actions_title: 'Farm Intelligence & Analytical Suites',
    action_predict_title: 'Predict Crop Yield',
    action_predict_desc: 'Run multi-variable ML models with NPK, rainfall & soil data.',
    action_map_title: 'Agri Yield Map',
    action_map_desc: 'Interactive state-level productivity and geographic crop zones.',
    action_sim_title: 'What-If Lab Simulator',
    action_sim_desc: 'Simulate climate sensitivity, fertilizer tweaks, and yield impact.',
    action_analytics_title: 'Agri Analytics',
    action_analytics_desc: 'Explore 24 years of crop distributions, trends, and seasonal yields.',

    // Chart Section
    chart_crop_title: 'Historical Crop Yield Benchmarks',
    chart_crop_subtitle: 'Mean productivity across top cultivated crops (tonnes/ha)',
    chart_crop_link: 'Full Analytics',
    chart_season_title: 'Seasonal Productivity Variations',
    chart_season_subtitle: 'Average harvest yield categorized by agro-season',
    six_seasons_badge: '6 Agro-Seasons',
    mean_yield: 'Mean Yield',
    avg_yield: 'Avg Yield',

    // Recent Predictions Table
    recent_title: 'Recent Crop Predictions',
    recent_subtitle: 'Latest agricultural model inference logs & yield estimations',
    view_all_history: 'View All History',
    col_crop: 'Crop',
    col_state: 'State',
    col_season: 'Season',
    col_area: 'Cultivated Area',
    col_pred_yield: 'Predicted Yield',
    col_total_prod: 'Total Production',
    col_action: 'Action',
    action_breakdown: 'View Breakdown →',
    no_predictions: 'No predictions generated yet.',
    run_first_pred: 'Run your first prediction!',

    // Predict Page
    predict_header_title: 'Agricultural Yield Prediction Lab',
    predict_header_desc: 'Execute empirical machine learning inference to forecast crop yield in tonnes/ha with 95% confidence intervals.',
    predict_live_weather_btn: 'Fetch Live Weather & Soil',
    predict_live_weather_fetching: 'Detecting Agro-Telemetry...',
    predict_crop_label: 'Target Crop',
    predict_state_label: 'Indian State / Region',
    predict_season_label: 'Cropping Season',
    predict_area_label: 'Cultivated Area (Hectares)',
    predict_rainfall_label: 'Annual Rainfall (mm)',
    predict_fert_label: 'Total Fertilizer Input (kg)',
    predict_pest_label: 'Total Pesticide Usage (kg)',
    predict_year_label: 'Cropping Calendar Year',
    predict_submit_btn: 'Generate Machine Learning Prediction',
    predict_submitting: 'Running Hyper-Tuned Random Forest...',

    // Footer
    footer_title: 'AI-Based Crop Yield Prediction System',
    footer_viva: 'Methodology & Research',
    footer_dataset: '19,407 Records Dataset',
    footer_model: 'Random Forest (R² = 0.81)',
    footer_rights: '© 2026 AgriYield.AI. Empirical Agricultural Machine Learning Platform.',
    footer_tagline: 'Designed for Sustainable Farming & Precision Agriculture Support',

    // General & Seasons
    loading_dashboard: 'Aggregating agricultural dashboard & telemetry...',
    season_kharif: 'Kharif',
    season_rabi: 'Rabi',
    season_zaid: 'Zaid',
    season_whole_year: 'Whole Year',
    season_summer: 'Summer',
    season_autumn: 'Autumn',
    season_winter: 'Winter',

    // Crops
    crop_rice: 'Rice',
    crop_wheat: 'Wheat',
    crop_maize: 'Maize',
    crop_cotton: 'Cotton',
    crop_sugarcane: 'Sugarcane',
    crop_bajra: 'Bajra',
    crop_jowar: 'Jowar',
    crop_groundnut: 'Groundnut',
    crop_soyabean: 'Soyabean',
    crop_barley: 'Barley',

    // Footer
    footer_brand_desc: 'Empirical agricultural machine learning platform empowering Indian farmers with authentic data-backed yield intelligence.',
    footer_tools_title: 'Smart AgTech Tools',
    footer_params_title: 'Agro-Parameters',
    footer_system_title: 'Model Telemetry',
    footer_status_active: 'ML Inference Engine Online',
    footer_records_badge: '19,407 Authentic Records',
    footer_btn_predict: 'Launch Crop Prediction',
    footer_param_rainfall: 'Seasonal Rainfall & Precipitation',
    footer_param_soil: 'Fertilizer & Chemical Intensity',
    footer_param_seasons: '6 Indian Cropping Seasons',
    footer_param_states: '30 States Agro-Climatic Zones',
    footer_bottom_credit: 'Crafted with 🌾 for Indian Farmers & Sustainable Agriculture',
    footer_bottom_rights: '© 2026 AgriYield.AI. All Rights Reserved.',
    footer_highlight_1_title: '54 Indian Crops',
    footer_highlight_1_desc: 'Authentic historical multi-crop models',
    footer_highlight_2_title: '30 States & UTs',
    footer_highlight_2_desc: 'Agro-climatic regional modeling',
    footer_highlight_3_title: 'Explainable AI',
    footer_highlight_3_desc: 'Feature influence & importance ranking',
    footer_highlight_4_title: 'Sub-Second Speed',
    footer_highlight_4_desc: 'Instant bounds in tonnes/ha',
  },
  hi: {
    // Header & Brand
    brand_name: 'एग्री-यील्ड.AI',
    brand_tagline: 'स्मार्ट कृषि एवं उपज पूर्वानुमान प्रणाली',
    capstone_tag: '',
    home: 'होम',
    yield_map: 'उपज मानचित्र',
    what_if_lab: 'व्हाट-इफ़ लैब',
    viva_methodology: 'कार्यप्रणाली एवं शोध',
    dataset: 'डेटासेट',
    benchmarks: 'मॉडल मानक',
    predict_yield: 'उपज पूर्वानुमान',
    sign_in: 'लॉग इन',
    register: 'रजिस्टर करें',
    sign_out: 'लॉग आउट',
    profile: 'प्रोफ़ाइल',
    admin: 'व्यवस्थापक',
    toggle_lang: 'अंग्रेज़ी में बदलें (Switch to English)',

    // Landing Page
    landing_badge: 'एआई-संचालित स्मार्ट कृषि एवं उपज पूर्वानुमान प्लेटफॉर्म',
    landing_hero_h1: 'पूर्वानुमान. योजना.',
    landing_hero_h1_span: 'समृद्धि.',
    landing_hero_desc: '30 भारतीय राज्यों के 24 वर्षों के प्रामाणिक कृषि, पर्यावरण एवं कृषि प्रबंधन डेटा पर आधारित एआई फसल उपज पूर्वानुमान प्रणाली। कोई कृत्रिम मेट्रिक्स नहीं, 100% अनुभवजन्य मशीन लर्निंग।',
    landing_btn_predict: 'फसल उपज पूर्वानुमान लगाएं',
    landing_btn_analytics: 'कृषि विश्लेषण देखें',
    landing_metric_records: 'प्रामाणिक कृषि रिकॉर्ड्स',
    landing_metric_crops: '54 फसलें • 30 भारतीय राज्य',
    landing_metric_r2: 'ट्यून्ड रैंडम फॉरेस्ट',
    landing_metric_unit: 'मानक उपज इकाई',
    landing_why_title: 'फसल उपज पूर्वानुमान क्यों महत्वपूर्ण है?',
    landing_why_desc: 'जलवायु परिवर्तन, अप्रत्याशित वर्षा और मृदा पोषक तत्वों में बदलाव के कारण खाद्य सुरक्षा, कृषि ऋण जोखिम मूल्यांकन और किसान आजीविका के लिए यथार्थवादी कृषि पूर्वानुमान अत्यंत आवश्यक है।',
    landing_card1_title: 'किसान निर्णय सहायता',
    landing_card1_desc: 'मौसमी वर्षा, कृषि क्षेत्रफल और खाद-कीटनाशक के उपयोग के आधार पर किसानों को सटीक उपज अनुमान प्रदान करता है, जिससे फसल प्रबंधन एवं कटाई योजना में मदद मिलती है।',
    landing_card2_title: 'व्याख्या योग्य एआई (XAI)',
    landing_card2_desc: 'मशीन लर्निंग मॉडल के निर्णयों को स्पष्ट रूप से समझाता है कि फसल के प्रकार, राज्य, मौसम और इनपुट का मॉडल व्यवहार और उत्पादकता पर क्या प्रभाव पड़ता है।',
    landing_card3_title: 'नीति एवं कृषि ऋण सहायता',
    landing_card3_desc: 'कृषि बैंकों, फसल बीमा कंपनियों और सरकारी खरीद एजेंसियों को विभिन्न कृषि-जलवायु क्षेत्रों में मौसमी उत्पादकता के सटीक मानक उपलब्ध कराता है।',
    landing_how_title: 'यह प्रणाली कैसे कार्य करती है?',
    landing_how_desc: 'खेत के बुनियादी डेटा से लेकर पारदर्शी उपज अनुमान तक 4 चरणों की व्यवस्थित, डेटा-लीक मुक्त पाइपलाइन।',
    landing_step1_title: '1. कृषि विवरण दर्ज करें',
    landing_step1_desc: 'अपनी फसल, राज्य, बुवाई का मौसम, क्षेत्रफल, वार्षिक वर्षा और खाद तथा कीटनाशक की मात्रा चुनें।',
    landing_step2_title: '2. पाइपलाइन प्री-प्रोसेसिंग',
    landing_step2_desc: 'स्किकिट-लर्न कॉलम ट्रांसफॉर्मर प्रति हेक्टेयर खाद-कीटनाशक की गणना करता है और इनपुट को प्रोसेस करता है।',
    landing_step3_title: '3. रैंडम फॉरेस्ट रिग्रेशन',
    landing_step3_desc: 'अनुकूलित एन्सेम्बल मॉडल अनुभवजन्य विश्वास सीमाओं के साथ टन/हेक्टेयर में सटीक उपज का अनुमान उत्पन्न करता है।',
    landing_step4_title: '4. ऑडिट एवं अंतर्दृष्टि',
    landing_step4_desc: 'पूर्वानुमान सुरक्षित डेटाबेस में दर्ज होता है। ऐतिहासिक रुझान, कारक प्रभाव और क्षेत्रीय तुलना का विश्लेषण करें।',
    landing_tech_title: 'फुल-स्टैक तकनीकी संरचना',
    landing_tech_desc: 'उच्च-प्रदर्शन कृषि पूर्वानुमान हेतु निर्मित आधुनिक एंटरप्राइज-ग्रेड आर्किटेक्चर।',
    landing_cta_title: 'क्या आप कृषि पूर्वानुमान का परीक्षण करने के लिए तैयार हैं?',
    landing_cta_desc: 'वास्तविक भारतीय कृषि डेटा के साथ हमारे उन्नत मशीन लर्निंग मॉडल का अनुभव करें या मॉडल तुलना देखें।',
    landing_cta_btn1: 'अभी पूर्वानुमान शुरू करें',
    landing_cta_btn2: 'मॉडल तुलना देखें',

    // Dashboard Banner
    dashboard_title: 'कृषि कार्यक्षेत्र डैशबोर्ड',
    welcome_back: 'स्वागत है',
    dashboard_subtitle: 'वास्तविक समय कृषि उपज पूर्वानुमान, मृदा विश्लेषण एवं आधुनिक कृषि अंतर्दृष्टि।',
    new_prediction: 'नया पूर्वानुमान करें',
    live_cycle: 'कृषि-जलवायु चक्र: सक्रिय',
    ai_precision_badge: '100% डेटा-सत्यापित मशीन लर्निंग',

    // Agro-Advisory Widget
    agro_advisory_title: 'आज का कृषि मौसम और दैनिक खेत परामर्श',
    agro_advisory_subtitle: 'खरीफ व रबी फसलों के लिए स्थानीय कृषि-जलवायु परिस्थितियाँ',
    temp_label: 'तापमान',
    temp_val: '27°C',
    temp_status: 'फसल वानस्पतिक वृद्धि के लिए उत्तम',
    moisture_label: 'मृदा नमी',
    moisture_val: '64%',
    moisture_status: 'जड़ों के लिए पर्याप्त जल स्तर',
    rainfall_label: 'वर्षा स्तर',
    rainfall_val: '780 मिमी',
    rainfall_status: 'सामान्य मौसमी वर्षा',
    active_season_label: 'वर्तमान चक्र',
    active_season_val: 'खरीफ / रबी परिवर्तन',
    advisory_tip_title: 'आज की महत्वपूर्ण कृषि सलाह:',
    advisory_tip_content: 'सुझाव: बालियां व दाना बनने से पूर्व खेत में उचित नाइट्रोजन (NPK) अनुपात व नमी बनाए रखें। फफूंद जनित रोगों की रोकथाम हेतु पत्तियों का नियमित निरीक्षण करें।',

    // KPI Cards
    kpi_total_preds: 'कुल दर्ज पूर्वानुमान',
    kpi_total_preds_sub: 'सुरक्षित डेटाबेस रिकॉर्ड्स',
    kpi_avg_yield: 'औसत अनुमानित उपज',
    kpi_avg_yield_sub: 'प्लेटफॉर्म औसत उत्पादकता',
    kpi_most_crop: 'सर्वाधिक खोजी गई फसल',
    kpi_most_crop_sub: 'सबसे अधिक विश्लेषण की गई',
    kpi_model_score: 'सक्रिय मॉडल सटीकता (R²)',
    kpi_model_sub: 'ट्यून किया गया रैंडम फॉरेस्ट',
    unit_tonnes_ha: 'टन / हेक्टेयर',

    // Quick Action Cards
    quick_actions_title: 'स्मार्ट कृषि उपकरण एवं विश्लेषणात्मक सूट',
    action_predict_title: 'फसल उपज पूर्वानुमान',
    action_predict_desc: 'NPK खाद, वर्षा, तापमान और क्षेत्रफल के आधार पर सटीक उपज जानें।',
    action_map_title: 'राज्यवार कृषि मानचित्र',
    action_map_desc: 'भारत के 30 राज्यों की फसल उत्पादकता का इंटरएक्टिव नक्शा देखें।',
    action_sim_title: 'व्हाट-इफ़ सिम्युलेटर',
    action_sim_desc: 'मौसम में बदलाव और खाद की मात्रा बदलकर उपज पर असर का विश्लेषण करें।',
    action_analytics_title: 'विस्तृत कृषि विश्लेषण',
    action_analytics_desc: '24 वर्षों के ऐतिहासिक फसल उत्पादन और मौसमी रुझानों की पड़ताल करें।',

    // Chart Section
    chart_crop_title: 'प्रमुख फसलों की औसत उत्पादकता मानक',
    chart_crop_subtitle: 'शीर्ष उगाई जाने वाली फसलों की औसत उपज (टन/हेक्टेयर)',
    chart_crop_link: 'पूरा विश्लेषण देखें',
    chart_season_title: 'ऋतुवार फसल उत्पादकता विश्लेषण',
    chart_season_subtitle: 'विभिन्न कृषि ऋतुओं के अनुसार औसत उपज',
    six_seasons_badge: '6 कृषि ऋतुएं',
    mean_yield: 'औसत उपज',
    avg_yield: 'औसत उपज',

    // Recent Predictions Table
    recent_title: 'हालिया फसल उपज पूर्वानुमान',
    recent_subtitle: 'आपके द्वारा किए गए नवीनतम कृषि मॉडल परिणाम व रिकॉर्ड्स',
    view_all_history: 'संपूर्ण इतिहास देखें',
    col_crop: 'फसल',
    col_state: 'राज्य',
    col_season: 'मौसम / ऋतु',
    col_area: 'कृषि क्षेत्रफल',
    col_pred_yield: 'अनुमानित उपज',
    col_total_prod: 'कुल उत्पादन',
    col_action: 'कार्रवाई',
    action_breakdown: 'विस्तृत विवरण देखें →',
    no_predictions: 'अभी तक कोई पूर्वानुमान दर्ज नहीं हुआ है।',
    run_first_pred: 'पहला पूर्वानुमान शुरू करें!',

    // Predict Page
    predict_header_title: 'कृषि उपज पूर्वानुमान प्रयोगशाला',
    predict_header_desc: '95% अनुभवजन्य विश्वास सीमाओं के साथ टन/हेक्टेयर में फसल उपज का सटीक पूर्वानुमान प्राप्त करें।',
    predict_live_weather_btn: 'लाइव मौसम व मृदा डेटा प्राप्त करें',
    predict_live_weather_fetching: 'कृषि-टेलीमेट्री खोजी जा रही है...',
    predict_crop_label: 'लक्षित फसल',
    predict_state_label: 'भारतीय राज्य / क्षेत्र',
    predict_season_label: 'बुवाई का मौसम / ऋतु',
    predict_area_label: 'कृषि क्षेत्रफल (हेक्टेयर)',
    predict_rainfall_label: 'वार्षिक वर्षा (मिमी)',
    predict_fert_label: 'कुल खाद की मात्रा (किलोग्राम)',
    predict_pest_label: 'कुल कीटनाशक की मात्रा (किलोग्राम)',
    predict_year_label: 'फसल कैलेंडर वर्ष',
    predict_submit_btn: 'मशीन लर्निंग पूर्वानुमान उत्पन्न करें',
    predict_submitting: 'ट्यून्ड रैंडम फॉरेस्ट मॉडल चल रहा है...',

    // Footer
    footer_title: 'एआई-आधारित फसल उपज पूर्वानुमान प्रणाली',
    footer_capstone: '',
    footer_viva: 'कार्यप्रणाली एवं शोध',
    footer_dataset: '19,407 कृषि डेटा रिकॉर्ड्स',
    footer_model: 'रैंडम फॉरेस्ट मॉडल (R² = 0.81)',
    footer_rights: '© 2026 एग्री-यील्ड.AI। अनुभवजन्य कृषि मशीन लर्निंग प्लेटफॉर्म।',
    footer_tagline: 'संवहनीय कृषि एवं सटीक उपज संवर्धन सहायता हेतु विकसित',

    // General & Seasons
    loading_dashboard: 'कृषि डैशबोर्ड और टेलीमेट्री लोड हो रही है...',
    season_kharif: 'खरीफ',
    season_rabi: 'रबी',
    season_zaid: 'जायद',
    season_whole_year: 'संपूर्ण वर्ष',
    season_summer: 'ग्रीष्मकालीन',
    season_autumn: 'शरदकालीन',
    season_winter: 'शीतकालीन',

    // Crops
    crop_rice: 'चावल (धान)',
    crop_wheat: 'गेहूं',
    crop_maize: 'मक्का',
    crop_cotton: 'कपास',
    crop_sugarcane: 'गन्ना',
    crop_bajra: 'बाजरा',
    crop_jowar: 'ज्वार',
    crop_groundnut: 'मूंगफली',
    crop_soyabean: 'सोयाबीन',
    crop_barley: 'जौ',

    // Footer
    footer_brand_desc: 'भारतीय किसानों को डेटा-सत्यापित उपज पूर्वानुमान से सशक्त बनाने वाला प्रामाणिक स्मार्ट कृषि एआई प्लेटफॉर्म।',
    footer_tools_title: 'स्मार्ट कृषि टूल्स',
    footer_params_title: 'कृषि पैरामीटर्स',
    footer_system_title: 'मॉडल टेलीमेट्री',
    footer_status_active: 'एमएल इंजन सक्रिय • 0.81 R²',
    footer_records_badge: '19,407 प्रामाणिक कृषि रिकॉर्ड्स',
    footer_btn_predict: 'उपज पूर्वानुमान शुरू करें',
    footer_param_rainfall: 'मौसमी वर्षा एवं जल संसाधन',
    footer_param_soil: 'खाद एवं रासायनिक उर्वरक तीव्रता',
    footer_param_seasons: '6 भारतीय कृषि मौसम',
    footer_param_states: '30 राज्य कृषि-जलवायु क्षेत्र',
    footer_bottom_credit: 'भारतीय किसानों एवं संवहनीय कृषि के लिए 🌾 समर्पित',
    footer_bottom_rights: '© 2026 AgriYield.AI. सर्वाधिकार सुरक्षित।',
    footer_highlight_1_title: '54 भारतीय फसलें',
    footer_highlight_1_desc: 'प्रामाणिक ऐतिहासिक बहु-फसल मॉडल',
    footer_highlight_2_title: '30 राज्य एवं केंद्र शासित प्रदेश',
    footer_highlight_2_desc: 'कृषि-जलवायु क्षेत्रीय मॉडलिंग',
    footer_highlight_3_title: 'व्याख्या योग्य एआई (XAI)',
    footer_highlight_3_desc: 'कारक प्रभाव एवं महत्व रैंकिंग',
    footer_highlight_4_title: 'तत्काल परिणाम',
    footer_highlight_4_desc: 'टन/हेक्टेयर में त्वरित उपज गणना',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agritech_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agritech_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang);
    }
  };

  // Translation helper function
  const t = (key, fallback = '') => {
    if (!key) return '';
    const currentDict = translations[language] || translations.en;
    if (currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English if missing in Hindi
    if (translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  // Helper to translate crop names
  const translateCrop = (cropName) => {
    if (!cropName) return '';
    if (language === 'en') return cropName;
    const lower = cropName.toLowerCase();
    if (lower.includes('rice')) return 'चावल (धान)';
    if (lower.includes('wheat')) return 'गेहूं';
    if (lower.includes('maize')) return 'मक्का';
    if (lower.includes('cotton')) return 'कपास';
    if (lower.includes('sugar')) return 'गन्ना';
    if (lower.includes('bajra')) return 'बाजरा';
    if (lower.includes('jowar')) return 'ज्वार';
    if (lower.includes('groundnut')) return 'मूंगफली';
    if (lower.includes('soy')) return 'सोयाबीन';
    if (lower.includes('barley')) return 'जौ';
    if (lower.includes('potato')) return 'आलू';
    if (lower.includes('onion')) return 'प्याज';
    if (lower.includes('pulses') || lower.includes('gram')) return 'दालें / चना';
    return cropName;
  };

  // Helper to translate season names
  const translateSeason = (seasonName) => {
    if (!seasonName) return '';
    if (language === 'en') return seasonName;
    const lower = seasonName.toLowerCase();
    if (lower.includes('kharif')) return 'खरीफ';
    if (lower.includes('rabi')) return 'रबी';
    if (lower.includes('zaid')) return 'जायद';
    if (lower.includes('whole')) return 'संपूर्ण वर्ष';
    if (lower.includes('summer')) return 'ग्रीष्मकालीन';
    if (lower.includes('autumn')) return 'शरदकालीन';
    if (lower.includes('winter')) return 'शीतकालीन';
    return seasonName;
  };

  // Helper to translate state names
  const translateState = (stateName) => {
    if (!stateName) return '';
    if (language === 'en') return stateName;
    const lower = stateName.toLowerCase();
    if (lower.includes('punjab')) return 'पंजाब';
    if (lower.includes('haryana')) return 'हरियाणा';
    if (lower.includes('uttar pradesh')) return 'उत्तर प्रदेश';
    if (lower.includes('madhya pradesh')) return 'मध्य प्रदेश';
    if (lower.includes('rajasthan')) return 'राजस्थान';
    if (lower.includes('bihar')) return 'बिहार';
    if (lower.includes('gujarat')) return 'गुजरात';
    if (lower.includes('maharashtra')) return 'महाराष्ट्र';
    if (lower.includes('west bengal')) return 'पश्चिम बंगाल';
    if (lower.includes('karnataka')) return 'कर्नाटक';
    if (lower.includes('tamil nadu')) return 'तमिलनाडु';
    if (lower.includes('andhra')) return 'आंध्र प्रदेश';
    if (lower.includes('telangana')) return 'तेलंगाना';
    if (lower.includes('kerala')) return 'केरल';
    if (lower.includes('odisha')) return 'ओडिशा';
    if (lower.includes('assam')) return 'असम';
    if (lower.includes('chhattisgarh')) return 'छत्तीसगढ़';
    if (lower.includes('jharkhand')) return 'झारखंड';
    if (lower.includes('uttarakhand')) return 'उत्तराखंड';
    if (lower.includes('himachal')) return 'हिमाचल प्रदेश';
    return stateName;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        t,
        translateCrop,
        translateSeason,
        translateState,
        isHindi: language === 'hi',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
