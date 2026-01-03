// Example: Template for creating a new payment provider
// Copy this file and rename it to your provider (e.g., omise-provider.ts)
// Then implement the methods according to your provider's API

import type { 
  PaymentProvider, 
  CreateCheckoutParams, 
  CheckoutSession, 
  PaymentVerificationResult 
} from "./payment-provider.ts";

export class ExamplePaymentProvider implements PaymentProvider {
  private apiKey: string;
  private apiSecret: string;
  // Add other provider-specific properties here

  constructor(apiKey: string, apiSecret?: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret || "";
    // Initialize provider SDK here
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    try {
      // 1. Convert line items to your provider's format
      const items = params.lineItems.map(item => ({
        // Map to your provider's item structure
        name: item.name,
        amount: item.amount,
        quantity: item.quantity,
        // ... other fields
      }));

      // 2. Create checkout/payment session using your provider's API
      // Example:
      // const response = await fetch('https://api.provider.com/checkout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     items,
      //     customer_email: params.customerEmail,
      //     success_url: params.successUrl,
      //     cancel_url: params.cancelUrl,
      //     metadata: params.metadata,
      //   }),
      // });
      // const data = await response.json();

      // 3. Return in standard format
      return {
        id: "session_id_from_provider", // data.session_id
        url: "https://checkout.provider.com/pay/...", // data.checkout_url
      };
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    try {
      // 1. Verify payment using your provider's API
      // Example:
      // const response = await fetch(`https://api.provider.com/payments/${sessionId}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      // });
      // const data = await response.json();

      // 2. Map provider's status to standard format
      // Example:
      // const isPaid = data.status === 'paid' || data.status === 'completed';
      
      return {
        verified: true, // isPaid
        amount: 10000, // data.amount (in smallest currency unit)
        status: "paid", // data.status
        customerEmail: "customer@example.com", // data.customer_email
      };
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      return {
        verified: false,
        error: error.message || "Verification failed",
      };
    }
  }
}

// Notes:
// - Make sure to handle errors properly
// - Convert amounts to smallest currency unit (satang for THB)
// - Map provider-specific statuses to standard format
// - Handle webhooks if your provider uses them for payment confirmation








