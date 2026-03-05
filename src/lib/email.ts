import nodemailer from "nodemailer";
import { emailColors as c } from "@/lib/colors";
import { formatPrice } from "@/lib/utils";

// ── Cliente Nodemailer (Gmail SMTP) ───────────────────────────────────────────

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Variables de entorno faltantes: GMAIL_USER y/o GMAIL_APP_PASSWORD");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

function getEmailFrom(): string {
  return process.env.GMAIL_USER ?? "ecomerce.rzhome@gmail.com";
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
  body { margin: 0; padding: 0; background-color: ${c.pageBg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
  .card { background: ${c.cardBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: ${c.headerBg}; padding: 28px 32px; text-align: center; }
  .header-title { color: ${c.headerTitle}; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
  .header-sub { color: ${c.headerSub}; font-size: 14px; margin: 6px 0 0; }
  .body { padding: 32px; }
  .greeting { font-size: 18px; font-weight: 600; color: ${c.heading}; margin: 0 0 8px; }
  .text { font-size: 15px; color: ${c.body}; line-height: 1.6; margin: 0 0 24px; }
  .badge { display: inline-block; background: ${c.successBg}; color: ${c.successText}; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 99px; border: 1px solid ${c.successBorder}; margin-bottom: 24px; }
  .section-title { font-size: 13px; font-weight: 600; color: ${c.sectionTitle}; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; }
  .item-list { margin-bottom: 16px; }
  .item-card { background: ${c.itemCardBg}; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .item-card:last-child { margin-bottom: 0; }
  .item-row { font-size: 14px; color: ${c.body}; margin: 0 0 5px; }
  .item-row:last-child { margin-bottom: 0; }
  .item-row-label { font-weight: 600; color: ${c.label}; }
  .item-row-value { color: ${c.value}; }
  .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0 0; margin-top: 4px; border-top: 2px solid ${c.heading}; }
  .total-label { font-size: 16px; font-weight: 700; color: ${c.heading}; }
  .total-amount { font-size: 22px; font-weight: 700; color: ${c.heading}; }
  .info-box { background: ${c.infoBg}; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
  .info-row { display: flex; gap: 8px; font-size: 14px; color: ${c.body}; margin-bottom: 6px; }
  .info-row:last-child { margin-bottom: 0; }
  .info-label { font-weight: 600; color: ${c.label}; min-width: 80px; }
  .divider { border: none; border-top: 1px solid ${c.divider}; margin: 24px 0; }
  .footer { padding: 20px 32px; background: ${c.footerBg}; border-top: 1px solid ${c.footerBorder}; text-align: center; }
  .footer-text { font-size: 13px; color: ${c.footerText}; line-height: 1.6; margin: 0; }
  .footer-text a { color: ${c.footerLink}; text-decoration: none; font-weight: 500; }
`;

// ── Template: Confirmación al comprador ────────────────────────────────────────

function buyerConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <div class="item-card">
        <p class="item-row"><span class="item-row-label">Producto:</span> <span class="item-row-value">${item.title}</span></p>
        <p class="item-row"><span class="item-row-label">Cantidad:</span> <span class="item-row-value">${item.quantity}</span></p>
        <p class="item-row"><span class="item-row-label">Precio:</span> <span class="item-row-value">${formatPrice(item.unit_price * item.quantity)}</span></p>
      </div>`
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
        <div class="item-list">
          ${itemsHtml}
        </div>
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
          <a href="mailto:ecomerce.rzhome@gmail.com" style="color:#18181b;font-weight:600;">ecomerce.rzhome@gmail.com</a>
          o por WhatsApp y te respondemos a la brevedad.
        </p>
      </div>

      <div class="footer">
        <p class="footer-text">
          RZ ROOM · Buenos Aires, Argentina<br />
          <a href="https://rz-home.vercel.app">rzroom.com.ar</a>
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
      <div class="item-card">
        <p class="item-row"><span class="item-row-label">Producto:</span> <span class="item-row-value">${item.title}</span></p>
        <p class="item-row"><span class="item-row-label">Cantidad:</span> <span class="item-row-value">${item.quantity}</span></p>
        <p class="item-row"><span class="item-row-label">Precio:</span> <span class="item-row-value">${formatPrice(item.unit_price * item.quantity)}</span></p>
      </div>`
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
        <p class="header-title">Nuevo pedido</p>
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
        <div class="item-list">
          ${itemsHtml}
        </div>
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
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"RZ ROOM" <${getEmailFrom()}>`,
    to: data.buyerEmail,
    subject: "Pedido confirmado — RZ ROOM",
    html: buyerConfirmationHtml(data),
  });
}

export async function sendNewOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  const notifyEmail = getEmailNotify();
  if (!notifyEmail) return; // No configurado, skip silencioso

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"RZ ROOM" <${getEmailFrom()}>`,
    to: notifyEmail,
    subject: `Nuevo pedido — ${data.buyerName} ${data.buyerLastName} · ${formatPrice(data.totalAmount)}`,
    html: ownerNotificationHtml(data),
  });
}
