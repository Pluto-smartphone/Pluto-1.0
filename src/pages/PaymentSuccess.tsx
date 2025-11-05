import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess: React.FC = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (verifyError) {
          console.error('Payment verification error:', verifyError);
          setError('Failed to verify payment');
          setIsLoading(false);
          return;
        }

        if (data?.verified) {
          setIsVerified(true);
          clearCart();
        } else {
          setError('Payment not verified');
        }
      } catch (err) {
        console.error('Payment verification failed:', err);
        setError('Verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {t('verifying')}
            </h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('paymentFailed')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('paymentError')}
            </p>
            <div className="space-y-4">
              <Link to="/cart" className="block">
                <Button size="lg" className="w-full">
                  {t('returnToCart')}
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center animate-scale-in">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('orderComplete')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('thankYou')}
          </p>
          {sessionId && (
            <p className="text-sm text-muted-foreground mb-8">
              {t('orderNumber')}: {sessionId}
            </p>
          )}
          <div className="space-y-4">
            <Link to="/shop" className="block">
              <Button size="lg" className="w-full">
                {t('continueShoppingBtn')}
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" size="lg" className="w-full">
                {t('goHome')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
