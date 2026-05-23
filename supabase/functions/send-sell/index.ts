import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/invoice.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_INBOX = "pluto.th.business@gmail.com";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENTS_BASE64_BYTES = 40 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

type SellImage = {
  filename?: unknown;
  contentType?: unknown;
  size?: unknown;
  content?: unknown;
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function asTrimmedString(value: unknown) {
  return String(value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isBase64(value: string) {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0;
}

function formatOptional(value: string) {
  return value ? escapeHtml(value) : "-";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const brand = asTrimmedString(body.brand);
    const model = asTrimmedString(body.model);
    const condition = asTrimmedString(body.condition);
    const price = asTrimmedString(body.price);
    const storage = asTrimmedString(body.storage);
    const color = asTrimmedString(body.color);
    const description = asTrimmedString(body.description);
    const contactEmail = asTrimmedString(body.contactEmail);
    const contactPhone = asTrimmedString(body.contactPhone);
    const images = Array.isArray(body.images) ? (body.images as SellImage[]) : [];

    if (!brand || !model || !condition || !price || !contactEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isEmail(contactEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0 || numericPrice > 999999) {
      return new Response(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (brand.length > 50 || model.length > 100 || storage.length > 20 || color.length > 50 || description.length > 2000 || contactPhone.length > 20) {
      return new Response(JSON.stringify({ error: "Input too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!images.length || images.length > MAX_IMAGES) {
      return new Response(JSON.stringify({ error: "Please upload 1-5 images" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const attachments = images.map((image, index) => {
      const filename = asTrimmedString(image.filename) || `device-photo-${index + 1}.jpg`;
      const contentType = asTrimmedString(image.contentType);
      const content = asTrimmedString(image.content);
      const size = Number(image.size);

      if (!ALLOWED_IMAGE_TYPES.has(contentType) || !Number.isFinite(size) || size <= 0 || size > MAX_IMAGE_SIZE || !isBase64(content)) {
        throw new Error("Invalid image upload");
      }

      return {
        filename: filename.replace(/[^\w.\-() ]/g, "_").slice(0, 120),
        content,
        content_type: contentType,
      };
    });

    const totalBase64Bytes = attachments.reduce((sum, item) => sum + item.content.length, 0);
    if (totalBase64Bytes > MAX_ATTACHMENTS_BASE64_BYTES) {
      return new Response(JSON.stringify({ error: "Images are too large to email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inbox = Deno.env.get("SELL_TO_EMAIL")?.trim() || Deno.env.get("CONTACT_TO_EMAIL")?.trim() || DEFAULT_INBOX;
    const submittedAt = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    const html = `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><title>Sell request</title></head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #222; max-width: 720px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #667eea;">Pluto - คำขอขายสมาร์ทโฟน</h2>
  <p><strong>เวลาที่ส่ง:</strong> ${escapeHtml(submittedAt)}</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
  <h3>ข้อมูลอุปกรณ์</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ยี่ห้อ</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(brand)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>รุ่น</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(model)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>สภาพ</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(condition)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ความจุ</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatOptional(storage)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>สี</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatOptional(color)}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ราคาที่คาดหวัง</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(numericPrice.toLocaleString("th-TH"))} บาท</td></tr>
  </table>
  <h3>รายละเอียดเพิ่มเติม</h3>
  <p style="white-space: pre-wrap;">${formatOptional(description)}</p>
  <h3>ข้อมูลติดต่อ</h3>
  <p><strong>อีเมล:</strong> ${escapeHtml(contactEmail)}</p>
  <p><strong>เบอร์โทร:</strong> ${formatOptional(contactPhone)}</p>
  <p><strong>รูปภาพ:</strong> แนบมากับอีเมลนี้ ${attachments.length} ไฟล์</p>
</body>
</html>`;

    const result = await sendEmail({
      to: inbox,
      subject: `[Pluto Sell] ${brand} ${model} - ${numericPrice.toLocaleString("th-TH")} THB`,
      html,
      replyTo: contactEmail,
      attachments,
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
    const message = err instanceof Error ? err.message : "Failed to send sell request";
    console.error("send-sell error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
