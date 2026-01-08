// Payment Provider Configuration
// Change this to switch between different payment providers

import { PaymentProvider } from "./payment-provider.ts";
import { GBPrimePayProvider } from "./gbprimepay-provider.ts";
// Legacy provider (kept for reference)
// import { PaysolutionsPaymentProvider } from "./paysolutions-provider.ts";

export type PaymentProviderType = "gbprimepay" | "paysolutions" | "omise" | "paypal" | "2c2p";

export function getPaymentProvider(): PaymentProvider {
  // Get provider type from environment variable (default: gbprimepay)
  const providerType = (Deno.env.get("PAYMENT_PROVIDER") || "gbprimepay") as PaymentProviderType;
  const apiKey = Deno.env.get("PAYMENT_API_KEY") || Deno.env.get("GBPRIMEPAY_SECRET_KEY") || "";

  switch (providerType) {
    case "gbprimepay":
      return new GBPrimePayProvider(apiKey);
    
    // Legacy providers (kept for reference)
    // case "paysolutions":
    //   return new PaysolutionsPaymentProvider(apiKey);
    // case "omise":
    //   return new OmisePaymentProvider(apiKey);
    // case "paypal":
    //   return new PayPalPaymentProvider(apiKey);
    // case "2c2p":
    //   return new TwoC2PPaymentProvider(apiKey);
    
    default:
      console.warn(`Unknown payment provider: ${providerType}, defaulting to GB Prime Pay`);
      return new GBPrimePayProvider(apiKey);
  }
}




