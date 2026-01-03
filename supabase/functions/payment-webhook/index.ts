import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Paysolutions sends POST data as form data or JSON
    let paymentData: any = {};
    
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      paymentData = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        paymentData[key] = value;
      }
    } else {
      // Try to parse as text first
      const text = await req.text();
      try {
        paymentData = JSON.parse(text);
      } catch {
        // If not JSON, parse as URL-encoded
        const params = new URLSearchParams(text);
        for (const [key, value] of params.entries()) {
          paymentData[key] = value;
        }
      }
    }

    console.log("Payment webhook received:", paymentData);

    // Extract payment information from Paysolutions callback
    // Common fields: refno, status, amount, transaction_id, etc.
    const referenceNo = paymentData.refno || paymentData.referenceNo || paymentData.ref_no;
    const status = paymentData.status || paymentData.payment_status;
    const amount = paymentData.amount || paymentData.total;
    const transactionId = paymentData.transaction_id || paymentData.txn_id;
    const paymentMethod = paymentData.payment_method || paymentData.channel;

    if (!referenceNo) {
      console.error("Missing reference number in webhook data");
      return new Response(
        JSON.stringify({ error: "Missing reference number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store payment webhook data in database (optional - create a payments table if needed)
    // For now, just log it
    console.log("Payment webhook data:", {
      referenceNo,
      status,
      amount,
      transactionId,
      paymentMethod,
      fullData: paymentData,
    });

    // TODO: Update order status in database based on payment status
    // Example:
    // if (status === 'success' || status === 'paid') {
    //   await supabaseClient
    //     .from('orders')
    //     .update({ status: 'paid', payment_reference: referenceNo })
    //     .eq('reference_no', referenceNo);
    // }

    // Return success response to Paysolutions
    return new Response(JSON.stringify({ 
      success: true,
      message: "Webhook received successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error processing payment webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || "Webhook processing failed" 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

