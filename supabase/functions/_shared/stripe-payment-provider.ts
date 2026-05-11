// Stripe Checkout — THB, cards + PromptPay (requires TH Stripe account for PromptPay)
import Stripe from "npm:stripe@14.25.0";
import type {
  PaymentProvider,
  CreateCheckoutParams,
  CheckoutSession,
  PaymentVerificationResult,
} from "./payment-provider.ts";

function parsePaymentMethods(): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const raw = Deno.env.get("STRIPE_PAYMENT_METHODS")?.trim();
  if (raw) {
    return raw.split(",").map((s) => s.trim()) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  }
  return ["card", "promptpay"];
}

export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSession> {
    const payment_method_types = parsePaymentMethods();

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = params.lineItems.map(
      (item) => ({
        price_data: {
          currency: "thb",
          product_data: {
            name: item.name.slice(0, 120),
            description: item.description?.slice(0, 500),
            ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
          },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      })
    );

    const meta: Record<string, string> = {};
    if (params.metadata) {
      for (const [k, v] of Object.entries(params.metadata)) {
        meta[k] = String(v ?? "").slice(0, 500);
      }
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types,
      line_items,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.userId.slice(0, 200),
      customer_email: params.customerEmail,
      metadata: meta,
      locale: "auto",
    });

    if (!session.url) {
      throw new Error("Stripe Checkout did not return a URL");
    }

    return {
      id: session.id,
      url: session.url,
    };
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerificationResult> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const paid =
      session.payment_status === "paid" || session.payment_status === "no_payment_required";

    return {
      verified: paid,
      amount: session.amount_total != null ? session.amount_total / 100 : undefined,
      paymentStatus: session.payment_status ?? undefined,
      checkoutStatus: session.status ?? undefined,
      status: session.payment_status ?? session.status,
      customerEmail: session.customer_details?.email ?? session.customer_email ?? undefined,
      error: paid ? undefined : "Payment not completed",
    };
  }
}
