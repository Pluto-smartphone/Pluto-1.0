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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { cartItems, paymentMethod = 'credit-card' } = await req.json();
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
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
    
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      const product = productMap.get(item.id);
      return sum + (product!.price * item.quantity);
    }, 0);

    // Calculate tax only for credit card payment
    const tax = paymentMethod === 'credit-card' ? subtotal * 0.07 : 0;
    const totalAmount = subtotal + tax;

    // Get payment provider (Paysolutions)
    const paymentProvider = getPaymentProvider();

    // Map payment method to Paysolutions channel
    let channel = "full"; // Default: show all payment options
    if (paymentMethod === 'promptpay') {
      channel = "promptpay";
    } else if (paymentMethod === 'credit-card') {
      channel = "full"; // Credit card is available in full channel
    } else if (paymentMethod === 'bank-transfer') {
      channel = "ibanking";
    }

    // Create line items for Paysolutions (amount in satang)
    const lineItems = cartItems.map((item: any) => {
      const product = productMap.get(item.id);
      return {
        name: product!.name,
        description: `${product!.brand} - ${product!.condition}`,
        amount: Math.round(product!.price * 100), // Convert to satang
        quantity: item.quantity,
        imageUrl: product!.image_url,
      };
    });

    // Add tax line item if payment method is credit card
    if (paymentMethod === 'credit-card' && tax > 0) {
      lineItems.push({
        name: "Tax (VAT 7%)",
        description: "Value Added Tax",
        amount: Math.round(tax * 100), // Convert to satang
        quantity: 1,
      });
    }

    // Get origin URL for redirects
    const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";

    // Create checkout session using payment provider
    const session = await paymentProvider.createCheckoutSession({
      lineItems: lineItems,
      customerEmail: user?.email,
      userId: user?.id || "guest",
      successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/payment`,
      metadata: {
        user_id: user?.id || "guest",
        payment_method: paymentMethod,
        channel: channel,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
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
