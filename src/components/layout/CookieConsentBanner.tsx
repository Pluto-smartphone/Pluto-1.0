import React from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const CookieConsentBanner: React.FC = () => {
  const { hasConsented, acceptCookies, declineCookies } = useCookieConsent();
  const { t } = useLanguage();

  if (hasConsented) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-card border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>
                  {t('cookieMessage')}{' '}
                  <Link
                    to="/privacy"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('cookieLearnMore')}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={declineCookies}
              >
                {t('cookieDecline')}
              </Button>
              <Button
                size="sm"
                onClick={acceptCookies}
              >
                {t('cookieAccept')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
