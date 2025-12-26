import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getPaymentProvider } from "../_shared/payment-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const paymentProvider = getPaymentProvider();

    // Verify payment using payment provider abstraction
    const result = await paymentProvider.verifyPayment(sessionId);
    
    console.log("Payment verification:", { sessionId, verified: result.verified, status: result.status });

    return new Response(JSON.stringify({
      verified: result.verified,
      amount: result.amount,
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
