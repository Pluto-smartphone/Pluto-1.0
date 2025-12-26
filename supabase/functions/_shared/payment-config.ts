// Payment Provider Configuration
// Change this to switch between different payment providers

import { PaymentProvider } from "./payment-provider.ts";
import { PaysolutionsPaymentProvider } from "./paysolutions-provider.ts";
// Import other providers here when implemented:
// import { OmisePaymentProvider } from "./omise-provider.ts";
// import { PayPalPaymentProvider } from "./paypal-provider.ts";
// import { TwoC2PPaymentProvider } from "./2c2p-provider.ts";

export type PaymentProviderType = "paysolutions" | "omise" | "paypal" | "2c2p";

export function getPaymentProvider(): PaymentProvider {
  // Get provider type from environment variable (default: paysolutions)
  const providerType = (Deno.env.get("PAYMENT_PROVIDER") || "paysolutions") as PaymentProviderType;
  const apiKey = Deno.env.get("PAYMENT_API_KEY") || Deno.env.get("PAYSOLUTIONS_BEARER_TOKEN") || "";

  switch (providerType) {
    case "paysolutions":
      return new PaysolutionsPaymentProvider(apiKey);
    
    // Add other providers here:
    // case "omise":
    //   return new OmisePaymentProvider(apiKey);
    // case "paypal":
    //   return new PayPalPaymentProvider(apiKey);
    // case "2c2p":
    //   return new TwoC2PPaymentProvider(apiKey);
    
    default:
      console.warn(`Unknown payment provider: ${providerType}, defaulting to Paysolutions`);
      return new PaysolutionsPaymentProvider(apiKey);
  }
}




