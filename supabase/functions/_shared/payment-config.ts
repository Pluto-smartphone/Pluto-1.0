// Stripe Checkout only when client selects paymentMethod === "stripe" and STRIPE_SECRET_KEY is set.

import { PaymentProvider } from "./payment-provider.ts";
import { StripePaymentProvider } from "./stripe-payment-provider.ts";

export type PaymentProviderType = "stripe";

export function getPaymentProvider(paymentMethod?: string): PaymentProvider {
  const secret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new StripePaymentProvider(secret);
}

/** verify-payment: Stripe session ids always start with cs_ */
export function getPaymentProviderForVerification(sessionId: string): PaymentProvider {
  const secret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new StripePaymentProvider(secret);
}
