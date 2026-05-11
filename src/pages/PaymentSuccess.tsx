import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

type UiPhase = 'loading' | 'pending' | 'success' | 'failed';

const POLL_MS = 2000;
const POLL_MAX_MS = 5 * 60 * 1000;

const PaymentSuccess: React.FC = () => {
  const { language, t } = useLanguage();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [phase, setPhase] = useState<UiPhase>('loading');
  const [detailMessage, setDetailMessage] = useState<string | null>(null);

  const finalizeRef = useRef(false);

  const finalizeSuccess = useCallback(() => {
    if (finalizeRef.current) return;
    finalizeRef.current = true;

    try {
      if (sessionId) localStorage.removeItem(`checkout:${sessionId}:shipping`);
    } catch {
      /* ignore */
    }
    clearCart();
    setPhase('success');
  }, [clearCart, sessionId]);

  const finalizeFailed = useCallback((reason?: string) => {
    if (finalizeRef.current) return;
    finalizeRef.current = true;
    setDetailMessage(reason ?? null);
    setPhase('failed');
  }, []);

  useEffect(() => {
    finalizeRef.current = false;
    if (!sessionId) {
      setPhase('failed');
      setDetailMessage(language === 'th' ? 'ไม่พบรหัสเซสชัน' : 'No session ID provided');
      return;
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let pollDeadline: number | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    type VerifyPayload = {
      verified?: boolean;
      payment_status?: string;
      checkout_status?: string;
      error?: string;
    };

    const verifyOnce = async (): Promise<
      | { ok: false; message: string }
      | { ok: true; data: VerifyPayload }
    > => {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId },
      });
      if (error) return { ok: false, message: error.message };
      return { ok: true, data: (data ?? {}) as VerifyPayload };
    };

    const classify = (d: VerifyPayload): 'success' | 'failed' | 'pending' => {
      const ps = d.payment_status ?? '';
      const cs = d.checkout_status ?? '';
      if (d.verified || ps === 'paid' || ps === 'no_payment_required') return 'success';
      if (cs === 'expired') return 'failed';
      if (ps === 'unpaid') return 'pending';
      if (cs === 'open') return 'pending';
      if (cs === 'complete' && ps !== 'paid') return 'pending';
      return 'failed';
    };

    const run = async () => {
      const first = await verifyOnce();
      const outcome =
        first.ok ? classify(first.data) : ('pending' as const);

      if (first.ok && outcome === 'success') {
        finalizeSuccess();
        return;
      }
      if (first.ok && outcome === 'failed') {
        finalizeFailed(
          language === 'th' ? 'การชำระเงินไม่สำเร็จหรือหมดเวลา' : 'Payment failed or expired'
        );
        return;
      }

      setPhase('pending');
      setDetailMessage(
        language === 'th'
          ? 'รอการชำระเงิน (เช่น PromptPay) — หน้านี้จะอัปเดตอัตโนมัติ'
          : 'Waiting for payment (e.g. PromptPay). This page updates automatically.'
      );

      pollDeadline = Date.now() + POLL_MAX_MS;
      pollTimer = setInterval(async () => {
        if (Date.now() > (pollDeadline ?? 0)) {
          if (pollTimer) clearInterval(pollTimer);
          finalizeFailed(
            language === 'th'
              ? 'หมดเวลารอ — กรุณาตรวจสอบในประวัติการชำระเงิน'
              : 'Timed out — check payment history'
          );
          return;
        }
        const v = await verifyOnce();
        if (!v.ok) return;
        const c = classify(v.data);
        if (c === 'success') {
          if (pollTimer) clearInterval(pollTimer);
          finalizeSuccess();
        } else if (c === 'failed') {
          if (pollTimer) clearInterval(pollTimer);
          finalizeFailed();
        }
      }, POLL_MS);
    };

    void run();

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid || !sessionId.startsWith('cs_')) return;

      channel = supabase
        .channel(`order-session-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `checkout_session_id=eq.${sessionId}`,
          },
          (payload) => {
            const row = payload.new as { status?: string };
            if (row?.status === 'paid') {
              if (pollTimer) clearInterval(pollTimer);
              finalizeSuccess();
            }
            if (row?.status === 'failed' || row?.status === 'canceled') {
              if (pollTimer) clearInterval(pollTimer);
              finalizeFailed();
            }
          }
        )
        .subscribe();
    })();

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [sessionId, language, finalizeSuccess, finalizeFailed]);

  if (phase === 'loading') {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('verifying')}</h1>
        </div>
      </main>
    );
  }

  if (phase === 'pending') {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('paymentPendingTitle')}</h1>
          <p className="text-muted-foreground mb-2">{t('waitingPromptPay')}</p>
          {detailMessage && <p className="text-sm text-muted-foreground mb-8">{detailMessage}</p>}
          {sessionId && (
            <p className="text-xs font-mono text-muted-foreground mb-8 break-all">{sessionId}</p>
          )}
          <Link to="/payment-history" className="block mb-2">
            <Button variant="outline" size="lg" className="w-full">
              {t('paymentHistoryTitle')}
            </Button>
          </Link>
          <Link to="/shop" className="block">
            <Button size="lg" className="w-full">
              {t('continueShoppingBtn')}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (phase === 'failed') {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('paymentFailed')}</h1>
          <p className="text-muted-foreground mb-4">{t('paymentError')}</p>
          {detailMessage && <p className="text-sm text-muted-foreground mb-8">{detailMessage}</p>}
          <div className="space-y-4">
            <Link to="/cart" className="block">
              <Button size="lg" className="w-full">
                {t('returnToCart')}
              </Button>
            </Link>
            <Link to="/payment-history" className="block">
              <Button variant="outline" size="lg" className="w-full">
                {t('paymentHistoryTitle')}
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
        <h1 className="text-3xl font-bold text-foreground mb-4">{t('orderComplete')}</h1>
        <p className="text-muted-foreground mb-8">{t('thankYou')}</p>
        {sessionId && (
          <p className="text-sm text-muted-foreground mb-8">
            {t('orderNumber')}: {sessionId}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-6">{t('invoiceEmailNote')}</p>
        <div className="space-y-4">
          <Link to="/payment-history" className="block">
            <Button variant="outline" size="lg" className="w-full">
              {t('paymentHistoryTitle')}
            </Button>
          </Link>
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
