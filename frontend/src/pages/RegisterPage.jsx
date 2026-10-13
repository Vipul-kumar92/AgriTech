import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleAuthModal, { GoogleIcon } from '../components/auth/GoogleAuthModal';
import { Sprout, UserPlus, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role = 'FARMER';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const { register } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(isHindi ? 'पासवर्ड मेल नहीं खाते हैं' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || (isHindi ? 'खाता बनाने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to create account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Frosted Glassmorphism Register Card */}
      <div className="relative z-10 max-w-md w-full space-y-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/60 shadow-2xl shadow-emerald-950/50">
        
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isHindi ? 'नया किसान खाता बनाएं' : 'Create Farmer Account'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            {isHindi ? 'डेटाबेस में स्थायी रूप से पंजीकृत करें और तुरंत पूर्वानुमान प्राप्त करें' : 'Store profile in database & access AI crop predictions'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Google Authentication Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 group"
          >
            <GoogleIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span>{isHindi ? 'Google से खाता बनाएं' : 'Sign up with Google'}</span>
          </button>

          {/* Clean 'or' text on same page */}
          <div className="text-center my-3.5">
            <span className="text-xs font-semibold text-slate-400 tracking-wider">
              {isHindi ? '— या —' : '— or —'}
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isHindi ? 'पूरा नाम' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Patel"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isHindi ? 'ईमेल पता' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@agritech.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isHindi ? 'पासवर्ड' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {loading ? (isHindi ? 'डेटाबेस में सुरक्षित किया जा रहा है...' : 'Storing in Database...') : (isHindi ? 'किसान खाता बनाएं' : 'Create Account')}
          </button>
        </form>

        {/* Sign in link */}
        <div className="text-center pt-2 text-xs text-slate-600">
          <span>{isHindi ? 'पहले से खाता है? ' : 'Already have an account? '}</span>
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
            {isHindi ? 'यहाँ साइन इन करें →' : 'Sign in here →'}
          </Link>
        </div>
      </div>

      {/* Google Authentication Modal */}
      <GoogleAuthModal 
        isOpen={isGoogleModalOpen} 
        onClose={() => setIsGoogleModalOpen(false)} 
      />
    </div>
  );
};

export default RegisterPage;
