import React, { useState } from 'react';
import { Home, HandCoins, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Payment: React.FC = () => {
  const { items, getCartTotal } = useCart();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('promptpay'); // Default to PromptPay

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);

  const handlePayment = async () => {
    if (items.length === 0) {
      toast({
        title: language === 'th' ? 'ตะกร้าว่าง' : 'Cart is empty',
        description:
          language === 'th'
            ? 'กรุณาเพิ่มสินค้าในตะกร้า'
            : 'Please add items to cart',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          cartItems: items,
          paymentMethod,
        },
        headers: session
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description:
          err.message ||
          (language === 'th'
            ? 'ไม่สามารถดำเนินการชำระเงินได้'
            : 'Payment failed'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-16 text-center">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('paymentSuccess')}</h1>
          <p className="text-muted-foreground mb-8">
            {language === 'th'
              ? 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว'
              : 'Your order has been confirmed'}
          </p>
          <Link to="/shop">
            <Button className="w-full mb-2">
              {language === 'th' ? 'ช็อปต่อ' : 'Continue Shopping'}
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">
              {t('home')}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'th' ? 'กลับไปยังตะกร้า' : 'Back to Cart'}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{t('payment')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {language === 'th'
                      ? 'ข้อมูลการเรียกเก็บเงิน'
                      : 'Billing Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'ชื่อ' : 'First Name'}</Label>
                      <Input />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'นามสกุล' : 'Last Name'}</Label>
                      <Input />
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input type="email" />
                  </div>

                  <div>
                    <Label>{language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone'}</Label>
                    <Input />
                  </div>

                  <div>
                    <Label>{language === 'th' ? 'ที่อยู่' : 'Address'}</Label>
                    <Input />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HandCoins className="h-5 w-5" />
                    {language === 'th'
                      ? 'วิธีการชำระเงิน'
                      : 'Payment Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promptpay">
                        {language === 'th' ? 'พร้อมเพย์' : 'PromptPay'}
                      </SelectItem>
                      <SelectItem value="bank-transfer">
                        {language === 'th'
                          ? 'โอนเงินผ่านธนาคาร'
                          : 'Bank Transfer'}
                      </SelectItem>
                      <SelectItem value="credit-card">
                        {language === 'th' ? 'บัตรเครดิต' : 'Credit Card'}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Credit Card Fields */}
                  {paymentMethod === 'credit-card' && (
                    <>
                      <div>
                        <Label>
                          {language === 'th' ? 'หมายเลขบัตร' : 'Card Number'}
                        </Label>
                        <Input placeholder="1234 5678 9012 3456" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>
                            {language === 'th' ? 'วันหมดอายุ' : 'Expiry'}
                          </Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <Input placeholder="123" />
                        </div>
                      </div>

                      <div>
                        <Label>
                          {language === 'th'
                            ? 'ชื่อบนบัตร'
                            : 'Name on Card'}
                        </Label>
                        <Input />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>
                  {language === 'th'
                    ? 'สรุปคำสั่งซื้อ'
                    : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>{t('total')}</span>
                  <span>
                    {formatPrice(
                      paymentMethod === 'credit-card'
                        ? getCartTotal() * 1.07
                        : getCartTotal()
                    )}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  <HandCoins className="h-4 w-4 mr-2" />
                  {language === 'th' ? 'ชำระเงิน' : 'Complete Payment'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
