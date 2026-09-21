import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  History,
  BarChart3,
  Database,
  Award,
  Sparkles,
  BookOpen,
  User,
  ShieldCheck,
  Users,
  FileSpreadsheet,
  Map,
  SlidersHorizontal,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Close button on mobile */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation Section */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Farmer & ML Workspace
            </div>
            <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/predict" onClick={onClose} className={navItemClass}>
              <Sprout className="w-4 h-4 flex-shrink-0" />
              <span>Predict Yield</span>
            </NavLink>
            <NavLink to="/map" onClick={onClose} className={navItemClass}>
              <Map className="w-4 h-4 flex-shrink-0" />
              <span>Agri Yield Map</span>
            </NavLink>
            <NavLink to="/simulator" onClick={onClose} className={navItemClass}>
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
              <span>What-If Simulator</span>
            </NavLink>
            <NavLink to="/history" onClick={onClose} className={navItemClass}>
              <History className="w-4 h-4 flex-shrink-0" />
              <span>Prediction History</span>
            </NavLink>
            <NavLink to="/analytics" onClick={onClose} className={navItemClass}>
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span>Agri Analytics</span>
            </NavLink>
          </div>

          {/* Research & Data Science Section */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Data Science & Evaluation
            </div>
            <NavLink to="/dataset-insights" onClick={onClose} className={navItemClass}>
              <Database className="w-4 h-4 flex-shrink-0" />
              <span>Dataset Insights</span>
            </NavLink>
            <NavLink to="/model-performance" onClick={onClose} className={navItemClass}>
              <Award className="w-4 h-4 flex-shrink-0" />
              <span>Model Benchmarks</span>
            </NavLink>
            <NavLink to="/feature-importance" onClick={onClose} className={navItemClass}>
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Feature Influence</span>
            </NavLink>
            <NavLink to="/about" onClick={onClose} className={navItemClass}>
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>Methodology & Viva</span>
            </NavLink>
          </div>

          {/* Administrative Center (Admins only) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Admin Center
              </div>
              <NavLink to="/admin" onClick={onClose} className={navItemClass}>
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Admin Overview</span>
              </NavLink>
              <NavLink to="/admin/users" onClick={onClose} className={navItemClass}>
                <Users className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>User Directory</span>
              </NavLink>
              <NavLink to="/admin/predictions" onClick={onClose} className={navItemClass}>
                <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>Global Audit Log</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* User profile bottom dock */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800">My Profile</p>
              <p className="text-[10px] text-slate-500">Account settings</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
