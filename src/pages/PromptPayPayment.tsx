import React, { useEffect, useState } from 'react';
import { QrCode, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PromptPayPayment: React.FC = () => {
  const { t, language } = useLanguage();
  const { getCartTotal } = useCart();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [qrData, setQrData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Get cart items from context or localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cartItems.length === 0) {
          setError(language === 'th' ? 'ตะกร้าว่าง' : 'Cart is empty');
          setIsLoading(false);
          return;
        }
        
        const { data, error: fetchError } = await supabase.functions.invoke('create-checkout', {
          body: {
            cartItems: cartItems,
            channel: 'promptpay',
          },
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`,
          } : undefined,
        });

        if (fetchError) throw fetchError;

        // If we get a data URL with QR code, extract it
        if (data?.url && data.url.startsWith('data:text/html;base64,')) {
          // Decode the HTML to extract QR code image
          const htmlBase64 = data.url.replace('data:text/html;base64,', '');
          const html = atob(htmlBase64);
          
          // Extract image src from HTML
          const imgMatch = html.match(/src="([^"]+)"/);
          if (imgMatch && imgMatch[1]) {
            setQrData({
              image: imgMatch[1],
              referenceNo: data.sessionId || sessionId || 'N/A',
              total: getCartTotal() * 1.07,
            });
          } else {
            // If no image found, try to extract from data attribute or other patterns
            setError(language === 'th' ? 'ไม่พบ QR Code ในข้อมูล' : 'QR Code not found in data');
          }
        } else {
          setError(language === 'th' ? 'ไม่สามารถสร้าง QR Code ได้' : 'Failed to generate QR code');
        }
      } catch (err: any) {
        console.error('Error fetching QR code:', err);
        setError(err.message || (language === 'th' ? 'ไม่สามารถโหลด QR Code ได้' : 'Failed to load QR code'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCode();
  }, [sessionId, language, getCartTotal]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {language === 'th' ? 'กำลังสร้าง QR Code...' : 'Generating QR Code...'}
            </h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'}
            </h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Link to="/payment">
              <Button size="lg" className="w-full">
                {language === 'th' ? 'กลับไปยังหน้าชำระเงิน' : 'Back to Payment'}
              </Button>
            </Link>
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
        <div className="max-w-md mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/payment">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'th' ? 'กลับ' : 'Back'}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'th' ? 'ชำระเงินด้วย PromptPay' : 'Pay with PromptPay'}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {language === 'th' ? 'สแกน QR Code เพื่อชำระเงิน' : 'Scan QR Code to Pay'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {formatPrice(qrData.total)}
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {language === 'th' 
                    ? 'Reference No.:' 
                    : 'Reference No.:'} {qrData.referenceNo}
                </p>
              </div>

              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img 
                  src={qrData.image} 
                  alt="PromptPay QR Code" 
                  className="max-w-full h-auto"
                />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="text-center">
                  {language === 'th' 
                    ? 'กรุณาสแกน QR Code ด้วยแอปธนาคารของคุณ' 
                    : 'Please scan the QR code with your bank app'}
                </p>
                <p className="text-center">
                  {language === 'th' 
                    ? 'หลังจากชำระเงินแล้ว ระบบจะอัปเดตสถานะอัตโนมัติ' 
                    : 'After payment, the system will update automatically'}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <Link to="/payment-success" className="block">
                  <Button size="lg" className="w-full" variant="outline">
                    {language === 'th' ? 'ฉันชำระเงินแล้ว' : 'I have paid'}
                  </Button>
                </Link>
                <Link to="/payment" className="block">
                  <Button variant="ghost" className="w-full">
                    {language === 'th' ? 'เปลี่ยนวิธีการชำระเงิน' : 'Change payment method'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromptPayPayment;

