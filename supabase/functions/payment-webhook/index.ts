import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();
  const stripeSig = req.headers.get("stripe-signature");

  if (stripeSig && stripeSecret && webhookSecret) {
    try {
      const stripe = new Stripe(stripeSecret, {
        apiVersion: "2023-10-16",
        httpClient: Stripe.createFetchHttpClient(),
      });
      const rawBody = await req.text();
      const event = stripe.webhooks.constructEvent(rawBody, stripeSig, webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Stripe checkout.session.completed:", {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          client_reference_id: session.client_reference_id,
        });
        // Optional: persist order — add orders table + insert here
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("Stripe webhook error:", err?.message);
      return new Response(JSON.stringify({ error: err?.message || "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Legacy / manual providers (e.g. GB Prime Pay style body)
  try {
    let paymentData: Record<string, unknown> = {};

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      paymentData = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        paymentData[key] = value;
      }
    } else {
      const text = await req.text();
      try {
        paymentData = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        for (const [key, value] of params.entries()) {
          paymentData[key] = value;
        }
      }
    }

    const referenceNo = paymentData.referenceNo ?? paymentData.refno ?? paymentData.reference_no;
    if (!referenceNo) {
      console.log("Non-Stripe webhook (no referenceNo):", paymentData);
      return new Response(JSON.stringify({ success: true, message: "Ignored" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const resultCode = paymentData.resultCode;
    const status =
      paymentData.status || (resultCode === "00" ? "success" : "failed");

    console.log("Payment webhook (legacy):", { referenceNo, status });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook received successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error processing payment webhook:", error);
    return new Response(
      JSON.stringify({
        error: err?.message || "Webhook processing failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
