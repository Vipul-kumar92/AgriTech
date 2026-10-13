import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Languages, Sparkles } from 'lucide-react';

const LanguageCircleToggle = ({ size = 'normal', showLabel = false, className = '' }) => {
  const { language, toggleLanguage, setLanguage, isHindi } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeClasses = {
    small: 'w-9 h-9 text-xs',
    normal: 'w-11 h-11 text-sm',
    large: 'w-13 h-13 text-base',
  }[size] || 'w-11 h-11 text-sm';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Small circular toggle button */}
      <button
        type="button"
        onClick={toggleLanguage}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative ${sizeClasses} rounded-full flex items-center justify-center
          bg-white/90 dark:bg-emerald-950/80 backdrop-blur-md
          border-2 ${isHindi ? 'border-amber-500 shadow-amber-500/25' : 'border-emerald-500 shadow-emerald-500/25'}
          shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
          transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-emerald-400/50`}
        aria-label={isHindi ? 'Switch to English' : 'Switch to Hindi'}
        title={isHindi ? 'अंग्रेज़ी में बदलें / Switch to English' : 'हिंदी में बदलें / Switch to Hindi'}
      >
        {/* Subtle glowing ring effect on hover */}
        <span
          className={`absolute -inset-0.5 rounded-full ${
            isHindi ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
          } opacity-0 group-hover:opacity-40 blur-[3px] transition-opacity duration-300`}
        />

        {/* Inner circle content */}
        <div className="relative z-10 flex items-center justify-center font-bold tracking-tight">
          {isHindi ? (
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-[11px] font-black text-amber-700 bg-amber-50/80 px-1 rounded">
                EN
              </span>
              <span className="text-[8px] font-semibold text-slate-500 mt-0.5">
                English
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-sm font-black text-emerald-700 bg-emerald-50/80 px-1 rounded">
                हि
              </span>
              <span className="text-[8px] font-semibold text-slate-500 mt-0.5">
                हिंदी
              </span>
            </div>
          )}
        </div>

        {/* Small active indicator dot */}
        <span
          className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isHindi ? 'bg-amber-500' : 'bg-emerald-500'
          } animate-pulse`}
        />
      </button>

      {/* Floating tooltip on hover */}
      {isHovered && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap">
          <div className="bg-slate-900/95 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl backdrop-blur-md border border-slate-700/80 flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-150">
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
            </span>
            <span className="text-[9px] text-slate-400 px-1 py-0.2 bg-slate-800 rounded border border-slate-700">
              {isHindi ? 'EN' : 'हि'}
            </span>
          </div>
        </div>
      )}

      {/* Optional adjacent label */}
      {showLabel && (
        <span className="ml-2.5 text-xs font-semibold text-slate-600 hidden sm:inline-block">
          {isHindi ? 'हिंदी सक्रिय' : 'English Active'}
        </span>
      )}
    </div>
  );
};

export default LanguageCircleToggle;
