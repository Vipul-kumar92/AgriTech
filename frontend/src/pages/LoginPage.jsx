import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleAuthModal, { GoogleIcon } from '../components/auth/GoogleAuthModal';
import { decodeJwt } from '../utils/jwt';
import { Sprout, LogIn, Lock, Mail, AlertCircle, Shield, User, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(
    () => import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('agritech_google_client_id') || ''
  );

  const googleButtonRef = useRef(null);
  const { login, loginWithGoogle } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';

  // Real Google Identity Services (GIS) Account Chooser integration
  useEffect(() => {
    if (!googleClientId.trim() || !window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId.trim(),
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 360,
        });
      }
      // Trigger Google One-Tap prompt on supported devices
      window.google.accounts.id.prompt();
    } catch (err) {
      console.warn('GIS initialization note:', err);
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const decoded = decodeJwt(response.credential);
      await loginWithGoogle({
        token: response.credential,
        email: decoded?.email,
        name: decoded?.name,
        picture: decoded?.picture,
        role: 'FARMER',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        (isHindi ? 'Google प्रमाणीकरण विफल रहा' : 'Google authentication failed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || (isHindi ? 'प्रमाणीकरण विफल। कृपया अपना विवरण जांचें।' : 'Failed to authenticate. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Frosted Glassmorphism Login Card */}
      <div className="relative z-10 max-w-md w-full space-y-7 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/60 shadow-2xl shadow-emerald-950/50">
        
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isHindi ? 'लॉग इन करें' : 'Sign In to AgriYield'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            {isHindi ? 'अपने कृषि कार्यक्षेत्र और पूर्वानुमान डेटा तक पहुंचें' : 'Access your agricultural workspace & predictions'}
          </p>
        </div>

        {isExpired && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {isHindi ? 'आपका सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।' : 'Your session has expired. Please sign in again.'}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Google Authentication Button */}
        <div>
          {googleClientId ? (
            <div className="w-full flex flex-col items-center justify-center space-y-1.5">
              <div ref={googleButtonRef} className="w-full flex justify-center min-h-[44px]" />
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="text-[11px] text-slate-400 hover:text-emerald-600 transition-colors underline"
              >
                {isHindi ? 'Google Client ID बदलें' : 'Settings / Change Client ID'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 group"
            >
              <GoogleIcon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>{isHindi ? 'Google के साथ जारी रखें' : 'Continue with Google'}</span>
            </button>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {loading ? (isHindi ? 'प्रमाणित किया जा रहा है...' : 'Authenticating...') : (isHindi ? 'साइन इन करें' : 'Sign In')}
          </button>
        </form>


        {/* Sign up link */}
        <div className="text-center pt-1 text-xs text-slate-600">
          <span>{isHindi ? 'खाता नहीं है? ' : "Don't have an account? "}</span>
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
            {isHindi ? 'नया खाता बनाएं →' : 'Register here →'}
          </Link>
        </div>
      </div>

      {/* Google Authentication Modal */}
      <GoogleAuthModal 
        isOpen={isGoogleModalOpen} 
        onClose={() => setIsGoogleModalOpen(false)} 
        onClientIdUpdated={(newId) => setGoogleClientId(newId)}
      />
    </div>
  );
};

export default LoginPage;
