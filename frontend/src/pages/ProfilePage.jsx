import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Sprout,
  CheckCircle,
  Key,
  ShieldCheck
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [userPredictionsCount, setUserPredictionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await api.get('/predictions?limit=1');
        setUserPredictionsCount(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load user stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading user profile credentials..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Account & Security</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account identity, security role, and prediction usage records.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
              <span className={`w-fit text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                user?.role === 'ADMIN'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {user?.role === 'ADMIN' ? 'Administrator' : 'Farmer / Agronomist'}
              </span>
            </div>
            <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start">
              <Mail className="w-4 h-4 mr-1.5 text-slate-400" />
              {user?.email}
            </p>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Personal Predictions Stored
            </span>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {userPredictionsCount} Predictions
            </span>
            <p className="text-xs text-slate-500">
              Persistent records saved to MongoDB with audit timestamps.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Security Protocol
            </span>
            <span className="text-base font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              JWT + Bcrypt (Salt Rounds = 12)
            </span>
            <p className="text-xs text-slate-500">
              Passwords are salted and hashed. Tokens expire every 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
