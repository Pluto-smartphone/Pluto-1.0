// Payment Provider Configuration
// GB Prime Pay Payment Provider

import { PaymentProvider } from "./payment-provider.ts";
import { GBPrimePayProvider } from "./gbprimepay-provider.ts";

export type PaymentProviderType = "gbprimepay";

export function getPaymentProvider(): PaymentProvider {
  // Get provider type from environment variable (default: gbprimepay)
  const providerType = (Deno.env.get("PAYMENT_PROVIDER") || "gbprimepay") as PaymentProviderType;
  const apiKey = Deno.env.get("PAYMENT_API_KEY") || Deno.env.get("GBPRIMEPAY_SECRET_KEY") || "";

  switch (providerType) {
    case "gbprimepay":
      return new GBPrimePayProvider(apiKey);
    
    default:
      console.warn(`Unknown payment provider: ${providerType}, defaulting to GB Prime Pay`);
      return new GBPrimePayProvider(apiKey);
  }
}




