import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { cartItems } = await req.json();
    
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
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    let customerId;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create line items using validated database prices
    const lineItems = cartItems.map((item: any) => {
      const product = productMap.get(item.id);
      return {
        price_data: {
          currency: "thb",
          product_data: {
            name: product!.name,
            description: `${product!.brand} - ${product!.condition}`,
            images: product!.image_url ? [product!.image_url] : [],
          },
          unit_amount: Math.round(product!.price * 100), // Use database price, not client price
        },
        quantity: item.quantity,
      };
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user?.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment`,
      metadata: {
        user_id: user?.id || "guest",
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(JSON.stringify({ error: "Payment processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
