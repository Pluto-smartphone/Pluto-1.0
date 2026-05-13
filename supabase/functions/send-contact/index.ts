import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_INBOX = "pluto.th.business@gmail.com";

const SUBJECT_LABELS: Record<string, string> = {
  general: "General inquiry",
  support: "Technical support",
  order: "Order status",
  return: "Product return",
  partnership: "Partnership",
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subjectKey = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subjectKey || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (name.length > 200 || message.length > 8000 || subjectKey.length > 64) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inbox = Deno.env.get("CONTACT_TO_EMAIL")?.trim() || DEFAULT_INBOX;
    const subjectLabel = SUBJECT_LABELS[subjectKey] ?? subjectKey;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Contact form</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 640px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #667eea;">Pluto — contact form</h2>
  <p><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
  <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
</body>
</html>`;

    const result = await sendEmail({
      to: inbox,
      subject: `[Pluto Contact] ${subjectLabel}`,
      html,
      replyTo: email,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.message || "Email not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.emailId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send message";
    console.error("send-contact error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
