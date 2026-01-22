import React, { useEffect, useState } from 'react';
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
import { thaiAddress, Province } from '@/data/thaiAddress';

const Payment: React.FC = () => {
  const { items, getCartTotal } = useCart();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('promptpay'); // Only PromptPay and Bank Transfer
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentPageUrl, setPaymentPageUrl] = useState<string | null>(null);
  const [paymentPageHtml, setPaymentPageHtml] = useState<string | null>(null);

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
  // Static dataset indices for cascading selection
  const [provinceIdx, setProvinceIdx] = useState<number | null>(null);
  const [districtIdx, setDistrictIdx] = useState<number | null>(null);
  const [subdistrictIdx, setSubdistrictIdx] = useState<number | null>(null);

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState(''); // MM/YY
  const [cardCvv, setCardCvv] = useState('');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);

  // Address dataset (fallback to sample, then upgrade to full 77 provinces at runtime)
  const [addressData, setAddressData] = useState<Province[]>(thaiAddress);

  useEffect(() => {
    const loadFullDataset = async () => {
      try {
        // If already cached, use it
        const cached = localStorage.getItem('thaiAddressFull');
        if (cached) {
          setAddressData(JSON.parse(cached));
          return;
        }
        // Load from local static file (no external dependency)
        const res = await fetch('/thai-address.json', { cache: 'default' });
        if (res.ok) {
          const raw = await res.json();
          let full: Province[] = raw;
          // If dataset uses name_th keys (kongvut), transform to our structure
          if (Array.isArray(raw) && raw.length && (raw[0].name_th || raw[0].nameTh)) {
            if (raw[0].name_th) {
              full = raw.map((p: any) => ({
                nameTh: p.name_th,
                nameEn: p.name_en,
                districts: (p.amphure || p.district || []).map((d: any) => ({
                  nameTh: d.name_th,
                  nameEn: d.name_en,
                  subdistricts: (d.tambon || d.sub_district || []).map((s: any) => ({
                    nameTh: s.name_th,
                    nameEn: s.name_en,
                    postalCode: String(s.zip_code || s.post_code || ''),
                  })),
                })),
              }));
            }
          }
          localStorage.setItem('thaiAddressFull', JSON.stringify(full));
          setAddressData(full);
        }
      } catch (e) {
        console.warn('Failed to load local thai-address.json; using sample.', e);
      }
    };
    loadFullDataset();
  }, []);

  const districts = provinceIdx !== null ? addressData[provinceIdx].districts : [];
  const subdistricts = provinceIdx !== null && districtIdx !== null
    ? addressData[provinceIdx].districts[districtIdx].subdistricts
    : [];

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
          // Try to map to indices
          const pIdx = addressData.findIndex(p => p.nameTh === addr.province);
          if (pIdx >= 0) setProvinceIdx(pIdx);
          if (pIdx >= 0 && addr.district) {
            const dIdx = addressData[pIdx].districts.findIndex(d => d.nameTh === addr.district);
            if (dIdx >= 0) setDistrictIdx(dIdx);
            if (dIdx >= 0 && addr.subdistrict) {
              const sIdx = addressData[pIdx].districts[dIdx].subdistricts.findIndex(s => s.nameTh === addr.subdistrict);
              if (sIdx >= 0) setSubdistrictIdx(sIdx);
            }
          }
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
    if (paymentMethod === 'card') {
      const num = cardNumber.replace(/\s+/g, '');
      if (!/^\d{13,19}$/.test(num)) {
        toast({ title: language === 'th' ? 'หมายเลขบัตรไม่ถูกต้อง' : 'Invalid card number', variant: 'destructive' });
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        toast({ title: language === 'th' ? 'วันหมดอายุไม่ถูกต้อง (ดด/ปป)' : 'Invalid expiry (MM/YY)', variant: 'destructive' });
        return false;
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        toast({ title: language === 'th' ? 'CVV ไม่ถูกต้อง' : 'Invalid CVV', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const uploadReceipt = async () => {
    if (!sessionId || !receiptFile) return;
    try {
      setUploading(true);
      const path = `receipts/${sessionId}/${Date.now()}_${receiptFile.name}`;
      const { error } = await supabase.storage.from('payment-slips').upload(path, receiptFile, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      toast({ title: language === 'th' ? 'อัปโหลดสลิปสำเร็จ' : 'Receipt uploaded', variant: 'default' });
    } catch (err: any) {
      toast({ title: language === 'th' ? 'อัปโหลดสลิปล้มเหลว' : 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
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
      if (data?.url) setPaymentPageUrl(data.url);
      if (data?.html) setPaymentPageHtml(data.html);
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

                  {/* Province first, then District/Subdistrict */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'จังหวัด' : 'Province'}</Label>
                      <Select
                        value={provinceIdx !== null ? String(provinceIdx) : ''}
                        onValueChange={(val) => {
                          const idx = val === '' ? null : parseInt(val, 10);
                          setProvinceIdx(idx);
                          const name = idx !== null ? addressData[idx].nameTh : '';
                          setProvince(name);
                          // Reset lower levels
                          setDistrictIdx(null);
                          setDistrict('');
                          setSubdistrictIdx(null);
                          setSubdistrict('');
                          setPostalCode('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'th' ? 'เลือกจังหวัด' : 'Select Province'} />
                        </SelectTrigger>
                        <SelectContent>
                          {addressData.map((p, idx) => (
                            <SelectItem key={p.nameTh + idx} value={String(idx)}>
                              {p.nameTh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'}</Label>
                      <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'th' ? 'อำเภอ/เขต' : 'District'}</Label>
                      <Select
                        value={districtIdx !== null ? String(districtIdx) : ''}
                        onValueChange={(val) => {
                          const idx = val === '' ? null : parseInt(val, 10);
                          setDistrictIdx(idx);
                          const name = idx !== null ? districts[idx].nameTh : '';
                          setDistrict(name);
                          // Reset subdistrict when district changes
                          setSubdistrictIdx(null);
                          setSubdistrict('');
                          setPostalCode('');
                        }}
                        disabled={provinceIdx === null}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'th' ? 'เลือกอำเภอ/เขต' : 'Select District'} />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((d, idx) => (
                            <SelectItem key={d.nameTh + idx} value={String(idx)}>
                              {d.nameTh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'th' ? 'ตำบล/แขวง' : 'Subdistrict'}</Label>
                      <Select
                        value={subdistrictIdx !== null ? String(subdistrictIdx) : ''}
                        onValueChange={(val) => {
                          const idx = val === '' ? null : parseInt(val, 10);
                          setSubdistrictIdx(idx);
                          const name = idx !== null ? subdistricts[idx].nameTh : '';
                          setSubdistrict(name);
                          const code = idx !== null ? subdistricts[idx].postalCode : '';
                          setPostalCode(code);
                        }}
                        disabled={districtIdx === null}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'th' ? 'เลือกตำบล/แขวง' : 'Select Subdistrict'} />
                        </SelectTrigger>
                        <SelectContent>
                          {subdistricts.map((s, idx) => (
                            <SelectItem key={s.nameTh + idx} value={String(idx)}>
                              {s.nameTh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <SelectItem value="card">
                        {language === 'th' ? 'บัตรเครดิต/เดบิต' : 'Credit/Debit Card'}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Bank information note */}
                  {paymentMethod === 'bank-transfer' && (
                    <div className="text-sm text-muted-foreground">
                      {language === 'th'
                        ? 'โอนเงินไปยังบัญชีที่จะแสดงในหน้าชำระเงิน และแนบสลิปหลังโอน'
                        : 'Transfer to the bank account shown on the payment page and upload the receipt.'}
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="md:col-span-2">
                        <Label>{language === 'th' ? 'หมายเลขบัตร' : 'Card Number'}</Label>
                        <Input inputMode="numeric" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                      </div>
                      <div>
                        <Label>{language === 'th' ? 'ชื่อบนบัตร' : 'Name on Card'}</Label>
                        <Input value={cardName} onChange={(e) => setCardName(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{language === 'th' ? 'หมดอายุ (ดด/ปป)' : 'Expiry (MM/YY)'}</Label>
                          <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <Input inputMode="numeric" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                        </div>
                      </div>
                      <div className="md:col-span-2 text-xs text-muted-foreground">
                        {language === 'th' ? 'หมายเหตุ: การชำระด้วยบัตรจะเปิดใช้งานในภายหลัง (โหมดสาธิต)' : 'Note: Card processing will be enabled later (demo mode).'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Receipt Upload */}
              {sessionId && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'th' ? 'แนบสลิปการโอนเงิน' : 'Upload Transfer Receipt'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                    <Button disabled={!receiptFile || uploading} onClick={uploadReceipt}>
                      {uploading ? (language === 'th' ? 'กำลังอัปโหลด...' : 'Uploading...') : (language === 'th' ? 'อัปโหลดสลิป' : 'Upload Receipt')}
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {language === 'th' ? 'หมายเหตุ: ระบบจะบันทึกสลิปตามหมายเลขอ้างอิงคำสั่งซื้อของคุณ' : 'Note: Receipt will be saved under your order reference.'}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inline Payment Page (QR/Bank details) */}
              {paymentPageUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'th' ? 'สแกน QR / ข้อมูลบัญชี' : 'Scan QR / Bank Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentPageHtml ? (
                      <iframe
                        srcDoc={paymentPageHtml}
                        title="Payment"
                        className="w-full rounded-md border"
                        style={{ height: 700 }}
                      />
                    ) : (
                      <iframe
                        src={paymentPageUrl}
                        title="Payment"
                        className="w-full rounded-md border"
                        style={{ height: 700 }}
                      />
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      {language === 'th'
                        ? 'หากไม่แสดง กรุณาเลื่อนลงมา หรือเปิดด้วยเบราว์เซอร์ตัวเต็ม'
                        : 'If it does not display, scroll down or open in a full browser.'}
                    </div>
                  </CardContent>
                </Card>
              )}
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

      <Footer />
    </div>
  );
};

export default Payment;
