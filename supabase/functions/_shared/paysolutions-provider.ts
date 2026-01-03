// Paysolutions Payment Provider Implementation
import type { 
  PaymentProvider, 
  CreateCheckoutParams, 
  CheckoutSession, 
  PaymentVerificationResult 
} from "./payment-provider.ts";

interface PaysolutionsConfig {
  merchantId: string;
  apiKey?: string; // Bearer token for PromptPay API
  currencyCode?: string; // Default: "00" for THB
  language?: string; // Default: "TH"
  paymentUrl?: string; // Default: "https://payments.paysolutions.asia/payment"
  promptPayApiUrl?: string; // Default: "https://apis.paysolutions.asia/tep/api/v2/promptpaynew"
}

export class PaysolutionsPaymentProvider implements PaymentProvider {
  private config: PaysolutionsConfig;

  constructor(apiKey: string) {
    // Parse config from environment variables
    // Format: merchantId|bearerToken|currencyCode|language
    // Or use separate env vars
    const merchantId = Deno.env.get("PAYSOLUTIONS_MERCHANT_ID") || "";
    const bearerToken = Deno.env.get("PAYSOLUTIONS_BEARER_TOKEN") || apiKey;
    const currencyCode = Deno.env.get("PAYSOLUTIONS_CURRENCY_CODE") || "00";
    const language = Deno.env.get("PAYSOLUTIONS_LANGUAGE") || "TH";
    
    this.config = {
      merchantId,
      apiKey: bearerToken,
      currencyCode,
      language,
      paymentUrl: "https://payments.paysolutions.asia/payment",
      promptPayApiUrl: "https://apis.paysolutions.asia/tep/api/v2/promptpaynew",
    };
  }

  /**
   * Generate unique 12-digit reference number
   * Format: YYMMDDHHMMSS or timestamp-based with random
   */
  private generateReferenceNo(): string {
    // Option 1: Use date-based format (YYMMDDHHMMSS)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    
    // This gives us 12 digits: YYMMDDHHMMSS
    const dateBased = `${year}${month}${day}${hour}${minute}${second}`;
    
    // Option 2: Use timestamp with random for better uniqueness
    // If we need more uniqueness, we can use timestamp + random
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000); // 4 digits
    const timestampBased = `${timestamp.toString().slice(-8)}${random.toString().padStart(4, '0')}`;
    
    // Use date-based format (more readable and standard)
    return dateBased;
  }

  /**
   * Create checkout session - returns HTML form page URL or PromptPay QR data
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    // Calculate total amount (convert from satang to THB)
    const totalAmount = params.lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0) / 100;
    
    // Generate unique reference number
    const referenceNo = this.generateReferenceNo();
    
    // Create product detail string
    const productDetail = params.lineItems
      .map(item => `${item.name} x${item.quantity}`)
      .join(", ");

    // Check if PromptPay is requested via metadata
    // Channel options: full, promptpay, installment, ibanking, bill, truewallet, alipay, wechat, etc.
    const channel = params.metadata?.channel || "full";
    const usePromptPay = channel === "promptpay";
    
    // Validate merchant ID
    if (!this.config.merchantId) {
      throw new Error("Paysolutions Merchant ID is not configured. Please set PAYSOLUTIONS_MERCHANT_ID environment variable.");
    }

    if (usePromptPay && this.config.apiKey) {
      // Use PromptPay API
      return await this.createPromptPaySession({
        referenceNo,
        totalAmount,
        productDetail,
        customerEmail: params.customerEmail || "",
        customerName: params.metadata?.customerName || "Customer",
      });
    } else {
      // Get Supabase project URL for webhook
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const postbackUrl = params.metadata?.postbackUrl || `${supabaseUrl}/functions/v1/payment-webhook`;
      
      // Use form redirect
      return await this.createFormRedirectSession({
        referenceNo,
        totalAmount,
        productDetail,
        customerEmail: params.customerEmail || "",
        channel: channel,
        bankins: params.metadata?.bankins,
        monthins: params.metadata?.monthins,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        postbackUrl: postbackUrl,
      });
    }
  }

  /**
   * Create PromptPay session using API
   */
  private async createPromptPaySession(params: {
    referenceNo: string;
    totalAmount: number;
    productDetail: string;
    customerEmail: string;
    customerName: string;
  }): Promise<CheckoutSession> {
    try {
      const url = new URL(this.config.promptPayApiUrl!);
      url.searchParams.append("merchantID", this.config.merchantId);
      url.searchParams.append("productDetail", params.productDetail);
      url.searchParams.append("customerEmail", params.customerEmail);
      url.searchParams.append("customerName", params.customerName);
      url.searchParams.append("total", params.totalAmount.toFixed(2));
      url.searchParams.append("referenceNo", params.referenceNo);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${this.config.apiKey}`,
        },
      });

      const data = await response.json();

      if (data.message === "duplicate reference number") {
        // Retry with new reference number
        const newRefNo = this.generateReferenceNo();
        return this.createPromptPaySession({ ...params, referenceNo: newRefNo });
      }

      if (data.message === "incomplete parameter" || data.status === "error") {
        throw new Error(data.message || "Failed to create PromptPay session");
      }

      if (data.status === "success" && data.data?.image) {
        // Return session with QR code image
        // Store reference number as session ID for verification
        return {
          id: params.referenceNo, // Use referenceNo as session ID
          url: `data:text/html;base64,${btoa(this.createPromptPayPage(data.data))}`,
        };
      }

      throw new Error("Unexpected response from PromptPay API");
    } catch (error: any) {
      console.error("PromptPay API error:", error);
      throw new Error(`Failed to create PromptPay session: ${error.message}`);
    }
  }

  /**
   * Create HTML page for PromptPay QR code display
   */
  private createPromptPayPage(qrData: {
    orderNo: number;
    referenceNo: string;
    total: number;
    orderdatetime: string;
    expiredate: string;
    image: string;
  }): string {
    const expiredTime = qrData.expiredate || "N/A";
    return `
<!DOCTYPE html>
<html>
<head>
  <title>PromptPay Payment</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
    }
    .qr-code {
      margin: 20px 0;
    }
    .qr-code img {
      max-width: 100%;
      height: auto;
    }
    .info {
      margin: 15px 0;
      color: #666;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 20px 0;
    }
    .expire {
      color: #e74c3c;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>สแกน QR Code เพื่อชำระเงิน</h1>
    <div class="amount">฿${qrData.total.toFixed(2)}</div>
    <div class="qr-code">
      <img src="${qrData.image}" alt="PromptPay QR Code">
    </div>
    <div class="info">
      <p>Reference No.: ${qrData.referenceNo}</p>
      <p>Order No.: ${qrData.orderNo}</p>
      ${expiredTime !== "N/A" ? `<p class="expire">หมดอายุ: ${expiredTime}</p>` : ""}
    </div>
    <p style="color: #999; font-size: 12px; margin-top: 20px;">
      กรุณาสแกน QR Code ด้วยแอปธนาคารของคุณ
    </p>
  </div>
</body>
</html>`;
  }

  /**
   * Create form redirect session
   */
  private async createFormRedirectSession(params: {
    referenceNo: string;
    totalAmount: number;
    productDetail: string;
    customerEmail: string;
    channel: string;
    bankins?: string;
    monthins?: string;
    successUrl: string;
    cancelUrl: string;
    postbackUrl?: string;
  }): Promise<CheckoutSession> {
    // Create HTML form page that auto-submits
    const html = this.createPaymentForm(params);
    
    // Encode HTML as base64 data URL
    const htmlBase64 = btoa(html);
    
    return {
      id: params.referenceNo, // Use referenceNo as session ID
      url: `data:text/html;base64,${htmlBase64}`,
    };
  }

  /**
   * Create HTML form for Paysolutions payment
   */
  private createPaymentForm(params: {
    referenceNo: string;
    totalAmount: number;
    productDetail: string;
    customerEmail: string;
    channel: string;
    bankins?: string;
    monthins?: string;
    successUrl: string;
    cancelUrl: string;
    postbackUrl?: string;
  }): string {
    // Get Supabase project URL for webhook
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const webhookUrl = params.postbackUrl || `${supabaseUrl}/functions/v1/payment-webhook`;
    
    const formFields = `
      <input type="hidden" name="customeremail" value="${this.escapeHtml(params.customerEmail)}">
      <input type="hidden" name="productdetail" value="${this.escapeHtml(params.productDetail)}">
      <input type="hidden" name="refno" value="${params.referenceNo}">
      <input type="hidden" name="merchantid" value="${this.config.merchantId}">
      <input type="hidden" name="cc" value="${this.config.currencyCode}">
      <input type="hidden" name="total" value="${params.totalAmount.toFixed(2)}">
      <input type="hidden" name="lang" value="${this.config.language}">
      <input type="hidden" name="returnurl" value="${this.escapeHtml(params.successUrl)}">
      <input type="hidden" name="cancelurl" value="${this.escapeHtml(params.cancelUrl)}">
      <input type="hidden" name="postbackurl" value="${this.escapeHtml(webhookUrl)}">
      ${params.channel ? `<input type="hidden" name="channel" value="${params.channel}">` : ""}
      ${params.bankins ? `<input type="hidden" name="bankins" value="${params.bankins}">` : ""}
      ${params.monthins ? `<input type="hidden" name="monthins" value="${params.monthins}">` : ""}
    `;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to Paysolutions...</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .loading {
      text-align: center;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>กำลังเปลี่ยนเส้นทางไปยังหน้าชำระเงิน...</p>
    <p style="color: #999; font-size: 12px;">Redirecting to payment page...</p>
  </div>
  <form id="paymentForm" method="post" action="${this.config.paymentUrl}">
    ${formFields}
  </form>
  <script>
    // Auto-submit form after page loads
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
   * Note: Paysolutions typically uses webhooks/callbacks for payment verification
   * This is a placeholder that can be extended with actual API verification if available
   */
  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    // The sessionId is the referenceNo
    // In a real implementation, you would:
    // 1. Check Paysolutions API for payment status using referenceNo
    // 2. Or verify against webhook data stored in database
    // 3. Or use Paysolutions callback verification endpoint if available
    
    // For now, return a basic response
    // You should implement actual verification based on Paysolutions API documentation
    console.log("Verifying Paysolutions payment:", sessionId);
    
    // TODO: Implement actual verification via Paysolutions API
    // This might require:
    // - Querying Paysolutions status API endpoint
    // - Checking database for webhook records
    // - Verifying payment signature/callback
    
    return {
      verified: false, // Set to true when payment is confirmed
      status: "pending",
      error: "Payment verification not yet implemented. Please check Paysolutions dashboard or implement verification API.",
    };
  }
}

