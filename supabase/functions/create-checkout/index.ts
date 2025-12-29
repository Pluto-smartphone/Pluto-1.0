import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getPaymentProvider } from "../_shared/payment-config.ts";
import type { PaymentLineItem } from "../_shared/payment-provider.ts";

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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { cartItems, channel } = await req.json();
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Get authenticated user with proper validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate cart items by fetching real prices from database
    const productIds = cartItems.map((item: any) => item.id);
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, price, brand, condition, image_url')
      .in('id', productIds)
      .eq('status', 'available');

    if (productsError || !products) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to validate cart items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate each cart item against database
    for (const item of cartItems) {
      const product = productMap.get(item.id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.id} not found or unavailable` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify price matches (prevent price manipulation)
      if (Math.abs(product.price - item.price) > 0.01) {
        return new Response(
          JSON.stringify({ error: "Price mismatch detected. Please refresh your cart." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Get payment provider (configurable via PAYMENT_PROVIDER env var)
    const paymentProvider = getPaymentProvider();

    // Create line items using validated database prices
    const lineItems: PaymentLineItem[] = cartItems.map((item: any) => {
      const product = productMap.get(item.id);
      return {
        name: product!.name,
        description: `${product!.brand} - ${product!.condition}`,
        amount: Math.round(product!.price * 100), // Convert to smallest unit (satang for THB)
        quantity: item.quantity,
        imageUrl: product!.image_url || undefined,
      };
    });

    // Create checkout session using payment provider abstraction
    const origin = req.headers.get("origin") || "";
    const session = await paymentProvider.createCheckoutSession({
      lineItems,
      customerEmail: user?.email,
      userId: user?.id || "guest",
      successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/payment`,
      metadata: {
        user_id: user?.id || "guest",
        channel: channel || "full", // 'full' for credit card, 'promptpay' for QR, 'bank-transfer' for bank transfer
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Payment processing failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
