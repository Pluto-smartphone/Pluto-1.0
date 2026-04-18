import React, { useEffect, useState } from 'react';
import { Home, HandCoins, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  /** stripe = Stripe Checkout (บัตร + PromptPay QR บนหน้า Stripe); อื่นๆ = โหมดแมนนวล */
  const [paymentMethod] = useState('stripe');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Shipping form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [building, setBuilding] = useState('');
  const [moo, setMoo] = useState('');
  const [soi, setSoi] = useState('');
  const [road, setRoad] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);

  // Load default address from user profile (address book)
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const meta = session?.user?.user_metadata as any;
        const addr = meta?.addressBook?.default;
        if (addr) {
          setFirstName(addr.firstName || '');
          setLastName(addr.lastName || '');
          setEmail(addr.email || '');
          setPhone(addr.phone || '');
          setHouseNo(addr.houseNo || '');
          setBuilding(addr.building || '');
          setMoo(addr.moo || '');
          setSoi(addr.soi || '');
          setRoad(addr.road || '');
          setProvince(addr.province || '');
          setDistrict(addr.district || '');
          setSubdistrict(addr.subdistrict || '');
          setPostalCode(addr.postalCode || '');

        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const isDisposableDomain = (domain: string) => {
    const list = ['mailinator.com','tempmail.com','10minutemail.com','guerrillamail.com','yopmail.com'];
    return list.includes(domain.toLowerCase());
  };

  const validateForm = () => {
    // Basic checks for fake info
    if (!firstName || !lastName) {
      toast({
        title: language === 'th' ? 'กรอกชื่อให้ครบถ้วน' : 'Please enter full name',
        variant: 'destructive',
      });
      return false;
    }
    const emailMatch = email.match(/^[^\s@]+@([^\s@]+)$/);
    if (!emailMatch) {
      toast({ title: language === 'th' ? 'อีเมลไม่ถูกต้อง' : 'Invalid email', variant: 'destructive' });
      return false;
    }
    const domain = emailMatch[1];
    if (isDisposableDomain(domain)) {
      toast({ title: language === 'th' ? 'ไม่รับอีเมลชั่วคราว' : 'Disposable email not allowed', variant: 'destructive' });
      return false;
    }
    if (!/^0\d{8,9}$/.test(phone.replace(/[^0-9]/g, ''))) {
      toast({ title: language === 'th' ? 'เบอร์โทรศัพท์ไม่ถูกต้อง' : 'Invalid Thai phone number', variant: 'destructive' });
      return false;
    }
    if (!houseNo || !subdistrict || !district || !province || !/^\d{5}$/.test(postalCode)) {
      toast({ title: language === 'th' ? 'กรอกที่อยู่ให้ครบถ้วน' : 'Please complete the address', variant: 'destructive' });
      return false;
    }
    return true;
  };



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

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Save address to address book if logged in and opted-in
      if (session?.user && saveAddress) {
        const shippingData = {
          firstName,
          lastName,
          email,
          phone,
          houseNo,
          building,
          moo,
          soi,
          road,
          subdistrict,
          district,
          province,
          postalCode,
        };
        try {
          await supabase.auth.updateUser({ data: { addressBook: { default: shippingData } } });
        } catch (e) {
          console.warn('Failed to save address book', e);
        }
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          cartItems: items,
          paymentMethod,
          shipping: {
            firstName,
            lastName,
            email,
            phone,
            houseNo,
            building,
            moo,
            soi,
            road,
            subdistrict,
            district,
            province,
            postalCode,
          },
        },
        headers: session
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (error) {
        const serverMsg = (data as any)?.error;
        throw new Error(serverMsg || error.message);
      }
      if (data?.sessionId) {
        setSessionId(data.sessionId);
        try {
          const shippingData = {
            firstName,
            lastName,
            email,
            phone,
            houseNo,
            building,
            moo,
            soi,
            road,
            subdistrict,
            district,
            province,
            postalCode,
          };
          localStorage.setItem(`checkout:${data.sessionId}:shipping`, JSON.stringify(shippingData));
        } catch {}
      }

      const checkoutUrl = data?.url as string | undefined;
      if (checkoutUrl?.startsWith('http://') || checkoutUrl?.startsWith('https://')) {
        window.location.assign(checkoutUrl);
        return;
      }
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
    );
  }

  return (
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
                      ? 'ข้อมูลการจัดส่ง'
                      : 'Shipping Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'ชื่อ' : 'First Name'}</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'นามสกุล' : 'Last Name'}</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <Label>{language === 'th' ? 'เบอร์โทรศัพท์' : 'Phone'}</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'บ้านเลขที่' : 'House No.'}</Label>
                      <Input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'อาคาร/หมู่บ้าน' : 'Building/Village'}</Label>
                      <Input value={building} onChange={(e) => setBuilding(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'หมู่' : 'Moo'}</Label>
                      <Input value={moo} onChange={(e) => setMoo(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'ซอย' : 'Soi'}</Label>
                      <Input value={soi} onChange={(e) => setSoi(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'ถนน' : 'Road'}</Label>
                      <Input value={road} onChange={(e) => setRoad(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'จังหวัด' : 'Province'}</Label>
                      <Input value={province} onChange={(e) => setProvince(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'อำเภอ/เขต' : 'District'}</Label>
                      <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'ตำบล/แขวง' : 'Subdistrict'}</Label>
                      <Input value={subdistrict} onChange={(e) => setSubdistrict(e.target.value)} />
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'}</Label>
                      <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input id="saveAddress" type="checkbox" className="h-4 w-4" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                    <Label htmlFor="saveAddress" className="cursor-pointer">
                      {language === 'th' ? 'บันทึกที่อยู่นี้ในบัญชีของฉัน' : 'Save this address to my account'}
                    </Label>
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
                  <p className="text-sm text-muted-foreground">
                    {language === 'th'
                      ? 'จะไปยังหน้าชำระเงินปลอดภัยของ Stripe เพื่อเลือกบัตรเครดิต/เดบิตหรือสแกน PromptPay QR'
                      : 'You will be redirected to secure Stripe Checkout to pay by card or PromptPay QR.'}
                  </p>
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
                  <span>{formatPrice(getCartTotal())}</span>
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
  );
};

export default Payment;
