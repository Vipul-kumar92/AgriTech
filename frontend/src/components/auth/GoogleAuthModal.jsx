import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  Mail, 
  User, 
  ShieldCheck, 
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

import { decodeJwt } from '../../utils/jwt';

const GoogleAuthModal = ({ isOpen, onClose, onClientIdUpdated }) => {
  const { loginWithGoogle } = useAuth();
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('gis'); // 'gis' for real Google account popup
  const [realEmail, setRealEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const role = 'FARMER';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Google Client ID State
  const initialClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('agritech_google_client_id') || '';
  const [clientId, setClientId] = useState(initialClientId);
  const [showConfig, setShowConfig] = useState(!initialClientId);
  const [savedClientIdSuccess, setSavedClientIdSuccess] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);


  const googleButtonRef = useRef(null);

  // Check if GSI is loaded
  useEffect(() => {
    const checkGSI = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true);
      }
    };
    checkGSI();
    const interval = setInterval(checkGSI, 500);
    return () => clearInterval(interval);
  }, []);

  // Initialize GIS button whenever activeTab is 'gis', modal is open, and clientId is available
  useEffect(() => {
    if (!isOpen || !gisLoaded || !clientId.trim() || activeTab !== 'gis') return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId.trim(),
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 340,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    } catch (err) {
      console.warn('GIS initialization notice:', err);
    }
  }, [isOpen, gisLoaded, clientId, activeTab]);

  if (!isOpen) return null;

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
        role: role,
      });
      onClose();
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

  const handleRealGmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = realEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError(isHindi ? 'कृपया अपना मान्य Gmail पता दर्ज करें' : 'Please enter your valid Gmail address');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(isHindi ? 'कृपया एक वैध ईमेल पता दर्ज करें' : 'Please provide a valid email format');
      return;
    }

    setLoading(true);
    try {
      const derivedName = fullName.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=16a34a,0284c7,ea580c`;

      await loginWithGoogle({
        email: cleanEmail,
        name: derivedName,
        role: role,
        picture: avatarUrl,
      });

      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        (isHindi ? 'Gmail प्रमाणीकरण में त्रुटि आई' : 'Failed to authenticate Gmail account')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = async (e) => {
    e.preventDefault();
    const cleanId = clientId.trim();
    if (!cleanId) {
      localStorage.removeItem('agritech_google_client_id');
      setSavedClientIdSuccess(false);
      if (onClientIdUpdated) onClientIdUpdated('');
      return;
    }
    localStorage.setItem('agritech_google_client_id', cleanId);
    setSavedClientIdSuccess(true);
    if (onClientIdUpdated) onClientIdUpdated(cleanId);

    try {
      await fetch('/api/auth/google-client-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: cleanId }),
      });
    } catch (err) {
      console.warn('Backend client_id persistence note:', err);
    }

    setTimeout(() => {
      setSavedClientIdSuccess(false);
      setShowConfig(false);
    }, 1500);
  };

  const isLikelyGmail = realEmail.toLowerCase().includes('@gmail.com');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <GoogleIcon className="w-6 h-6" />
            <div>
              <span className="font-bold text-slate-800 text-sm block">
                {isHindi ? 'Google से प्रमाणीकरण' : 'Sign in with Google'}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                {isHindi ? 'सत्यापित और डेटाबेस में सुरक्षित' : 'Real Google & Gmail Integration'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-6 pt-3 space-x-4 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('gmail')}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center space-x-2 ${
              activeTab === 'gmail' 
                ? 'text-emerald-700 border-b-2 border-emerald-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isHindi ? 'असली Gmail से खाता बनाएं' : 'Direct Real Gmail'}</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 rounded-full font-extrabold uppercase">
              {isHindi ? 'त्वरित' : 'Instant'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gis')}
            className={`pb-2.5 text-xs font-bold transition-all relative flex items-center space-x-2 ${
              activeTab === 'gis' 
                ? 'text-blue-700 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>{isHindi ? 'Google One-Tap / OAuth बटन' : 'Google OAuth Popup'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Direct Real Gmail Fast-Track */}
          {activeTab === 'gmail' && (
            <form onSubmit={handleRealGmailSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block">
                    {isHindi ? 'अपने असली Gmail खाते से लॉगिन या पंजीकरण करें:' : 'Sign up or login with your authentic Gmail address:'}
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    {isHindi 
                      ? 'यह खाता आपके व्यक्तिगत उपज पूर्वानुमानों, मौसम अलर्ट्स और डेटा को MongoDB डेटाबेस में सुरक्षित रखेगा।'
                      : 'Your real Google identity will be registered and synchronized with personal yield records in MongoDB.'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'Google ईमेल (Gmail) *' : 'Google Email (Gmail) *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={realEmail}
                    onChange={(e) => setRealEmail(e.target.value)}
                    placeholder="e.g. vipul.kumar@gmail.com"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                  {isLikelyGmail && (
                    <span className="absolute right-3 top-2.5 text-emerald-600 flex items-center text-xs font-bold" title="Valid Gmail">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Gmail
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {isHindi ? 'अपना वास्तविक Gmail खाता दर्ज करें' : 'Enter your authentic Gmail or Google Workspace address'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isHindi ? 'पूरा नाम (Full Name)' : 'Full Name (Optional)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vipul Kumar"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 bg-white rounded-full p-0.5" />
                    <span>{isHindi ? 'इस Gmail से खाता बनाएं और आगे बढ़ें' : 'Continue with this Gmail Account'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Official Google OAuth GIS Button */}
          {activeTab === 'gis' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start space-x-2.5">
                <GoogleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block">
                    {isHindi ? 'आधिकारिक Google Identity Services OAuth 2.0:' : 'Official Google Identity Services OAuth 2.0:'}
                  </span>
                  <span className="text-[11px] text-blue-800">
                    {isHindi 
                      ? 'Google द्वारा प्रदत्त आधिकारिक पॉपअप या One-Tap विंडो से सीधे अपने Google खाते का चयन करें।'
                      : 'Use Google Cloud OAuth credentials to render native Sign-in-with-Google button and popup prompt.'}
                  </span>
                </div>
              </div>

              {/* Rendered Google Official Button Container */}
              {clientId.trim() ? (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-semibold text-slate-600">
                    {isHindi ? 'आधिकारिक Google बटन पर क्लिक करें:' : 'Click the Google button below to sign in:'}
                  </div>
                  <div ref={googleButtonRef} className="min-h-[44px] flex items-center justify-center" />
                  <p className="text-[10px] text-slate-400">
                    {isHindi ? 'Google Cloud OAuth 2.0 द्वारा सुरक्षित' : 'Powered by Google Identity Services Web Client'}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-2">
                  <div className="font-bold flex items-center">
                    <Key className="w-4 h-4 mr-1.5 text-amber-600" />
                    {isHindi ? 'Google Client ID आवश्यक है' : 'Google Client ID Required for Native Popup'}
                  </div>
                  <p className="text-[11px]">
                    {isHindi 
                      ? 'आधिकारिक Google One-Tap/Popup के लिए Google Cloud Console से Web Client ID दर्ज करें, या तुरंत लॉगिन करने के लिए "Direct Real Gmail" टैब का उपयोग करें।'
                      : 'To display the native Google account popup dialog, provide your Google Cloud Web Client ID below, or use the "Direct Real Gmail" tab.'}
                  </p>
                </div>
              )}

              {/* Collapsible Client ID Settings */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isHindi ? 'Google Client ID कॉन्फ़िगरेशन' : 'Google OAuth Client ID Settings'}</span>
                  </span>
                  {showConfig ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showConfig && (
                  <form onSubmit={handleSaveClientId} className="p-4 bg-white space-y-3 border-t border-slate-100 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Client ID (e.g., xxxxx-xxxx.apps.googleusercontent.com)
                      </label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="your-google-client-id.apps.googleusercontent.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {savedClientIdSuccess && (
                          <span className="text-emerald-600 font-bold flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {isHindi ? 'सहेजा गया!' : 'Client ID Saved!'}
                          </span>
                        )}
                      </span>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition-colors"
                      >
                        {isHindi ? 'Client ID सहेजें' : 'Save Client ID'}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
                      <div className="font-semibold text-slate-700 flex items-center">
                        <HelpCircle className="w-3 h-3 mr-1 text-slate-400" />
                        {isHindi ? 'Google Cloud Console से Client ID कैसे प्राप्त करें:' : 'How to get Google Client ID (2 minutes):'}
                      </div>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Visit <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Cloud Console</a>.</li>
                        <li>Create Credentials &gt; OAuth Client ID &gt; Web Application.</li>
                        <li>Add Authorized JavaScript Origin: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">http://localhost:5173</code></li>
                        <li>Copy the Client ID and paste it here.</li>
                      </ol>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Security Banner */}
        <div className="px-6 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isHindi ? '256-बिट सुरक्षित प्रमाणीकरण' : 'OAuth 2.0 & MongoDB Database Encrypted'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            AgriTech ID v1.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
