import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess: React.FC = () => {
  const { t } = useLanguage();
  const { clearCart, items, getCartTotal } = useCart();
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
        // Get cart items before clearing
        const cartItems = items;
        const total = getCartTotal();
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || '';
        const userName = session?.user?.user_metadata?.full_name || 'Customer';

        if (sessionId.startsWith('cs_')) {
          const { data: verifyData, error: verifyErr } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId },
          });
          if (verifyErr || !verifyData?.verified) {
            setError((verifyData as { error?: string })?.error || verifyErr?.message || 'Payment not verified');
            setIsVerified(false);
            setIsLoading(false);
            return;
          }
        }

        setIsVerified(true);

        // Send invoice email before clearing cart
        if (cartItems.length > 0) {
          try {
            let shipping: any = undefined;
            try {
              const raw = localStorage.getItem(`checkout:${sessionId}:shipping`);
              if (raw) shipping = JSON.parse(raw);
            } catch {}
            const invoiceEmail = shipping?.email || userEmail;
            await supabase.functions.invoke('send-invoice', {
              body: {
                orderId: sessionId,
                referenceNo: sessionId,
                customerEmail: invoiceEmail,
                customerName: userName,
                items: cartItems.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  amount: Math.round(item.price * 100), // Convert to satang
                })),
                totalAmount: total,
                taxAmount: 0,
                shipping,
              }
            });
          } catch (invoiceError) {
            console.error('Failed to send invoice:', invoiceError);
            // Don't fail the payment if invoice fails
          }
        }

        // Clear cart after sending invoice
        clearCart();
      } catch (err) {
        console.error('Payment verification failed:', err);
        setError('Verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart, items, getCartTotal]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t('verifying')}
          </h1>
        </div>
      </main>
    );
  }

  if (error || !isVerified) {
    return (
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
    );
  }

  return (
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
  );
};

export default PaymentSuccess;
