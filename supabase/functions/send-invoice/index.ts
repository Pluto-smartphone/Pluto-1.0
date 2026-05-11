import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { generateInvoiceHTML, sendEmail, type InvoiceItem } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      orderId, 
      customerEmail, 
      customerName, 
      items, 
      totalAmount, 
      taxAmount = 0,
      referenceNo,
      shipping
    } = await req.json();

    if (!customerEmail || !items || !totalAmount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHTML({
      orderId: orderId || referenceNo,
      customerName: customerName || "Customer",
      customerEmail,
      items: items as InvoiceItem[],
      subtotal: totalAmount - taxAmount,
      taxAmount,
      totalAmount,
      referenceNo: referenceNo || orderId,
      date: new Date().toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      shipping,
    });

    const emailResult = await sendEmail({
      to: customerEmail,
      subject: `Invoice #${referenceNo || orderId} - การสั่งซื้อของคุณ`,
      html: invoiceHtml,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Invoice sent successfully",
        emailResult 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || "Failed to send invoice" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
