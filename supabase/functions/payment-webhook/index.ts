import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import type { InvoiceItem } from "../_shared/invoice.ts";
import { sendPaidOrderNotifications } from "../_shared/order-emails.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function userIdFromStripeMetadata(meta: Stripe.Metadata | null | undefined): string | null {
  const raw = meta?.user_id;
  if (typeof raw !== "string" || raw === "guest") return null;
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(raw) ? raw : null;
}

function shippingFromStripeMeta(meta: Stripe.Metadata): Record<string, unknown> | null {
  if (!meta.ship_email && !meta.ship_firstName && !meta.ship_lastName) return null;
  return {
    firstName: meta.ship_firstName ?? "",
    lastName: meta.ship_lastName ?? "",
    email: meta.ship_email ?? "",
    phone: meta.ship_phone ?? "",
    houseNo: meta.ship_houseNo ?? "",
    building: meta.ship_building ?? "",
    moo: meta.ship_moo ?? "",
    soi: meta.ship_soi ?? "",
    road: meta.ship_road ?? "",
    subdistrict: meta.ship_subdistrict ?? "",
    district: meta.ship_district ?? "",
    province: meta.ship_province ?? "",
    postalCode: meta.ship_postalCode ?? "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();
  const stripeSig = req.headers.get("stripe-signature");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  if (stripeSig && (!stripeSecret || !webhookSecret)) {
    const missing = [
      !stripeSecret ? "STRIPE_SECRET_KEY" : "",
      !webhookSecret ? "STRIPE_WEBHOOK_SECRET" : "",
    ].filter(Boolean).join(", ");
    console.error(`Stripe webhook received but missing env: ${missing}`);
    return new Response(JSON.stringify({ error: `Missing Stripe webhook env: ${missing}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (stripeSig && stripeSecret && webhookSecret) {
    try {
      const stripe = new Stripe(stripeSecret, {
        apiVersion: "2023-10-16",
        httpClient: Stripe.createFetchHttpClient(),
      });
      const rawBody = await req.text();
      const event = stripe.webhooks.constructEvent(rawBody, stripeSig, webhookSecret);

      if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded" ||
        event.type === "checkout.session.async_payment_failed" ||
        event.type === "checkout.session.expired"
      ) {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Stripe ${event.type}:`, {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          client_reference_id: session.client_reference_id,
        });

        const computedStatus =
          session.payment_status === "paid"
            ? "paid"
            : event.type === "checkout.session.async_payment_failed"
              ? "failed"
              : event.type === "checkout.session.expired"
                ? "canceled"
                : "pending";

        const paymentIntentId = ((): string | null => {
          const pi = session.payment_intent;
          if (!pi) return null;
          if (typeof pi === "string") return pi;
          return pi.id ?? null;
        })();

        // Update order row (if exists)
        const { data: updatedRow } = await supabaseAdmin
          .from("orders")
          .update({
            status: computedStatus,
            payment_status: session.payment_status ?? null,
            payment_intent_id: paymentIntentId,
            amount_total: session.amount_total != null ? session.amount_total / 100 : null,
            currency: session.currency ?? "thb",
            customer_email:
              session.customer_details?.email ??
              session.customer_email ??
              null,
          })
          .eq("checkout_session_id", session.id)
          .select("*")
          .maybeSingle();

        let orderRow = updatedRow;

        // create-checkout insert may have failed — create row from Stripe so history + invoice work
        if (!orderRow) {
          console.log("No orders row for checkout session; upserting from Stripe:", session.id);
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items.data.price.product"],
          });
          const lines = fullSession.line_items?.data ?? [];
          const items: InvoiceItem[] = lines.map((li) => {
            const qty = li.quantity ?? 1;
            const total = li.amount_total ?? 0;
            return {
              name: (li.description || "Item").slice(0, 500),
              quantity: qty,
              amount: qty > 0 ? Math.round(total / qty) : total,
            };
          });
          const meta = fullSession.metadata ?? {};
          const userIdForRow = userIdFromStripeMetadata(meta);
          const customerEmail =
            fullSession.customer_details?.email ?? fullSession.customer_email ?? null;
          const customerName = fullSession.customer_details?.name ?? meta.customerName ?? null;
          const shipping = shippingFromStripeMeta(meta);

          const insertPayload = {
            user_id: userIdForRow,
            provider: "stripe",
            checkout_session_id: fullSession.id,
            payment_intent_id: paymentIntentId,
            status: computedStatus,
            payment_status: fullSession.payment_status ?? null,
            amount_total: fullSession.amount_total != null ? fullSession.amount_total / 100 : null,
            currency: fullSession.currency ?? "thb",
            customer_email: customerEmail,
            customer_name: typeof customerName === "string" ? customerName : null,
            items: items.length > 0 ? items : [],
            shipping,
            metadata: { ...meta, payment_method: meta.payment_method ?? "stripe" },
          };

          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("orders")
            .insert(insertPayload)
            .select("*")
            .maybeSingle();

          if (insErr) {
            console.error("Webhook insert order failed:", insErr.message, insErr.code);
            if (insErr.code === "23505") {
              const { data: fetched } = await supabaseAdmin
                .from("orders")
                .select("*")
                .eq("checkout_session_id", session.id)
                .maybeSingle();
              orderRow = fetched;
            } else if (insErr.code === "23503" && userIdForRow) {
              const { data: insertedGuest } = await supabaseAdmin
                .from("orders")
                .insert({ ...insertPayload, user_id: null })
                .select("*")
                .maybeSingle();
              orderRow = insertedGuest;
            }
          } else {
            orderRow = inserted;
          }
        }

        // Auto-send customer receipt + company notification when paid (idempotent).
        if (computedStatus === "paid" && orderRow) {
          await sendPaidOrderNotifications(supabaseAdmin, session.id, orderRow);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid signature";
      console.error("Stripe webhook error:", message);
      return new Response(JSON.stringify({ error: message }), {
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
