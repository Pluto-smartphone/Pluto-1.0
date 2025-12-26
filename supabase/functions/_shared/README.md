# Payment Provider Abstraction Layer

โครงสร้างนี้ทำให้สามารถเปลี่ยน payment provider ได้ง่ายโดยไม่ต้องแก้ไขโค้ดหลัก

## วิธีการเปลี่ยน Payment Provider

### 1. เพิ่ม Provider Implementation ใหม่

สร้างไฟล์ใหม่ใน `_shared/` เช่น `omise-provider.ts`:

```typescript
import type { 
  PaymentProvider, 
  CreateCheckoutParams, 
  CheckoutSession, 
  PaymentVerificationResult 
} from "./payment-provider.ts";

export class OmisePaymentProvider implements PaymentProvider {
  private omise: any; // Omise SDK instance

  constructor(apiKey: string) {
    // Initialize Omise SDK
    this.omise = initializeOmise(apiKey);
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    // Implement Omise checkout creation
    // ...
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    // Implement Omise payment verification
    // ...
  }
}
```

### 2. อัปเดต payment-config.ts

เพิ่ม case ใหม่ใน `getPaymentProvider()`:

```typescript
case "omise":
  return new OmisePaymentProvider(apiKey);
```

### 3. ตั้งค่า Environment Variables

ใน Supabase Dashboard → Settings → Edge Functions → Secrets:

- `PAYMENT_PROVIDER` = `"paysolutions"` (หรือ `"omise"`, `"paypal"`, `"2c2p"`, etc.)
- `PAYMENT_API_KEY` = API key ของ provider ที่เลือก

## Provider ที่รองรับตอนนี้

- ✅ **Paysolutions** (default) - `paysolutions-provider.ts`

## Provider ที่สามารถเพิ่มได้

- Omise
- PayPal
- 2C2P
- TrueMoney Wallet
- หรือ provider อื่นๆ

## การตั้งค่า Paysolutions

### Environment Variables

ใน Supabase Dashboard → Settings → Edge Functions → Secrets:

- `PAYMENT_PROVIDER` = `"paysolutions"`
- `PAYSOLUTIONS_MERCHANT_ID` = Merchant ID (8 digits) จาก Paysolutions
- `PAYSOLUTIONS_BEARER_TOKEN` = Bearer token สำหรับ PromptPay API (ถ้าใช้ PromptPay)
- `PAYSOLUTIONS_CURRENCY_CODE` = รหัสสกุลเงิน (default: "00" สำหรับ THB)
- `PAYSOLUTIONS_LANGUAGE` = ภาษา (default: "TH")

### การใช้งาน

Paysolutions provider รองรับ 2 โหมด:

1. **Form Redirect** (default): สร้าง HTML form ที่ auto-submit ไปยัง Paysolutions payment gateway
   - รองรับช่องทาง: full, installment, ibanking, bill, truewallet, alipay, wechat, etc.
   - ระบุ channel ผ่าน metadata: `{ channel: "full" }`

2. **PromptPay API**: ใช้ API เพื่อสร้าง QR code สำหรับ PromptPay
   - ระบุ channel: `{ channel: "promptpay" }` ใน metadata
   - ต้องมี `PAYSOLUTIONS_BEARER_TOKEN`

### ตัวอย่างการใช้งาน Channel ต่างๆ

```typescript
// Full payment (credit card)
metadata: { channel: "full" }

// PromptPay
metadata: { channel: "promptpay" }

// Installment
metadata: { 
  channel: "installment",
  bankins: "SCB",
  monthins: "3"
}

// Internet Banking
metadata: { channel: "ibanking" }
// หรือระบุธนาคารเฉพาะ
metadata: { channel: "ibanking_kbank" }
```

### Payment Verification

⚠️ **หมายเหตุ**: ฟังก์ชัน `verifyPayment` ยังต้อง implement ตาม Paysolutions API documentation
- อาจต้องใช้ webhook/callback จาก Paysolutions
- หรือ query status API endpoint ของ Paysolutions

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




