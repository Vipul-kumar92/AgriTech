import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">
              AI-Based Crop Yield Prediction System
            </span>
            <span className="text-xs text-slate-400">| Final-Year B.Tech Capstone Project</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <Link to="/about" className="hover:text-emerald-600 transition-colors">Project Defense & Viva</Link>
            <Link to="/dataset-insights" className="hover:text-emerald-600 transition-colors">19,407 Records Dataset</Link>
            <Link to="/model-performance" className="hover:text-emerald-600 transition-colors">Random Forest (R² = 0.81)</Link>
            <span className="text-slate-300">|</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-600">FastAPI + React + MongoDB</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© 2026 AgriYield.AI. Empirical Agricultural Machine Learning Platform.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Designed for Academic Rigor & Sustainable Farming Support
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
