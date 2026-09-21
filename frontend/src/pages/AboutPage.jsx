import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  Compass,
  CheckCircle2,
  FileText
} from 'lucide-react';

const vivaQuestions = [
  {
    q: 'Why did you choose Crop Yield Prediction for your B.Tech project?',
    a: 'Agriculture sustains over 50% of the Indian workforce and is highly sensitive to climate anomalies, erratic monsoons, and shifting fertilizer dynamics. Building an empirical machine learning decision-support system provides farmers, banks, and policy planners with actionable yield forecasts rather than guesswork.'
  },
  {
    q: 'Why is this framed as a Regression problem rather than Classification?',
    a: 'Crop yield is a continuous numerical quantity measured in physical units (Tonnes per Hectare). Unlike crop recommendation, which classifies a categorical crop label, yield prediction requires predicting a continuous real-valued target across multi-modal agronomic scales.'
  },
  {
    q: 'What is the primary target variable and its exact unit?',
    a: 'The target variable is Yield in Tonnes per Hectare (tonnes/ha), calculated as harvested production in metric tonnes divided by cultivated land in hectares.'
  },
  {
    q: 'What dataset was used and what is its provenance?',
    a: 'We used the authentic Indian Agricultural Crop Yield & Climate Dataset (1997–2020) with 19,407 cleaned records sourced from the Ministry of Agriculture & Farmers Welfare and the India Meteorological Department (IMD), spanning 30 States, 54 Crops, and 6 Cropping Seasons.'
  },
  {
    q: 'Why did you exclude or separate Coconut from the primary regression target?',
    a: 'In Indian government statistical reporting (APY), all 54 standard crops measure production in metric tonnes (yielding tonnes/ha). However, Coconut is officially reported in "Thousand Nuts", producing yield figures of 8,000 to 20,000 nuts/ha. Mixing nuts/ha with tonnes/ha causes catastrophic scale distortion, so Coconut was partitioned out to preserve 100% target unit integrity.'
  },
  {
    q: 'Why did you compare multiple models instead of only training Random Forest?',
    a: 'Good scientific practice requires establishing baselines (Linear Regression) and evaluating different model families (Linear, Decision Trees, Bagging Ensembles like Random Forest and Extra Trees, and Boosting Ensembles like Gradient Boosting and XGBoost) to empirically prove which architecture provides superior bias-variance tradeoff on the actual data.'
  },
  {
    q: 'What is MAE, RMSE, and R² Score?',
    a: 'MAE (Mean Absolute Error) is the average absolute error in original units (tonnes/ha). RMSE (Root Mean Squared Error) penalizes large outliers more heavily. R² (Coefficient of Determination) measures the proportion of variance in yield explained by the features (our champion model achieved R² = 0.8147).'
  },
  {
    q: 'Why should you NEVER claim "Accuracy = 95%" in a regression project?',
    a: '"Accuracy" (TP+TN)/(Total) is strictly a classification metric. For continuous regression, evaluating performance requires continuous residual metrics like MAE, RMSE, and R².'
  },
  {
    q: 'What is data leakage and how did your pipeline prevent it?',
    a: 'Data leakage happens when information from outside the training set leaks into model fitting. We used Scikit-Learn ColumnTransformer and Pipeline objects so that scaling, imputation, and one-hot encoding parameters were fitted strictly on training splits and only applied to test/production inference.'
  },
  {
    q: 'How did hyperparameter tuning impact performance?',
    a: 'Using RandomizedSearchCV on Random Forest Regressor (tuning n_estimators, max_depth, min_samples_split, min_samples_leaf), test MAE decreased from 1.0109 to 0.8219 tonnes/ha (an 18.7% error reduction) and R² improved to 0.8147.'
  },
  {
    q: 'What is Model Feature Influence and does it prove causality?',
    a: 'Feature influence (Gini importance) measures the reduction in split impurity across ensemble trees. It indicates which features the model relies on most (Crop: 66.8%, State: 14.8%, Area: 8.8%, Rainfall: 4.1%). However, statistical correlation does NOT establish biological causality.'
  },
  {
    q: 'What are the real-world limitations of the project?',
    a: '1) Macro-level data: Rainfall is annual regional rainfall rather than daily field microclimate. 2) Lack of direct soil chemistry (soil pH, extractable NPK) at field level. 3) Unforeseen extreme weather shocks (localized hail, sudden frost).'
  }
];

const AboutPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Capstone Defense</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Project Thesis, Research Questions & Viva Guide
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Comprehensive documentation of project objectives, research gaps, methodology, and oral examination defense preparation.
        </p>
      </div>

      {/* Problem Statement & Solution */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Project Overview & Methodology</h2>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Problem Statement:</strong> Indian agricultural productivity is subject to substantial temporal and spatial volatility driven by monsoon precipitation shifts, regional soil profiles, and input application intensities. Existing agricultural portals either present static historical tables or simplistic single-variable calculators without empirical machine learning rigor.
          </p>
          <p>
            <strong>Proposed Solution:</strong> We constructed an end-to-end predictive agricultural platform that ingests 24 years of validated historical records (19,407 observations), cleans and normalizes target units to continuous <strong>tonnes/hectare</strong>, benchmarks 6 distinct regression architectures, optimizes a champion Random Forest model ($R^2 = 0.8147$), and exposes it via a high-performance FastAPI backend and interactive React dashboard.
          </p>
        </div>
      </div>

      {/* Research Questions */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-black text-slate-900">5 Formal Research Questions (RQ)</h2>
        <div className="space-y-4 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-emerald-700 block mb-1">RQ1: Agronomic Correlation Analysis</span>
            <p className="text-slate-600">
              <em>Which agricultural inputs exhibit the strongest statistical relationship with crop yield?</em><br />
              <strong>Empirical Finding:</strong> Gross inputs scale with area, whereas calculated intensities (Fertilizer/Ha and Pesticide/Ha) reveal true agronomic density correlations without field-size confounding.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-emerald-700 block mb-1">RQ2: Comparative Regression Superiority</span>
            <p className="text-slate-600">
              <em>Do tree-based ensemble estimators outperform linear baselines?</em><br />
              <strong>Empirical Finding:</strong> Yes. Linear Regression achieved $R^2 = 0.5779$, while Random Forest achieved $R^2 = 0.8071$ (before tuning) due to multi-modal crop biomass distributions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-emerald-700 block mb-1">RQ3: Hyperparameter Optimization Impact</span>
            <p className="text-slate-600">
              <em>Does systematic hyperparameter tuning significantly improve generalization error?</em><br />
              <strong>Empirical Finding:</strong> RandomizedSearchCV reduced test MAE from 1.01 to 0.82 tonnes/ha (an 18.7% error reduction) and improved test $R^2$ to 0.8147.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-emerald-700 block mb-1">RQ4: Model Cross-Validation Stability</span>
            <p className="text-slate-600">
              <em>How stable is the model under 5-Fold Cross Validation?</em><br />
              <strong>Empirical Finding:</strong> Random Forest demonstrated high cross-validation stability with a mean $R^2$ of $0.9044 \pm 0.0334$.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-emerald-700 block mb-1">RQ5: Explainable AI in Agricultural Decision Support</span>
            <p className="text-slate-600">
              <em>Can feature influence assist user understanding without falsely claiming causality?</em><br />
              <strong>Empirical Finding:</strong> Gini importance illuminates that crop genotype (66.8%) and regional geography (14.8%) establish the primary baseline, while rainfall and inputs modulate seasonal deviations.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Viva Defense Guide */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <HelpCircle className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-black text-slate-900">B.Tech Viva Examination Revision Guide</h2>
            <p className="text-xs text-slate-500">Key questions and answers for oral examination defense</p>
          </div>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleQuestion(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base pr-4">
                  {idx + 1}. {item.q}
                </span>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === idx && (
                <div className="p-4 sm:p-5 bg-emerald-50/50 border-t border-slate-100 text-slate-700 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
