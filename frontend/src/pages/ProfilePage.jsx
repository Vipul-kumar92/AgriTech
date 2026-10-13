import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/StatCard';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Sprout,
  CheckCircle,
  Key,
  ShieldCheck,
  Edit3,
  Save,
  X,
  AlertCircle,
  Check,
  Camera,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=FarmerGreen',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=KisanAgri',
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { t, isHindi } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [picture, setPicture] = useState(user?.picture || '');

  // Password Change Fields
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setPicture(user.picture || '');
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMsg('');
    setSuccessMsg('');
    setShowPasswordSection(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setPicture(user.picture || '');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg(isHindi ? 'नाम रिक्त नहीं हो सकता' : 'Name cannot be empty');
      return;
    }

    if (showPasswordSection && newPassword) {
      if (newPassword.length < 6) {
        setErrorMsg(isHindi ? 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg(isHindi ? 'नया पासवर्ड मेल नहीं खाता' : 'New passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        role: 'FARMER',
        picture: picture.trim() || null,
      };

      if (showPasswordSection && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      updateUser(res.data);
      setIsEditing(false);
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg(isHindi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
        (isHindi ? 'प्रोफ़ाइल अपडेट करने में विफल' : 'Failed to update profile. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={isHindi ? 'उपयोगकर्ता प्रोफ़ाइल विवरण लोड हो रहा है...' : 'Loading user profile credentials...'} />;
  }

  const isGoogleUser = user?.auth_provider === 'google';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" />
            <span>{isHindi ? 'खाता एवं सुरक्षा' : 'Account & Security'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isHindi ? 'उपयोगकर्ता प्रोफ़ाइल' : 'User Profile'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isHindi
              ? 'अपनी व्यक्तिगत जानकारी, संपर्क नंबर, फोटो और भूमिका को संपादित करें।'
              : 'Manage and update your account identity, personal details, and avatar.'}
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <X className="w-4 h-4" />
              <span>{isHindi ? 'रद्द करें' : 'Cancel'}</span>
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isHindi ? 'सहेजें' : 'Save'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center space-x-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-8">
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-emerald-500 shadow-lg shadow-emerald-600/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-emerald-600 text-white rounded-xl shadow-md hover:scale-110 transition-transform"
                  title={isHindi ? 'फोटो बदलें' : 'Change avatar'}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                  <span className="w-fit text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300">
                    🌾 {isHindi ? 'किसान' : 'Farmer'}
                  </span>
                  {isGoogleUser && (
                    <span className="w-fit text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                      <span>Google Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {user?.email}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center text-slate-700 font-medium">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <Edit3 className="w-4 h-4" />
                <span>{isHindi ? 'प्रोफ़ाइल विवरण संपादित करें' : 'Edit Profile Credentials'}</span>
              </div>
              <span className="text-xs text-slate-400">
                {isHindi ? 'सभी बदलाव डेटाबेस में सुरक्षित किए जाएंगे' : 'Changes will be saved to MongoDB'}
              </span>
            </div>

            {/* Avatar Section & Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isHindi ? 'प्रोफ़ाइल फोटो / अवतार' : 'Profile Picture / Avatar'}
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80">
                <div className="relative flex-shrink-0">
                  {picture ? (
                    <img
                      src={picture}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="text-xs font-semibold text-slate-600">
                    {isHindi ? 'अपना पसंदीदा अवतार या आरंभिक अक्षर चुनें:' : 'Select your preferred avatar or badge:'}
                  </div>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPicture(p)}
                        className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition-all ${
                          picture === p ? 'border-emerald-600 ring-2 ring-emerald-400 scale-105 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPicture(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Farmer')}&backgroundColor=16a34a`)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        picture?.includes('initials')
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {isHindi ? '✨ आरंभिक अक्षर' : '✨ Initials'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPicture('')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        !picture
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      {isHindi ? 'डिफ़ॉल्ट लोगो' : 'Default Badge'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पूरा नाम *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'ईमेल (स्थायी)' : 'Email Address (Locked)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    {isGoogleUser ? 'Google ID' : 'Verified'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'फ़ोन नंबर' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>


            </div>

            {/* Password Change Toggle (Only for local email accounts) */}
            {!isGoogleUser && (
              <div className="pt-2 border-t border-slate-100">
                {!showPasswordSection ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1.5 py-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isHindi ? '+ पासवर्ड बदलें' : '+ Change Password'}</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center">
                        <Key className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                        {isHindi ? 'पासवर्ड सुरक्षा अपडेट' : 'Change Password'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                      >
                        {isHindi ? 'रद्द करें' : 'Cancel'}
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          {isHindi ? 'वर्तमान पासवर्ड' : 'Current Password'}
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          {isHindi ? 'नया पासवर्ड' : 'New Password'}
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          {isHindi ? 'पुष्टि करें' : 'Confirm Password'}
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isHindi ? 'बदलाव सहेजें' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
