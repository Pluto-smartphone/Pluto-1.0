import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type OrderRow = Tables<'orders'>;

const PaymentHistory: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadOrders = useCallback(async (uid: string, email: string | undefined) => {
    const byUser = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', uid)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(100);

    if (byUser.error) {
      console.error(byUser.error);
      setOrders([]);
      return;
    }

    const rows = new Map<string, OrderRow>();
    for (const r of (byUser.data ?? []) as OrderRow[]) {
      rows.set(r.id, r);
    }

    // Guest checkout: user_id null but shipping email matches account (RLS allows only matching email)
    if (email?.trim()) {
      const byEmail = await supabase
        .from('orders')
        .select('*')
        .is('user_id', null)
        .eq('status', 'paid')
        .ilike('customer_email', email.trim())
        .order('created_at', { ascending: false })
        .limit(100);

      if (!byEmail.error) {
        for (const r of (byEmail.data ?? []) as OrderRow[]) {
          rows.set(r.id, r);
        }
      }
    }

    const merged = Array.from(rows.values()).sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
    setOrders(merged.slice(0, 100));
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);

    void loadOrders(user.id, user.email ?? undefined).finally(() => {
      if (!cancelled) setOrdersLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, user?.email, loadOrders]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`orders-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void loadOrders(user.id, user.email ?? undefined);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email, loadOrders]);

  const loading = authLoading || (!!user && ordersLoading);

  const formatPrice = (amount: number | null) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount ?? 0);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const statusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'default' as const;
      case 'pending':
      case 'created':
        return 'secondary' as const;
      case 'failed':
      case 'canceled':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const statusLabel = (status: string | null) => {
    switch (status) {
      case 'paid':
        return t('paymentStatusPaid');
      case 'pending':
      case 'created':
        return t('paymentStatusPending');
      case 'failed':
        return t('paymentStatusFailed');
      case 'canceled':
        return t('paymentStatusCanceled');
      default:
        return status || '—';
    }
  };

  if (!user && !loading) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Link to="/payment">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t('paymentHistoryTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('paymentHistoryLoginHint')}</p>
            <Button asChild>
              <Link to="/shop">{language === 'th' ? 'ไปที่ร้าน' : 'Go to shop'}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/shop">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          {t('paymentHistoryTitle')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('paymentHistorySubtitle')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'th'
              ? 'ข้อมูลการจัดส่งจะถูกส่งไปยังอีเมลของคุณ'
              : 'Shipping information will be sent to your email.'}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">{t('paymentHistoryEmpty')}</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('paymentHistoryDate')}</TableHead>
                    <TableHead>{t('paymentHistorySession')}</TableHead>
                    <TableHead>{t('paymentHistoryStatus')}</TableHead>
                    <TableHead className="text-right">{t('total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>{formatDate(o.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate" title={o.checkout_session_id}>
                        {o.checkout_session_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          <Badge variant={statusBadgeVariant(o.status)}>
                            {statusLabel(o.status)}
                          </Badge>
                          {o.payment_status && (
                            <span className="text-xs text-muted-foreground">({o.payment_status})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(typeof o.amount_total === 'number' ? o.amount_total : Number(o.amount_total))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PaymentHistory;
