import React, { useState } from 'react';
import { Building2, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

const BankTransferPayment: React.FC = () => {
  const { language } = useLanguage();
  const { getCartTotal } = useCart();
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  // Bank account information - คุณสามารถแก้ไขข้อมูลนี้ได้
  const bankAccounts = [
    {
      bank: language === 'th' ? 'ธนาคารกรุงเทพ' : 'Bangkok Bank',
      accountName: language === 'th' ? 'บริษัท พลูโต จำกัด' : 'Pluto Co., Ltd.',
      accountNumber: '123-456-7890',
      branch: language === 'th' ? 'สาขาสีลม' : 'Silom Branch',
    },
    {
      bank: language === 'th' ? 'ธนาคารกสิกรไทย' : 'Kasikorn Bank',
      accountName: language === 'th' ? 'บริษัท พลูโต จำกัด' : 'Pluto Co., Ltd.',
      accountNumber: '987-654-3210',
      branch: language === 'th' ? 'สาขาสีลม' : 'Silom Branch',
    },
    {
      bank: language === 'th' ? 'ธนาคารไทยพาณิชย์' : 'Siam Commercial Bank',
      accountName: language === 'th' ? 'บริษัท พลูโต จำกัด' : 'Pluto Co., Ltd.',
      accountNumber: '555-123-4567',
      branch: language === 'th' ? 'สาขาสีลม' : 'Silom Branch',
    },
  ];

  const handleCopy = (text: string, accountNumber: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const totalAmount = getCartTotal() * 1.07;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/payment">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'th' ? 'กลับ' : 'Back'}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'th' ? 'โอนเงินผ่านธนาคาร' : 'Bank Transfer'}
            </h1>
          </div>

          <div className="space-y-6">
            {/* Payment Amount */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'th' ? 'ยอดที่ต้องชำระ' : 'Amount to Pay'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary text-center">
                  {formatPrice(totalAmount)}
                </div>
              </CardContent>
            </Card>

            {/* Bank Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {language === 'th' ? 'ข้อมูลบัญชีธนาคาร' : 'Bank Account Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {bankAccounts.map((account, index) => (
                  <div key={index}>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'th' ? 'ธนาคาร' : 'Bank'}
                        </p>
                        <p className="font-semibold">{account.bank}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'th' ? 'ชื่อบัญชี' : 'Account Name'}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{account.accountName}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(account.accountName, `name-${index}`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedAccount === `name-${index}` ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'th' ? 'เลขที่บัญชี' : 'Account Number'}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{account.accountNumber}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(account.accountNumber, `account-${index}`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedAccount === `account-${index}` ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'th' ? 'สาขา' : 'Branch'}
                        </p>
                        <p className="font-semibold">{account.branch}</p>
                      </div>
                    </div>
                    {index < bankAccounts.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'th' ? 'วิธีชำระเงิน' : 'Payment Instructions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    {language === 'th' 
                      ? 'โอนเงินตามยอดที่ระบุไปยังบัญชีธนาคารใดบัญชีหนึ่งด้านบน'
                      : 'Transfer the specified amount to any bank account above'}
                  </li>
                  <li>
                    {language === 'th' 
                      ? 'เก็บหลักฐานการโอนเงิน (สลิปโอนเงิน) ไว้'
                      : 'Keep the transfer receipt (transfer slip) as proof'}
                  </li>
                  <li>
                    {language === 'th' 
                      ? 'หลังจากโอนเงินแล้ว กรุณาส่งหลักฐานการโอนเงินมาที่อีเมล support@pluto.com หรือ LINE: @pluto'
                      : 'After transferring, please send the transfer receipt to support@pluto.com or LINE: @pluto'}
                  </li>
                  <li>
                    {language === 'th' 
                      ? 'ทีมงานจะตรวจสอบและอัปเดตสถานะคำสั่งซื้อภายใน 24 ชั่วโมง'
                      : 'Our team will verify and update your order status within 24 hours'}
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Link to="/payment-success" className="block">
                <Button size="lg" className="w-full" variant="outline">
                  {language === 'th' ? 'ฉันโอนเงินแล้ว' : 'I have transferred'}
                </Button>
              </Link>
              <Link to="/payment" className="block">
                <Button variant="ghost" className="w-full">
                  {language === 'th' ? 'เปลี่ยนวิธีการชำระเงิน' : 'Change payment method'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BankTransferPayment;

