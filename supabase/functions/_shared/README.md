# Payment Provider - GB Prime Pay

ระบบชำระเงินใช้ GB Prime Pay เป็น payment gateway

## การตั้งค่า GB Prime Pay

### Environment Variables

ใน Supabase Dashboard → Settings → Edge Functions → Secrets:

- `GBPRIMEPAY_PUBLIC_KEY` = Public Key จาก GB Prime Pay
- `GBPRIMEPAY_SECRET_KEY` = Secret Key จาก GB Prime Pay
- `GBPRIMEPAY_MERCHANT_ID` = Merchant ID จาก GB Prime Pay
- `PAYMENT_PROVIDER` = `"gbprimepay"` (optional, default คือ gbprimepay)

### การใช้งาน

GB Prime Pay provider รองรับ 3 ช่องทางการชำระเงิน:

1. **PromptPay**: สร้าง QR Code สำหรับสแกนชำระเงิน
   - ระบุ payment method: `"promptpay"`

2. **Bank Transfer (Internet Banking)**: โอนเงินผ่านธนาคาร
   - ระบุ payment method: `"bank-transfer"`

3. **Credit Card**: ชำระเงินด้วยบัตรเครดิต
   - ระบุ payment method: `"credit-card"`
   - จะมีการคำนวณ Tax 7% อัตโนมัติ

### Payment Verification

ระบบจะ verify payment ผ่าน GB Prime Pay API endpoint `/v3/checkStatus`

## Interface ที่ต้อง Implement

ทุก provider ต้อง implement interface `PaymentProvider`:

```typescript
interface PaymentProvider {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
  verifyPayment(sessionId: string): Promise<PaymentVerificationResult>;
}
```

## ตัวอย่างการใช้งาน

โค้ดหลักจะใช้ abstraction layer โดยอัตโนมัติ:

```typescript
const paymentProvider = getPaymentProvider();
const session = await paymentProvider.createCheckoutSession({...});
const result = await paymentProvider.verifyPayment(sessionId);
```

ไม่ต้องแก้ไขโค้ดใน `create-checkout/index.ts` หรือ `verify-payment/index.ts` อีก!




