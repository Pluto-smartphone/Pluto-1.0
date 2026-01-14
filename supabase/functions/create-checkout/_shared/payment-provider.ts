// Payment Provider Abstraction Layer
// This allows easy switching between different payment providers

export interface PaymentLineItem {
  name: string;
  description?: string;
  amount: number; // in smallest currency unit (e.g., satang for THB)
  quantity: number;
  imageUrl?: string;
}

export interface CreateCheckoutParams {
  lineItems: PaymentLineItem[];
  customerEmail?: string;
  customerId?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  amount?: number;
  status?: string;
  customerEmail?: string;
  error?: string;
}

export interface PaymentProvider {
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession>;
  verifyPayment(sessionId: string): Promise<PaymentVerificationResult>;
}
