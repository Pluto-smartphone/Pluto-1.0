import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { generateInvoiceHTML, sendEmail, type InvoiceItem } from "./invoice.ts";

const DEFAULT_ORDER_INBOX = "pluto.th.business@gmail.com";

type OrderRow = {
  id: string;
  customer_email?: string | null;
  customer_name?: string | null;
  items?: unknown;
  amount_total?: number | string | null;
  currency?: string | null;
  shipping?: unknown;
  metadata?: unknown;
  invoice_sent_at?: string | null;
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBaht(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

function formatShippingForEmail(shipping: Record<string, unknown> | null | undefined) {
  if (!shipping) return "ไม่มีข้อมูลจัดส่ง";

  const parts: string[] = [];
  const get = (key: string) => {
    const value = shipping[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const name = `${get("firstName")} ${get("lastName")}`.trim();
  if (name) parts.push(name);
  const phone = get("phone");
  if (phone) parts.push(`โทร: ${phone}`);
  const email = get("email");
  if (email) parts.push(`อีเมล: ${email}`);

  const address = [
    get("houseNo"),
    get("building"),
    get("moo") ? `หมู่ ${get("moo")}` : "",
    get("soi") ? `ซอย ${get("soi")}` : "",
    get("road") ? `ถนน ${get("road")}` : "",
    get("subdistrict"),
    get("district"),
    get("province"),
    get("postalCode"),
  ].filter(Boolean);

  if (address.length) parts.push(address.join(" "));
  return parts.length ? parts.join("\n") : "ไม่มีข้อมูลจัดส่ง";
}

function generateCompanyOrderEmailHTML(params: {
  sessionId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  items: InvoiceItem[];
  shipping?: Record<string, unknown> | null;
}) {
  const itemRows = params.items.length
    ? params.items.map((item) => {
      const unitAmount = Number(item.amount ?? 0) / 100;
      const quantity = Number(item.quantity ?? 0);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(String(item.name ?? "Item"))}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatBaht(unitAmount)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatBaht(unitAmount * quantity)}</td>
        </tr>
      `;
    }).join("")
    : `<tr><td colspan="4" style="padding: 10px; color: #6b7280;">ไม่มีรายการสินค้าในระบบ</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><title>Paid order notification</title></head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; max-width: 760px; margin: 0 auto; padding: 24px; background: #f9fafb;">
  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 28px;">
    <h1 style="font-size: 22px; color: #4f46e5; margin: 0 0 12px;">มีการสั่งซื้อและชำระเงินแล้ว</h1>
    <p style="margin: 0 0 20px;">Stripe ยืนยันการชำระเงินสำเร็จ กรุณาตรวจสอบคำสั่งซื้อและดำเนินการจัดส่งต่อไป</p>

    <h2 style="font-size: 16px; color: #111827; margin: 24px 0 8px;">ข้อมูลคำสั่งซื้อ</h2>
    <p><strong>Order ID:</strong> ${escapeHtml(params.orderId)}</p>
    <p><strong>Stripe Session:</strong> ${escapeHtml(params.sessionId)}</p>
    <p><strong>ยอดชำระ:</strong> ${escapeHtml(params.currency.toUpperCase())} ${formatBaht(params.amountTotal)}</p>

    <h2 style="font-size: 16px; color: #111827; margin: 24px 0 8px;">ข้อมูลลูกค้า</h2>
    <p><strong>ชื่อ:</strong> ${escapeHtml(params.customerName || "Customer")}</p>
    <p><strong>อีเมล:</strong> ${escapeHtml(params.customerEmail || "-")}</p>

    <h2 style="font-size: 16px; color: #111827; margin: 24px 0 8px;">ที่อยู่จัดส่ง</h2>
    <p style="white-space: pre-wrap;">${escapeHtml(formatShippingForEmail(params.shipping))}</p>

    <h2 style="font-size: 16px; color: #111827; margin: 24px 0 8px;">รายการสินค้า</h2>
    <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
      <thead>
        <tr>
          <th style="padding: 10px; text-align: left; border-bottom: 2px solid #c7d2fe;">สินค้า</th>
          <th style="padding: 10px; text-align: center; border-bottom: 2px solid #c7d2fe;">จำนวน</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #c7d2fe;">ราคา/ชิ้น</th>
          <th style="padding: 10px; text-align: right; border-bottom: 2px solid #c7d2fe;">รวม</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

/** Send thank-you invoice to customer + notification to company inbox (idempotent). */
export async function sendPaidOrderNotifications(
  supabaseAdmin: SupabaseClient,
  sessionId: string,
  orderRow: OrderRow,
) {
  const customerEmail = (orderRow.customer_email as string | null) ?? undefined;
  const customerName = (orderRow.customer_name as string | null) || "Customer";
  const items = (orderRow.items as InvoiceItem[]) || [];
  const totalAmount = Number(orderRow.amount_total ?? 0);
  const taxAmount = 0;
  const shipping = (orderRow.shipping as Record<string, unknown> | null) ?? undefined;
  const metadata = ((orderRow.metadata as Record<string, unknown> | null) ?? {});

  if (customerEmail && !orderRow.invoice_sent_at) {
    try {
      const invoiceHtml = generateInvoiceHTML({
        orderId: String(orderRow.id),
        customerName,
        customerEmail,
        items,
        subtotal: totalAmount - taxAmount,
        taxAmount,
        totalAmount,
        referenceNo: sessionId,
        date: new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        shipping,
      });

      const customerEmailResult = await sendEmail({
        to: customerEmail,
        subject: `ขอบคุณสำหรับการสั่งซื้อ #${sessionId} - Pluto`,
        html: invoiceHtml,
      });
      if (!customerEmailResult.success) {
        throw new Error(customerEmailResult.message || "Customer email was not sent");
      }

      await supabaseAdmin
        .from("orders")
        .update({
          invoice_email: customerEmail,
          invoice_sent_at: new Date().toISOString(),
        })
        .eq("id", orderRow.id);
    } catch (e) {
      console.error("Failed to auto-send customer invoice:", e);
    }
  }

  if (!metadata.order_paid_email_sent_at) {
    try {
      const inbox =
        Deno.env.get("ORDER_NOTIFICATION_EMAIL")?.trim() ||
        Deno.env.get("CONTACT_TO_EMAIL")?.trim() ||
        DEFAULT_ORDER_INBOX;
      const companyHtml = generateCompanyOrderEmailHTML({
        sessionId,
        orderId: String(orderRow.id),
        customerName,
        customerEmail: customerEmail ?? "",
        amountTotal: totalAmount,
        currency: String(orderRow.currency ?? "thb"),
        items,
        shipping,
      });

      const companyEmailResult = await sendEmail({
        to: inbox,
        subject: `[Pluto] มีการสั่งซื้อและชำระเงินแล้ว #${sessionId}`,
        html: companyHtml,
        replyTo: customerEmail,
      });
      if (!companyEmailResult.success) {
        throw new Error(companyEmailResult.message || "Company email was not sent");
      }

      await supabaseAdmin
        .from("orders")
        .update({
          metadata: {
            ...metadata,
            order_paid_email_sent_at: new Date().toISOString(),
            order_paid_email_to: inbox,
          },
        })
        .eq("id", orderRow.id);
    } catch (e) {
      console.error("Failed to send company paid-order notification:", e);
    }
  }
}
