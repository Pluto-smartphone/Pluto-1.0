// Stripe Checkout only when client selects paymentMethod === "stripe" and STRIPE_SECRET_KEY is set.

import { PaymentProvider } from "./payment-provider.ts";
import { SimplePaymentProvider } from "./simple-payment-provider.ts";
import { StripePaymentProvider } from "./stripe-payment-provider.ts";

export type PaymentProviderType = "stripe" | "simple";

export function getPaymentProvider(paymentMethod?: string): PaymentProvider {
  const secret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  if (secret && paymentMethod === "stripe") {
    return new StripePaymentProvider(secret);
  }
  return new SimplePaymentProvider();
}

/** verify-payment: Stripe session ids always start with cs_ */
export function getPaymentProviderForVerification(sessionId: string): PaymentProvider {
  const secret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  if (secret && sessionId.startsWith("cs_")) {
    return new StripePaymentProvider(secret);
  }
  return new SimplePaymentProvider();
}




