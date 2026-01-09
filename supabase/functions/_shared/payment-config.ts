// Payment Provider Configuration
// Simple Payment Provider (Manual Payment)

import { PaymentProvider } from "./payment-provider.ts";
import { SimplePaymentProvider } from "./simple-payment-provider.ts";

export type PaymentProviderType = "simple";

export function getPaymentProvider(): PaymentProvider {
  // Use simple payment provider (manual payment)
  return new SimplePaymentProvider();
}




