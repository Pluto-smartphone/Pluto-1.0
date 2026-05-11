import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getPaymentProvider } from "../_shared/payment-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { cartItems, paymentMethod = 'promptpay', shipping } = await req.json();
    
    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authenticated user (optional - allow guest checkout)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
      if (!authError && authUser) {
        user = authUser;
      }
    }

    // For manual payment, use cart items directly (no need to validate against database)
    // This allows using frontend products without requiring them in database

    // Validate cart items have required fields
    for (const item of cartItems) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        return new Response(
          JSON.stringify({ error: "Invalid cart item data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Calculate total amount (no tax for manual payment)
    const totalAmount = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Get payment provider (Simple Payment - Manual)
    const paymentProvider = getPaymentProvider(paymentMethod);

    // Create line items (amount in satang)
    const lineItems = cartItems.map((item: any) => {
      return {
        name: item.name,
        description: `${item.brand || ''} - ${item.condition || ''}`.trim(),
        amount: Math.round(item.price * 100), // Convert to satang
        quantity: item.quantity,
        imageUrl: item.image || item.image_url || '',
      };
    });

    // Get origin URL for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    
    // Get Supabase URL for webhook
    const postbackUrl = `${supabaseUrl}/functions/v1/payment-webhook`;

    // Create checkout session using payment provider
    const customerEmail =
      (shipping && typeof shipping.email === "string" && shipping.email.trim()) ||
      user?.email;

    const session = await paymentProvider.createCheckoutSession({
      lineItems: lineItems,
      customerEmail: customerEmail || undefined,
      userId: user?.id || "guest",
      successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/payment`,
      metadata: {
        user_id: user?.id || "guest",
        payment_method: paymentMethod,
        postbackUrl: postbackUrl,
        customerName: user?.user_metadata?.full_name || "Customer",
        // shipping info (flattened)
        ...(shipping ? {
          ship_firstName: String(shipping.firstName || ''),
          ship_lastName: String(shipping.lastName || ''),
          ship_email: String(shipping.email || ''),
          ship_phone: String(shipping.phone || ''),
          ship_houseNo: String(shipping.houseNo || ''),
          ship_building: String(shipping.building || ''),
          ship_moo: String(shipping.moo || ''),
          ship_soi: String(shipping.soi || ''),
          ship_road: String(shipping.road || ''),
          ship_subdistrict: String(shipping.subdistrict || ''),
          ship_district: String(shipping.district || ''),
          ship_province: String(shipping.province || ''),
          ship_postalCode: String(shipping.postalCode || ''),
        } : {}),
      },
    });

    console.log("Checkout session created:", session.id);

    // Persist order in DB (service role; never trust client-side success redirect alone)
    try {
      await supabaseServiceClient.from("orders").insert({
        user_id: user?.id ?? null,
        provider: "stripe",
        checkout_session_id: session.id,
        status: "created",
        currency: "thb",
        amount_total: Number(totalAmount.toFixed(2)),
        customer_email: customerEmail ?? null,
        customer_name: (user?.user_metadata?.full_name as string | undefined) || null,
        items: lineItems.map((li) => ({
          name: li.name,
          quantity: li.quantity,
          amount: li.amount,
        })),
        shipping: shipping ?? null,
        metadata: {
          payment_method: paymentMethod,
        },
      });
    } catch (e) {
      console.error("Failed to persist order:", e);
      // Do not block checkout if persistence fails; webhook can still reconstruct minimal info.
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id, html: session.html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    const errorMessage = error?.message || "Payment processing failed";
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/* เหลือเพิ่มประวัติหลังจากสั่งซื้อในฐานข้อมูล Supabase เพื่อให้สามารถแสดงประวัติการสั่งซื้อในหน้าโปรไฟล์ของผู้ใช้ได้ โดยสามารถเพิ่มโค้ดหลังจากสร้าง checkout session สำเร็จแล้ว  */