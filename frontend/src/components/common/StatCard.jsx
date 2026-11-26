import React from 'react';

export const StatCard = ({ title, value, unit, subtitle, icon: Icon, color = 'emerald', trend }) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25',
      topBar: 'from-emerald-400 via-teal-500 to-emerald-600',
      glow: 'from-emerald-500/15 to-teal-500/5',
      unitText: 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25',
      topBar: 'from-amber-400 via-orange-500 to-amber-600',
      glow: 'from-amber-500/15 to-orange-500/5',
      unitText: 'text-amber-700 bg-amber-50 border-amber-200/70'
    },
    blue: {
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/25',
      topBar: 'from-sky-400 via-blue-500 to-indigo-600',
      glow: 'from-sky-500/15 to-blue-500/5',
      unitText: 'text-sky-700 bg-sky-50 border-sky-200/70'
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/25',
      topBar: 'from-violet-400 via-purple-500 to-indigo-600',
      glow: 'from-violet-500/15 to-purple-500/5',
      unitText: 'text-purple-700 bg-purple-50 border-purple-200/70'
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="group relative overflow-hidden rounded-2xl glass-card-agri ring-1 ring-white/70 p-6 transition-all duration-300">
      {/* Subtle top gradient accent */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${scheme.topBar} opacity-80`} />

      {/* Soft gradient background glow */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">{value}</span>
            {unit && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${scheme.unitText}`}>
                {unit}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${scheme.iconBg} flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs font-medium text-emerald-600">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ message = 'Loading intelligence module...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};
