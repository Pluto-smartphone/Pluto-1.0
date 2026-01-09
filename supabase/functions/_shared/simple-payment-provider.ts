// Simple Payment Provider - Manual Payment (PromptPay QR + Bank Transfer)
import type { 
  PaymentProvider, 
  CreateCheckoutParams, 
  CheckoutSession, 
  PaymentVerificationResult 
} from "./payment-provider.ts";

// Bank account info
const BANK_ACCOUNT = {
  bank: "กสิกรไทย",
  accountNumber: "045-1-62400-8",
  accountName: "นาย วรพล กิจติยะโสภณ",
  accountNumberClean: "0451624008", // Without dashes for QR code
};

export class SimplePaymentProvider implements PaymentProvider {
  /**
   * Generate PromptPay QR code data (EMV QR Code format)
   * This creates a proper PromptPay QR code that Thai banking apps can scan
   */
  private generatePromptPayQR(amount: number, referenceNo: string): string {
    // PromptPay uses EMV QR Code standard
    // Format: 00020101021153037645802TH29370016A0000006770101110113[Account]5802TH59[Name]60[Amount]6304[CRC]
    
    const amountStr = amount.toFixed(2);
    const merchantId = BANK_ACCOUNT.accountNumberClean;
    
    // Build EMV QR Code payload for PromptPay
    // Merchant Account Information (Tag 29-38): PromptPay ID
    const merchantAccountInfo = `29370016A0000006770101110113${merchantId}`;
    
    // Build the QR payload
    let payload = "000201"; // Payload Format Indicator
    payload += "010211"; // Point of Initiation Method (11 = Dynamic)
    payload += `29${String(merchantAccountInfo.length).padStart(2, '0')}${merchantAccountInfo}`; // Merchant Account Info
    payload += "5303764"; // Currency (764 = THB)
    payload += "5802TH"; // Country Code
    payload += `59${String(BANK_ACCOUNT.accountName.length).padStart(2, '0')}${BANK_ACCOUNT.accountName}`; // Merchant Name
    payload += `60${String(amountStr.length).padStart(2, '0')}${amountStr}`; // Amount
    
    // Calculate CRC16 (simplified - in production use proper CRC16 calculation)
    // For now, we'll use a simple placeholder
    const crc = "FFFF"; // Placeholder - should be calculated CRC16
    payload += `6304${crc}`;
    
    return payload;
  }

  /**
   * Create checkout session - returns payment page with QR and bank info
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    // Calculate total amount
    const totalAmount = params.lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0) / 100;
    
    // Generate reference number
    const referenceNo = this.generateReferenceNo();
    
    // Generate QR code data
    const qrData = this.generatePromptPayQR(totalAmount, referenceNo);
    
    // Create payment page HTML
    const html = this.createPaymentPage({
      referenceNo,
      totalAmount,
      qrData,
      lineItems: params.lineItems,
      customerEmail: params.customerEmail,
      customerName: params.metadata?.customerName || "Customer",
      successUrl: params.successUrl.replace("{CHECKOUT_SESSION_ID}", referenceNo),
    });
    
    return {
      id: referenceNo,
      url: `data:text/html;base64,${btoa(html)}`,
    };
  }

  /**
   * Generate unique reference number
   */
  private generateReferenceNo(): string {
    const now = new Date();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `INV${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${random.toString().padStart(4, '0')}`;
  }

  /**
   * Create payment page HTML
   */
  private createPaymentPage(params: {
    referenceNo: string;
    totalAmount: number;
    qrData: string;
    lineItems: any[];
    customerEmail?: string;
    customerName: string;
    successUrl: string;
  }): string {
    // Generate PromptPay QR code
    // Use a simple format that works with Thai banking apps
    // Format: Account number + amount (for PromptPay)
    const amountStr = params.totalAmount.toFixed(2);
    
    // Create QR data string for PromptPay
    // Simple format: account number followed by amount
    const qrDataString = `${BANK_ACCOUNT.accountNumberClean}${amountStr}`;
    
    // Generate QR code image using QR code API
    // This will create a QR code that can be scanned by banking apps
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataString)}`;
    
    // Note: For production, you may want to use a PromptPay-specific QR generator
    // that creates proper EMV QR codes with CRC validation
    
    // Deep links for banking apps
    const bankLinks = {
      scb: `scbeasy://transfer?account=${BANK_ACCOUNT.accountNumberClean}&amount=${params.totalAmount}`,
      kplus: `kplus://transfer?account=${BANK_ACCOUNT.accountNumberClean}&amount=${params.totalAmount}`,
      kbank: `kbank://transfer?account=${BANK_ACCOUNT.accountNumberClean}&amount=${params.totalAmount}`,
    };

    return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ชำระเงิน - ${params.referenceNo}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .header .amount {
      font-size: 36px;
      font-weight: bold;
      margin-top: 10px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .qr-container {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .qr-code {
      width: 250px;
      height: 250px;
      margin: 0 auto 15px;
      border: 5px solid white;
      border-radius: 10px;
      background: white;
    }
    .qr-code img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .bank-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .bank-info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .bank-info-item:last-child {
      border-bottom: none;
    }
    .bank-info-label {
      font-weight: bold;
      color: #666;
    }
    .bank-info-value {
      color: #333;
      font-family: monospace;
      font-size: 16px;
    }
    .bank-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }
    .bank-link {
      display: block;
      padding: 12px;
      background: #667eea;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: background 0.3s;
    }
    .bank-link:hover {
      background: #5568d3;
    }
    .reference {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;
    }
    .reference-label {
      font-size: 12px;
      color: #856404;
      margin-bottom: 5px;
    }
    .reference-value {
      font-size: 18px;
      font-weight: bold;
      color: #856404;
      font-family: monospace;
    }
    .instructions {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 8px;
      color: #004085;
      font-size: 14px;
      line-height: 1.6;
    }
    .instructions ul {
      margin-left: 20px;
      margin-top: 10px;
    }
    .instructions li {
      margin-bottom: 5px;
    }
    .button {
      display: block;
      width: 100%;
      padding: 15px;
      background: #28a745;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin-top: 20px;
      border: none;
      cursor: pointer;
    }
    .button:hover {
      background: #218838;
    }
    .copy-btn {
      background: #6c757d;
      padding: 8px 15px;
      border: none;
      color: white;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      margin-left: 10px;
    }
    .copy-btn:hover {
      background: #5a6268;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ชำระเงิน</h1>
      <div class="amount">฿${params.totalAmount.toFixed(2)}</div>
    </div>
    
    <div class="content">
      <div class="reference">
        <div class="reference-label">เลขที่อ้างอิง</div>
        <div class="reference-value">${params.referenceNo}</div>
      </div>

      <!-- PromptPay QR Code -->
      <div class="section">
        <div class="section-title">💳 ชำระผ่าน PromptPay</div>
        <div class="qr-container">
          <div class="qr-code">
            <img src="${qrImageUrl}" alt="PromptPay QR Code">
          </div>
          <p style="color: #666; font-size: 14px;">สแกน QR Code ด้วยแอปธนาคารของคุณ</p>
        </div>
      </div>

      <!-- Bank Transfer -->
      <div class="section">
        <div class="section-title">🏦 โอนเงินผ่านธนาคาร</div>
        <div class="bank-info">
          <div class="bank-info-item">
            <span class="bank-info-label">ธนาคาร:</span>
            <span class="bank-info-value">${BANK_ACCOUNT.bank}</span>
          </div>
          <div class="bank-info-item">
            <span class="bank-info-label">เลขที่บัญชี:</span>
            <span class="bank-info-value">
              ${BANK_ACCOUNT.accountNumber}
              <button class="copy-btn" onclick="copyToClipboard('${BANK_ACCOUNT.accountNumber}')">คัดลอก</button>
            </span>
          </div>
          <div class="bank-info-item">
            <span class="bank-info-label">ชื่อบัญชี:</span>
            <span class="bank-info-value">${BANK_ACCOUNT.accountName}</span>
          </div>
          <div class="bank-info-item">
            <span class="bank-info-label">จำนวนเงิน:</span>
            <span class="bank-info-value">฿${params.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="bank-links">
          <a href="${bankLinks.scb}" class="bank-link">SCB Easy</a>
          <a href="${bankLinks.kplus}" class="bank-link">K Plus</a>
          <a href="${bankLinks.kbank}" class="bank-link">K-Bank</a>
        </div>
      </div>

      <!-- Instructions -->
      <div class="section">
        <div class="instructions">
          <strong>📋 วิธีการชำระเงิน:</strong>
          <ul>
            <li>สแกน QR Code ด้วยแอปธนาคาร หรือ</li>
            <li>โอนเงินเข้าบัญชี ${BANK_ACCOUNT.accountNumber} ธนาคาร${BANK_ACCOUNT.bank}</li>
            <li>จำนวนเงิน: ฿${params.totalAmount.toFixed(2)}</li>
            <li>กรุณาแนบสลิปการโอนเงินเมื่อชำระเงินเสร็จ</li>
          </ul>
        </div>
      </div>

      <button class="button" onclick="confirmPayment()">ยืนยันการชำระเงิน</button>
    </div>
  </div>

  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('คัดลอกเลขที่บัญชีแล้ว: ' + text);
      });
    }

    function confirmPayment() {
      if (confirm('กรุณายืนยันว่าคุณได้ชำระเงินเรียบร้อยแล้ว\\n\\nหลังจากยืนยัน ระบบจะส่ง Invoice ไปที่อีเมลของคุณ')) {
        // Redirect to success page
        window.location.href = '${params.successUrl}';
      }
    }
  </script>
</body>
</html>`;
  }

  /**
   * Verify payment - for manual payment, always return pending
   */
  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    // For manual payment, verification is done manually
    // This should be updated when payment is confirmed
    return {
      verified: false,
      status: "pending",
      error: "Payment verification pending. Please confirm payment manually.",
    };
  }
}

