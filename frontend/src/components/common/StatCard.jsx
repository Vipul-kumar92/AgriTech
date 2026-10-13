import React from 'react';

export const StatCard = ({ title, value, unit, subtitle, icon: Icon, color = 'emerald', trend }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-emerald-500/10',
      glow: 'from-emerald-500/10 to-teal-500/5',
      badge: 'bg-emerald-100 text-emerald-800'
    },
    amber: {
      bg: 'bg-amber-50/90 text-amber-700 border-amber-200/80 shadow-amber-500/10',
      glow: 'from-amber-500/10 to-orange-500/5',
      badge: 'bg-amber-100 text-amber-800'
    },
    blue: {
      bg: 'bg-sky-50/90 text-sky-700 border-sky-200/80 shadow-sky-500/10',
      glow: 'from-sky-500/10 to-blue-500/5',
      badge: 'bg-sky-100 text-sky-800'
    },
    purple: {
      bg: 'bg-purple-50/90 text-purple-700 border-purple-200/80 shadow-purple-500/10',
      glow: 'from-purple-500/10 to-indigo-500/5',
      badge: 'bg-purple-100 text-purple-800'
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="relative overflow-hidden rounded-2xl glass-card-agri p-6 transition-all duration-300">
      {/* Soft gradient background glow */}
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl pointer-events-none`} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
            {unit && <span className="text-xs font-semibold text-emerald-700">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${scheme.bg} flex-shrink-0`}>
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
