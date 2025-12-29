import React, { useState } from 'react';
import { CreditCard, Lock, ArrowLeft, CheckCircle, QrCode, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Payment: React.FC = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  const handlePayment = async (channel: string) => {
    if (items.length === 0) {
      toast({
        title: language === 'th' ? 'ตะกร้าว่าง' : 'Cart is empty',
        description: language === 'th' ? 'กรุณาเพิ่มสินค้าในตะกร้า' : 'Please add items to cart',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          cartItems: items,
          totalAmount: getCartTotal() * 1.07, // Include tax
          channel: channel, // 'full' for credit card, 'promptpay' for QR
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) throw error;

      if (channel === 'promptpay' && data?.url) {
        // Navigate to PromptPay page
        navigate(`/payment/promptpay?session_id=${data.sessionId}`);
      } else if (channel === 'bank-transfer') {
        // Navigate to bank transfer page
        navigate('/payment/bank-transfer');
      } else if (data?.url) {
        // Redirect to payment provider checkout page (credit card)
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: error.message || (language === 'th' 
          ? 'ไม่สามารถดำเนินการชำระเงินได้ กรุณาลองใหม่อีกครั้ง' 
          : 'Payment processing failed. Please try again.'),
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
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center animate-scale-in">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('paymentSuccess')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('language') === 'th' 
                ? 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว เราจะส่งอีเมลยืนยันให้คุณในไม่ช้า'
                : 'Your order has been confirmed. We will send you a confirmation email shortly.'
              }
            </p>
            <div className="space-y-4">
              <Link to="/shop" className="block">
                <Button size="lg" className="w-full">
                  {t('language') === 'th' ? 'ช็อปต่อ' : 'Continue Shopping'}
                </Button>
              </Link>
              <Link to="/" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  {t('home')}
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
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('language') === 'th' ? 'กลับไปยังตะกร้า' : 'Back to Cart'}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{t('payment')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="space-y-6">
              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('language') === 'th' ? 'ข้อมูลการเรียกเก็บเงิน' : 'Billing Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">
                        {t('language') === 'th' ? 'ชื่อ' : 'First Name'}
                      </Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">
                        {t('language') === 'th' ? 'นามสกุล' : 'Last Name'}
                      </Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">
                      {t('language') === 'th' ? 'อีเมล' : 'Email'}
                    </Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {t('language') === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}
                    </Label>
                    <Input id="phone" placeholder="+66 2 123 4567" />
                  </div>
                  <div>
                    <Label htmlFor="address">
                      {t('language') === 'th' ? 'ที่อยู่' : 'Address'}
                    </Label>
                    <Input id="address" placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">
                        {t('language') === 'th' ? 'เมือง' : 'City'}
                      </Label>
                      <Input id="city" placeholder="Bangkok" />
                    </div>
                    <div>
                      <Label htmlFor="postal">
                        {t('language') === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'}
                      </Label>
                      <Input id="postal" placeholder="10110" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {language === 'th' ? 'เลือกวิธีการชำระเงิน' : 'Select Payment Method'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Credit Card */}
                  <Card 
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedPaymentMethod === 'credit-card' ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => setSelectedPaymentMethod('credit-card')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-primary" />
                          <div>
                            <h3 className="font-semibold">
                              {language === 'th' ? 'บัตรเครดิต' : 'Credit Card'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {language === 'th' ? 'ชำระเงินด้วยบัตรเครดิต/เดบิต' : 'Pay with credit/debit card'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={selectedPaymentMethod === 'credit-card' ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayment('full');
                          }}
                          disabled={isProcessing}
                        >
                          {language === 'th' ? 'ชำระเงิน' : 'Pay Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PromptPay QR */}
                  <Card 
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedPaymentMethod === 'promptpay' ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => setSelectedPaymentMethod('promptpay')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <QrCode className="h-6 w-6 text-primary" />
                          <div>
                            <h3 className="font-semibold">
                              {language === 'th' ? 'QR PromptPay' : 'QR PromptPay'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {language === 'th' ? 'สแกน QR Code เพื่อชำระเงิน' : 'Scan QR code to pay'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={selectedPaymentMethod === 'promptpay' ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayment('promptpay');
                          }}
                          disabled={isProcessing}
                        >
                          {language === 'th' ? 'ชำระเงิน' : 'Pay Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Transfer */}
                  <Card 
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedPaymentMethod === 'bank-transfer' ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => setSelectedPaymentMethod('bank-transfer')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-6 w-6 text-primary" />
                          <div>
                            <h3 className="font-semibold">
                              {language === 'th' ? 'โอนเงินผ่านธนาคาร' : 'Bank Transfer'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {language === 'th' ? 'โอนเงินเข้าบัญชีธนาคาร' : 'Transfer to bank account'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={selectedPaymentMethod === 'bank-transfer' ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayment('bank-transfer');
                          }}
                          disabled={isProcessing}
                        >
                          {language === 'th' ? 'ดูข้อมูลบัญชี' : 'View Account'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>
                    {t('language') === 'th' ? 'สรุปคำสั่งซื้อ' : 'Order Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.brand} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('language') === 'th' ? 'ยังไม่รวมภาษี' : 'Subtotal'}</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('language') === 'th' ? 'ค่าจัดส่ง' : 'Shipping'}</span>
                      <span className="text-success">
                        {t('language') === 'th' ? 'ฟรี' : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('language') === 'th' ? 'ภาษี' : 'Tax'}</span>
                      <span>{formatPrice(getCartTotal() * 0.07)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-primary">
                      {formatPrice(getCartTotal() * 1.07)}
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full gradient-primary shadow-red"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('language') === 'th' ? 'กำลังดำเนินการ...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        {t('language') === 'th' ? 'ชำระเงิน' : 'Complete Payment'}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {t('language') === 'th' 
                      ? 'ข้อมูลของคุณจะได้รับการปกป้องและเข้ารหัสอย่างปลอดภัย'
                      : 'Your information is secure and encrypted'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;