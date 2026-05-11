import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { generateInvoiceHTML, sendEmail, type InvoiceItem } from "../_shared/invoice.ts";

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
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

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
        const { data: orderRow } = await supabaseAdmin
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

        // Auto-send invoice when paid (idempotent)
        if (computedStatus === "paid" && orderRow && !orderRow.invoice_sent_at) {
          try {
            const customerEmail = (orderRow.customer_email as string | null) ?? undefined;
            if (customerEmail) {
              const items = (orderRow.items as InvoiceItem[]) || [];
              const totalAmount = Number(orderRow.amount_total ?? 0);
              const taxAmount = 0;
              const invoiceHtml = generateInvoiceHTML({
                orderId: String(orderRow.id),
                customerName: (orderRow.customer_name as string | null) || "Customer",
                customerEmail,
                items,
                subtotal: totalAmount - taxAmount,
                taxAmount,
                totalAmount,
                referenceNo: session.id,
                date: new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                shipping: (orderRow.shipping as Record<string, unknown> | null) ?? undefined,
              });

              await sendEmail({
                to: customerEmail,
                subject: `Invoice #${session.id} - การสั่งซื้อของคุณ`,
                html: invoiceHtml,
              });

              await supabaseAdmin
                .from("orders")
                .update({
                  invoice_email: customerEmail,
                  invoice_sent_at: new Date().toISOString(),
                })
                .eq("id", orderRow.id);
            }
          } catch (e) {
            console.error("Failed to auto-send invoice:", e);
            // Do not fail webhook on email issues
          }
        }
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
