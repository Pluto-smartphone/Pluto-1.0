import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getPaymentProviderForVerification } from "../_shared/payment-config.ts";
import type { PaymentVerificationResult } from "../_shared/payment-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function orderStatusFromVerification(result: PaymentVerificationResult) {
  const paymentStatus = result.paymentStatus ?? result.status ?? "";
  const checkoutStatus = result.checkoutStatus ?? "";

  if (result.verified || paymentStatus === "paid" || paymentStatus === "no_payment_required") {
    return "paid";
  }
  if (checkoutStatus === "expired") return "canceled";
  if (paymentStatus === "unpaid" || checkoutStatus === "open" || checkoutStatus === "complete") {
    return "pending";
  }
  if (paymentStatus || checkoutStatus) return "failed";
  return null;
}

async function getAuthenticatedUserId(
  supabaseUrl: string,
  supabaseAnonKey: string,
  authHeader: string | null,
) {
  if (!authHeader || !supabaseUrl || !supabaseAnonKey) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

async function syncOrderFromVerification(
  sessionId: string,
  result: PaymentVerificationResult,
  authHeader: string | null,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !supabaseServiceRoleKey) return;

  const status = orderStatusFromVerification(result);
  if (!status) return;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  const updatePayload: Record<string, unknown> = {
    status,
  };
  const paymentStatus = result.paymentStatus ?? result.status;
  if (paymentStatus) updatePayload.payment_status = paymentStatus;
  if (typeof result.amount === "number") updatePayload.amount_total = result.amount;
  if (result.customerEmail) updatePayload.customer_email = result.customerEmail;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("orders")
    .update(updatePayload)
    .eq("checkout_session_id", sessionId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("Failed to sync existing order:", updateError.message, updateError.code);
    return;
  }
  if (updated?.id) return;

  const userId = await getAuthenticatedUserId(supabaseUrl, supabaseAnonKey, authHeader);
  const insertPayload = {
    user_id: userId,
    provider: "stripe",
    checkout_session_id: sessionId,
    status,
    payment_status: result.paymentStatus ?? result.status ?? null,
    currency: "thb",
    amount_total: typeof result.amount === "number" ? result.amount : null,
    customer_email: result.customerEmail ?? null,
    items: [],
    metadata: { synced_by: "verify-payment" },
  };

  const { error: insertError } = await supabaseAdmin.from("orders").insert(insertPayload);
  if (!insertError) return;

  if (insertError.code === "23503" && userId) {
    const { error: retryError } = await supabaseAdmin
      .from("orders")
      .insert({ ...insertPayload, user_id: null });
    if (retryError && retryError.code !== "23505") {
      console.error("Failed to sync fallback guest order:", retryError.message, retryError.code);
    }
    return;
  }

  if (insertError.code !== "23505") {
    console.error("Failed to sync new order:", insertError.message, insertError.code);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ verified: false, error: "Session ID required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get payment provider (configurable via PAYMENT_PROVIDER env var)
    const paymentProvider = getPaymentProviderForVerification(sessionId);

    // Verify payment using payment provider abstraction
    const result = await paymentProvider.verifyPayment(sessionId);
    await syncOrderFromVerification(sessionId, result, req.headers.get("Authorization"));
    
    console.log("Payment verification:", { sessionId, verified: result.verified, status: result.status });

    return new Response(JSON.stringify({
      verified: result.verified,
      amount: result.amount,
      payment_status: result.paymentStatus ?? result.status,
      checkout_status: result.checkoutStatus,
      status: result.status,
      customerEmail: result.customerEmail,
      error: result.error,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ 
      verified: false, 
      error: error.message || "Verification failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
