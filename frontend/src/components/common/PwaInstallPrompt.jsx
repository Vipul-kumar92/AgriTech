import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Download, WifiOff, X, Smartphone } from 'lucide-react';

const PwaInstallPrompt = () => {
  const { isHindi } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosHint, setIsIosHint] = useState(false);

  useEffect(() => {
    const standaloneCheck =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standaloneCheck);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua) && !standaloneCheck;
    if (isIos) {
      setIsIosHint(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {isOffline && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 z-50 max-w-xs bg-amber-900 text-amber-50 px-3.5 py-2.5 rounded-2xl shadow-lg border border-amber-500/40 flex items-center space-x-2 text-xs font-bold">
          <WifiOff className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <span>
            {isHindi
              ? 'ऑफ़लाइन मोड — कैश किया गया डेटा सक्रिय है'
              : 'Offline Mode — Cached advisories & data active'}
          </span>
        </div>
      )}

      {!isStandalone && !dismissedInstall && deferredPrompt && (
        <div className="fixed bottom-20 lg:bottom-5 right-4 z-50 max-w-sm bg-white/95 backdrop-blur-md border-2 border-emerald-300 rounded-2xl shadow-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <img src="/pwa-192x192.png" alt="KrishiPulse App" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-xs" />
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">
                {isHindi ? 'KrishiPulse.AI ऐप इंस्टॉल करें' : 'Install KrishiPulse.AI App'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {isHindi ? 'फ़ोन पर तेज़ व ऑफ़लाइन एक्सेस पाएं' : 'Full-screen app with offline advisory cache'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isHindi ? 'इंस्टॉल' : 'Install'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissedInstall(true)}
              className="p-1 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isStandalone && !dismissedInstall && !deferredPrompt && isIosHint && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-emerald-950/95 text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>
              {isHindi
                ? 'होम स्क्रीन पर जोड़ने के लिए Share ➔ "Add to Home Screen" चुनें'
                : 'To install on iPhone: tap Share ➔ "Add to Home Screen"'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissedInstall(true)}
            className="p-1 text-emerald-300 hover:text-white"
            aria-label="Dismiss iOS install hint"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};

export default PwaInstallPrompt;
