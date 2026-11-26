import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Custom SVG Emblem for KrishiPulse.AI:
 * Combines a stylized agricultural leaf/sprout with an AI telemetry pulse waveform.
 */
export const BrandMark = ({ className = 'w-9 h-9 sm:w-10 sm:h-10' }) => (
  <div
    className={`${className} relative rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/25 ring-2 ring-emerald-300/60 overflow-hidden flex-shrink-0`}
  >
    {/* Subtle top-left glass sheen */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none" />
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[78%] h-[78%] relative z-10"
      aria-hidden="true"
    >
      {/* Stylized Sprout / Leaf Arch */}
      <path
        d="M20 7C13.5 9.2 9.5 15.2 10.2 21.8C10.8 27 14.8 30.8 20 31.8C25.2 30.8 29.2 27 29.8 21.8C30.5 15.2 26.5 9.2 20 7Z"
        fill="white"
        fillOpacity="0.18"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Central Leaf Stem */}
      <path
        d="M20 31.5V13.5"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      {/* AI Telemetry Pulse Wave */}
      <path
        d="M7.5 22.5H13.5L16.2 17.5L19.8 26.5L23.2 18.8L25.6 22.5H32.5"
        stroke="#FCD34D"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* AI Data Node */}
      <circle cx="32.5" cy="22.5" r="2.2" fill="#FEF3C7" />
    </svg>
  </div>
);

const BrandLogo = ({
  to = '/',
  subtitle = 'Precision Agriculture',
  showSubtitleOnMobile = false,
  markSize = 'w-9 h-9 sm:w-10 sm:h-10',
  textSize = 'text-lg sm:text-xl',
}) => (
  <Link to={to} className="inline-flex items-center space-x-2.5 sm:space-x-3 group flex-shrink-0">
    <BrandMark className={markSize} />
    <div className="flex flex-col text-left">
      <span className={`${textSize} font-black tracking-tight leading-none text-slate-900 group-hover:text-emerald-800 transition-colors`}>
        Krishi
        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Pulse
        </span>
        <span className="text-amber-500 font-extrabold">.AI</span>
      </span>
      <span
        className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700/85 mt-0.5 ${
          showSubtitleOnMobile ? 'block' : 'hidden sm:block'
        }`}
      >
        {subtitle}
      </span>
    </div>
  </Link>
);

export default BrandLogo;
