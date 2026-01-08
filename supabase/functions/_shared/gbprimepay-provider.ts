// GB Prime Pay Payment Provider Implementation
import type { 
  PaymentProvider, 
  CreateCheckoutParams, 
  CheckoutSession, 
  PaymentVerificationResult 
} from "./payment-provider.ts";

interface GBPrimePayConfig {
  publicKey: string;
  secretKey: string;
  merchantId: string;
  apiUrl?: string; // Default: "https://api.gbprimepay.com"
  tokenUrl?: string; // Default: "https://api.gbprimepay.com/v3/tokens"
  checkoutUrl?: string; // Default: "https://api.gbprimepay.com/v3/checkout"
}

export class GBPrimePayProvider implements PaymentProvider {
  private config: GBPrimePayConfig;

  constructor(apiKey: string) {
    // Get config from environment variables
    const publicKey = Deno.env.get("GBPRIMEPAY_PUBLIC_KEY") || "";
    const secretKey = Deno.env.get("GBPRIMEPAY_SECRET_KEY") || apiKey;
    const merchantId = Deno.env.get("GBPRIMEPAY_MERCHANT_ID") || "";
    
    this.config = {
      publicKey,
      secretKey,
      merchantId,
      apiUrl: "https://api.gbprimepay.com",
      tokenUrl: "https://api.gbprimepay.com/v3/tokens",
      checkoutUrl: "https://api.gbprimepay.com/v3/checkout",
    };
  }

  /**
   * Generate unique reference number
   */
  private generateReferenceNo(): string {
    const now = new Date();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `GBP${timestamp}${random.toString().padStart(4, '0')}`;
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    // Calculate total amount (convert from satang to THB)
    const totalAmount = params.lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0) / 100;
    
    // Generate unique reference number
    const referenceNo = this.generateReferenceNo();
    
    // Get payment method from metadata
    const paymentMethod = params.metadata?.payment_method || "promptpay";
    
    // Map payment method to GB Prime Pay payment type
    let paymentType = "promptpay"; // Default
    if (paymentMethod === "promptpay") {
      paymentType = "promptpay";
    } else if (paymentMethod === "bank-transfer") {
      paymentType = "internet_banking";
    } else if (paymentMethod === "credit-card") {
      paymentType = "creditcard";
    }

    // Create product detail string
    const productDetail = params.lineItems
      .map(item => `${item.name} x${item.quantity}`)
      .join(", ");

    // Get origin URL for redirects
    const origin = params.successUrl.split("/payment-success")[0] || "http://localhost:3000";

    try {
      // Create checkout session with GB Prime Pay
      const checkoutData = {
        publicKey: this.config.publicKey,
        amount: totalAmount.toFixed(2),
        referenceNo: referenceNo,
        detail: productDetail,
        customerName: params.metadata?.customerName || "Customer",
        customerEmail: params.customerEmail || "",
        merchantDefined1: params.userId,
        merchantDefined2: paymentMethod,
        merchantDefined3: params.metadata?.channel || paymentType,
        responseUrl: params.successUrl.replace("{CHECKOUT_SESSION_ID}", referenceNo),
        backgroundUrl: params.metadata?.postbackUrl || "",
        paymentType: paymentType,
      };

      // For PromptPay, create QR code
      if (paymentType === "promptpay") {
        return await this.createPromptPaySession(checkoutData, referenceNo);
      }
      
      // For other payment methods, create checkout form
      return await this.createCheckoutForm(checkoutData, referenceNo, origin);
    } catch (error: any) {
      console.error("GB Prime Pay checkout error:", error);
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  /**
   * Create PromptPay QR code session
   */
  private async createPromptPaySession(checkoutData: any, referenceNo: string): Promise<CheckoutSession> {
    try {
      // Call GB Prime Pay API to create PromptPay QR
      const response = await fetch(`${this.config.apiUrl}/v3/qrcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.secretKey}`,
        },
        body: JSON.stringify({
          publicKey: this.config.publicKey,
          amount: checkoutData.amount,
          referenceNo: referenceNo,
          detail: checkoutData.detail,
          customerName: checkoutData.customerName,
          customerEmail: checkoutData.customerEmail,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GB Prime Pay API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.qrCode || data.qrImage) {
        // Return HTML page with QR code
        const qrImage = data.qrImage || data.qrCode;
        const html = this.createPromptPayPage({
          qrImage,
          amount: checkoutData.amount,
          referenceNo: referenceNo,
          expiredTime: data.expiredTime || "15 minutes",
        });

        return {
          id: referenceNo,
          url: `data:text/html;base64,${btoa(html)}`,
        };
      }

      throw new Error("Failed to generate PromptPay QR code");
    } catch (error: any) {
      console.error("PromptPay QR creation error:", error);
      throw error;
    }
  }

  /**
   * Create checkout form for credit card and bank transfer
   */
  private async createCheckoutForm(checkoutData: any, referenceNo: string, origin: string): Promise<CheckoutSession> {
    // Create HTML form that redirects to GB Prime Pay
    const html = this.createPaymentForm(checkoutData, referenceNo, origin);
    
    return {
      id: referenceNo,
      url: `data:text/html;base64,${btoa(html)}`,
    };
  }

  /**
   * Create HTML page for PromptPay QR code
   */
  private createPromptPayPage(params: {
    qrImage: string;
    amount: string;
    referenceNo: string;
    expiredTime: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>PromptPay Payment</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .amount {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin: 20px 0;
    }
    .qr-code {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }
    .qr-code img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .info {
      margin: 20px 0;
      color: #666;
      font-size: 14px;
    }
    .reference {
      font-family: monospace;
      background: #f0f0f0;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 10px 0;
    }
    .expire {
      color: #e74c3c;
      font-weight: bold;
      margin-top: 15px;
    }
    .instruction {
      color: #999;
      font-size: 12px;
      margin-top: 20px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>สแกน QR Code เพื่อชำระเงิน</h1>
    <div class="amount">฿${parseFloat(params.amount).toFixed(2)}</div>
    <div class="qr-code">
      <img src="${params.qrImage}" alt="PromptPay QR Code">
    </div>
    <div class="info">
      <p><strong>Reference No.:</strong></p>
      <p class="reference">${params.referenceNo}</p>
      <p class="expire">หมดอายุ: ${params.expiredTime}</p>
    </div>
    <p class="instruction">
      กรุณาเปิดแอปธนาคารของคุณ<br>
      และสแกน QR Code เพื่อชำระเงิน
    </p>
  </div>
</body>
</html>`;
  }

  /**
   * Create HTML form for payment redirect
   */
  private createPaymentForm(checkoutData: any, referenceNo: string, origin: string): string {
    // GB Prime Pay uses form POST to redirect
    const formFields = `
      <input type="hidden" name="publicKey" value="${this.escapeHtml(this.config.publicKey)}">
      <input type="hidden" name="amount" value="${checkoutData.amount}">
      <input type="hidden" name="referenceNo" value="${referenceNo}">
      <input type="hidden" name="detail" value="${this.escapeHtml(checkoutData.detail)}">
      <input type="hidden" name="customerName" value="${this.escapeHtml(checkoutData.customerName)}">
      <input type="hidden" name="customerEmail" value="${this.escapeHtml(checkoutData.customerEmail || "")}">
      <input type="hidden" name="responseUrl" value="${this.escapeHtml(checkoutData.responseUrl)}">
      <input type="hidden" name="backgroundUrl" value="${this.escapeHtml(checkoutData.backgroundUrl)}">
      <input type="hidden" name="paymentType" value="${checkoutData.paymentType}">
    `;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to GB Prime Pay...</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .loading {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    p {
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>กำลังเปลี่ยนเส้นทางไปยังหน้าชำระเงิน...</p>
    <p style="font-size: 12px; color: #999;">Redirecting to payment page...</p>
  </div>
  <form id="paymentForm" method="post" action="${this.config.checkoutUrl}">
    ${formFields}
  </form>
  <script>
    window.onload = function() {
      document.getElementById('paymentForm').submit();
    };
  </script>
</body>
</html>`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Verify payment status
   */
  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    try {
      // Call GB Prime Pay API to verify payment
      const response = await fetch(`${this.config.apiUrl}/v3/checkStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.secretKey}`,
        },
        body: JSON.stringify({
          publicKey: this.config.publicKey,
          referenceNo: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`GB Prime Pay verification API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check payment status
      const isPaid = data.resultCode === "00" || data.status === "success" || data.status === "paid";
      
      return {
        verified: isPaid,
        amount: data.amount ? parseFloat(data.amount) * 100 : undefined, // Convert to satang
        status: data.status || (isPaid ? "paid" : "pending"),
        customerEmail: data.customerEmail,
        error: isPaid ? undefined : (data.message || "Payment not verified"),
      };
    } catch (error: any) {
      console.error("GB Prime Pay verification error:", error);
      return {
        verified: false,
        error: error.message || "Verification failed",
      };
    }
  }
}

