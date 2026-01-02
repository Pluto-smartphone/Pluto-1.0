import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CookieConsentState {
  consented: boolean;
  accepted: boolean;
  timestamp: string;
}

interface CookieConsentContextType {
  hasConsented: boolean;
  cookiesAccepted: boolean;
  acceptCookies: () => void;
  declineCookies: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const STORAGE_KEY = 'cookie-consent';

const getStoredConsent = (): CookieConsentState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
};

const saveConsent = (accepted: boolean): void => {
  const state: CookieConsentState = {
    consented: true,
    accepted,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const CookieConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setHasConsented(stored.consented);
      setCookiesAccepted(stored.accepted);
    }
  }, []);

  const acceptCookies = () => {
    saveConsent(true);
    setHasConsented(true);
    setCookiesAccepted(true);
  };

  const declineCookies = () => {
    saveConsent(false);
    setHasConsented(true);
    setCookiesAccepted(false);
  };

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasConsented(false);
    setCookiesAccepted(false);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        hasConsented,
        cookiesAccepted,
        acceptCookies,
        declineCookies,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
