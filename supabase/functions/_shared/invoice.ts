export type InvoiceItem = {
  name: string;
  quantity: number;
  /** unit amount in satang */
  amount: number;
};

export function generateInvoiceHTML(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  referenceNo: string;
  date: string;
  shipping?: Record<string, unknown>;
}): string {
  const shippingHtml = params.shipping
    ? `
      <div class="info-section">
        <h3>ที่อยู่จัดส่ง</h3>
        <p style="white-space: pre-wrap">${escapeHtml(formatShipping(params.shipping))}</p>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${escapeHtml(params.referenceNo)}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .invoice-container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #667eea; }
    .header h1 { color: #667eea; margin-bottom: 10px; }
    .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-section h3 { color: #667eea; margin-bottom: 10px; }
    .info-section p { margin: 5px 0; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #667eea; color: white; }
    .total-section { text-align: right; margin-top: 20px; }
    .total-row { display: flex; justify-content: flex-end; padding: 10px 0; }
    .total-label { width: 200px; font-weight: bold; }
    .total-value { width: 150px; text-align: right; }
    .grand-total { font-size: 24px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px; margin-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>ใบแจ้งหนี้ / Invoice</h1>
      <p>เลขที่อ้างอิง: ${escapeHtml(params.referenceNo)}</p>
    </div>

    <div class="invoice-info">
      <div class="info-section">
        <h3>ข้อมูลลูกค้า</h3>
        <p><strong>ชื่อ:</strong> ${escapeHtml(params.customerName)}</p>
        <p><strong>อีเมล:</strong> ${escapeHtml(params.customerEmail)}</p>
      </div>
      <div class="info-section">
        <h3>ข้อมูลการสั่งซื้อ</h3>
        <p><strong>เลขที่คำสั่งซื้อ:</strong> ${escapeHtml(params.orderId)}</p>
        <p><strong>วันที่:</strong> ${escapeHtml(params.date)}</p>
      </div>
      ${shippingHtml}
    </div>

    <table>
      <thead>
        <tr>
          <th>รายการ</th>
          <th>จำนวน</th>
          <th>ราคาต่อหน่วย</th>
          <th>รวม</th>
        </tr>
      </thead>
      <tbody>
        ${params.items.map((item) => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.quantity}</td>
            <td>฿${(item.amount / 100).toFixed(2)}</td>
            <td>฿${((item.amount * item.quantity) / 100).toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <span class="total-label">ยอดรวมก่อนภาษี:</span>
        <span class="total-value">฿${params.subtotal.toFixed(2)}</span>
      </div>
      ${params.taxAmount > 0 ? `
      <div class="total-row">
        <span class="total-label">ภาษีมูลค่าเพิ่ม (7%):</span>
        <span class="total-value">฿${params.taxAmount.toFixed(2)}</span>
      </div>
      ` : ""}
      <div class="total-row grand-total">
        <span class="total-label">ยอดรวมทั้งสิ้น:</span>
        <span class="total-value">฿${params.totalAmount.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p>ขอบคุณที่ใช้บริการของเรา</p>
      <p>Thank you for your purchase!</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim();

  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not set");
    return { success: false, message: "Email service not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM")?.trim() || "Pluto Store <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Resend API error:", errorData);
    throw new Error(`Resend API error: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  return { success: true, message: "Email sent successfully", emailId: data.id };
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatShipping(shipping: Record<string, unknown>) {
  const parts: string[] = [];
  const get = (k: string) => {
    const v = shipping[k];
    return typeof v === "string" ? v.trim() : "";
  };
  const name = `${get("firstName")} ${get("lastName")}`.trim();
  if (name) parts.push(name);
  const phone = get("phone");
  if (phone) parts.push(`โทร: ${phone}`);
  const email = get("email");
  if (email) parts.push(`อีเมล: ${email}`);

  const addr = [
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
  if (addr.length) parts.push(addr.join(" "));

  return parts.join("\n");
}

