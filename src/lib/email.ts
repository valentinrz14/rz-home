import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

// ── Cliente Resend ─────────────────────────────────────────────────────────────

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Variable de entorno faltante: RESEND_API_KEY");
    _resend = new Resend(key);
  }
  return _resend;
}

function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "RZ ROOM <pedidos@rzroom.com.ar>";
}

function getEmailNotify(): string {
  return process.env.EMAIL_NOTIFY ?? "";
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface OrderEmailData {
  buyerEmail: string;
  buyerName: string;
  buyerLastName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  postalCode?: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  totalAmount: number;
  paymentId: string | number;
  externalReference?: string;
  installments?: number;
  paymentMethod?: string;
}

// ── Estilos base del email ─────────────────────────────────────────────────────

const BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
  .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #18181b; padding: 28px 32px; text-align: center; }
  .header-title { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
  .header-sub { color: #a1a1aa; font-size: 14px; margin: 6px 0 0; }
  .body { padding: 32px; }
  .greeting { font-size: 18px; font-weight: 600; color: #18181b; margin: 0 0 8px; }
  .text { font-size: 15px; color: #52525b; line-height: 1.6; margin: 0 0 24px; }
  .badge { display: inline-block; background: #f0fdf4; color: #16a34a; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 99px; border: 1px solid #bbf7d0; margin-bottom: 24px; }
  .section-title { font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  table.items th { font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.04em; padding: 8px 0; text-align: left; border-bottom: 1px solid #e4e4e7; }
  table.items th.right { text-align: right; }
  table.items td { font-size: 14px; color: #27272a; padding: 10px 0; border-bottom: 1px solid #f4f4f5; vertical-align: top; }
  table.items td.right { text-align: right; font-weight: 500; }
  table.items td.muted { color: #71717a; font-size: 13px; }
  .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0 0; margin-top: 4px; border-top: 2px solid #18181b; }
  .total-label { font-size: 16px; font-weight: 700; color: #18181b; }
  .total-amount { font-size: 22px; font-weight: 700; color: #18181b; }
  .info-box { background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
  .info-row { display: flex; gap: 8px; font-size: 14px; color: #52525b; margin-bottom: 6px; }
  .info-row:last-child { margin-bottom: 0; }
  .info-label { font-weight: 600; color: #18181b; min-width: 80px; }
  .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
  .footer { padding: 20px 32px; background: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; }
  .footer-text { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0; }
  .footer-text a { color: #18181b; text-decoration: none; font-weight: 500; }
`;

// ── Template: Confirmación al comprador ────────────────────────────────────────

function buyerConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td>${item.title}</td>
        <td class="right muted">${item.quantity}</td>
        <td class="right">${formatPrice(item.unit_price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const installmentText =
    data.installments && data.installments > 1
      ? `<span style="color:#71717a;font-size:13px;"> (${data.installments} cuotas)</span>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pedido confirmado — RZ ROOM</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="header-title">RZ ROOM</p>
        <p class="header-sub">Escritorios de pie eléctricos</p>
      </div>

      <div class="body">
        <div class="badge">✓ Pago confirmado</div>
        <p class="greeting">¡Gracias por tu compra, ${data.buyerName}!</p>
        <p class="text">
          Tu pedido fue recibido y está siendo procesado. En breve nos ponemos en contacto
          para coordinar el despacho con Andreani.
        </p>

        <p class="section-title">Detalle del pedido</p>
        <table class="items">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="right">Cant.</th>
              <th class="right">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total-row">
          <span class="total-label">Total pagado${installmentText}</span>
          <span class="total-amount">${formatPrice(data.totalAmount)}</span>
        </div>

        <div class="info-box" style="margin-top:24px;">
          <p class="section-title" style="margin-bottom:12px;">Información de entrega</p>
          ${
            data.postalCode
              ? `<div class="info-row"><span class="info-label">Envío:</span> Andreani · CP ${data.postalCode}</div>`
              : ""
          }
          ${
            data.buyerAddress
              ? `<div class="info-row"><span class="info-label">Dirección:</span> ${data.buyerAddress}</div>`
              : ""
          }
          ${
            data.paymentMethod
              ? `<div class="info-row"><span class="info-label">Pago:</span> ${data.paymentMethod}${
                  data.installments && data.installments > 1
                    ? ` en ${data.installments} cuotas`
                    : ""
                }</div>`
              : ""
          }
          <div class="info-row"><span class="info-label">Ref.:</span> ${data.externalReference ?? String(data.paymentId)}</div>
        </div>

        <hr class="divider" />

        <p class="text" style="margin-bottom:0;">
          ¿Tenés alguna duda? Escribinos a
          <a href="mailto:hola@rzroom.com.ar" style="color:#18181b;font-weight:600;">hola@rzroom.com.ar</a>
          o por WhatsApp y te respondemos a la brevedad.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          RZ ROOM · Buenos Aires, Argentina<br />
          <a href="https://rzroom.com.ar">rzroom.com.ar</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Template: Notificación interna (vendedor) ──────────────────────────────────

function ownerNotificationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td>${item.title}</td>
        <td class="right muted">${item.quantity}</td>
        <td class="right">${formatPrice(item.unit_price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Nuevo pedido — RZ ROOM</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="header-title">Nuevo pedido 🛍️</p>
        <p class="header-sub">${formatPrice(data.totalAmount)} · ID ${data.paymentId}</p>
      </div>

      <div class="body">
        <p class="section-title">Datos del comprador</p>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Nombre:</span> ${data.buyerName} ${data.buyerLastName}</div>
          <div class="info-row"><span class="info-label">Email:</span> ${data.buyerEmail}</div>
          ${data.buyerPhone ? `<div class="info-row"><span class="info-label">Teléfono:</span> ${data.buyerPhone}</div>` : ""}
          ${data.buyerAddress ? `<div class="info-row"><span class="info-label">Dirección:</span> ${data.buyerAddress}</div>` : ""}
          ${data.postalCode ? `<div class="info-row"><span class="info-label">CP:</span> ${data.postalCode}</div>` : ""}
        </div>

        <p class="section-title">Productos</p>
        <table class="items">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="right">Cant.</th>
              <th class="right">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total-row">
          <span class="total-label">Total</span>
          <span class="total-amount">${formatPrice(data.totalAmount)}</span>
        </div>

        <div class="info-box" style="margin-top:24px;">
          <div class="info-row"><span class="info-label">Payment ID:</span> ${data.paymentId}</div>
          <div class="info-row"><span class="info-label">Ref.:</span> ${data.externalReference ?? "-"}</div>
          ${data.paymentMethod ? `<div class="info-row"><span class="info-label">Método:</span> ${data.paymentMethod}${data.installments && data.installments > 1 ? ` · ${data.installments} cuotas` : ""}</div>` : ""}
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">RZ ROOM · Panel de ventas</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Funciones públicas ─────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: data.buyerEmail,
    subject: `✅ Pedido confirmado — RZ ROOM`,
    html: buyerConfirmationHtml(data),
  });

  if (error) {
    throw new Error(`Resend error (buyer): ${JSON.stringify(error)}`);
  }
}

export async function sendNewOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  const notifyEmail = getEmailNotify();
  if (!notifyEmail) return; // No configurado, skip silencioso

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: notifyEmail,
    subject: `🛍️ Nuevo pedido — ${data.buyerName} ${data.buyerLastName} · ${formatPrice(data.totalAmount)}`,
    html: ownerNotificationHtml(data),
  });

  if (error) {
    throw new Error(`Resend error (owner): ${JSON.stringify(error)}`);
  }
}
