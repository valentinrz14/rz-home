import { createHmac } from "node:crypto";
import { Payment } from "mercadopago";
import { type NextRequest, NextResponse } from "next/server";
import { sendNewOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import type { OrderEmailData } from "@/lib/email";
import { getMpWebhookSecret } from "@/lib/env";
import { getMercadoPagoClient } from "@/lib/mercadopago";

/**
 * Verifica la firma HMAC-SHA256 que MercadoPago adjunta en cada webhook.
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 *
 * Cabeceras que usa MP:
 *   x-signature   → ts=TIMESTAMP,v1=HASH
 *   x-request-id  → ID único del request
 */
function verifyMpSignature(req: NextRequest, dataId: string): boolean {
  const webhookSecret = getMpWebhookSecret();

  // Si no hay secreto configurado, dejamos pasar (modo desarrollo)
  if (!webhookSecret) {
    return true;
  }

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  // Extraer ts y v1 del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => part.split("=") as [string, string])
  );
  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) return false;

  // Construir el template que MP firma
  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", webhookSecret).update(template).digest("hex");

  return expected === v1;
}

// ── Extrae OrderEmailData del objeto de pago de MP ────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOrderEmailData(paymentData: Record<string, any>): OrderEmailData {
  const payer = paymentData.payer ?? {};
  // metadata es guardado por nosotros al crear la preferencia
  const meta = paymentData.metadata ?? {};

  // Parsear items desde metadata (JSON string) o fallback vacío
  let items: OrderEmailData["items"] = [];
  try {
    const raw = typeof meta.items === "string" ? JSON.parse(meta.items) : (meta.items ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items = raw.map((item: any) => ({
      title: item.title ?? "Producto",
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
    }));
  } catch {
    // metadata no disponible — el email se envía igual con total
  }

  const phone = meta.buyer_phone || undefined;
  const buyerAddress = meta.buyer_address || undefined;
  const postalCode = meta.buyer_zip || payer.address?.zip_code || undefined;
  const firstName = meta.buyer_first_name || payer.first_name || "";
  const lastName = meta.buyer_last_name || payer.last_name || "";

  return {
    buyerEmail: payer.email ?? "",
    buyerName: firstName,
    buyerLastName: lastName,
    buyerPhone: phone,
    buyerAddress,
    postalCode,
    items,
    totalAmount: Number(paymentData.transaction_amount) || 0,
    paymentId: paymentData.id ?? "",
    externalReference: paymentData.external_reference ?? undefined,
    installments: paymentData.installments ?? undefined,
    paymentMethod: paymentData.payment_method_id ?? undefined,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "payment") {
      const dataId = String(body.data?.id ?? "");

      if (!verifyMpSignature(req, dataId)) {
        return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
      }

      if (dataId) {
        const client = getMercadoPagoClient();
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: dataId });

        if (paymentData.status === "approved") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const orderData = buildOrderEmailData(paymentData as Record<string, any>);

          // Enviar emails en paralelo — errores no rompen el webhook
          const [buyerResult, ownerResult] = await Promise.allSettled([
            sendOrderConfirmationEmail(orderData),
            sendNewOrderNotificationEmail(orderData),
          ]);

          if (buyerResult.status === "rejected") {
            console.error("Email al comprador falló:", buyerResult.reason);
          }
          if (ownerResult.status === "rejected") {
            console.error("Email al vendedor falló:", ownerResult.reason);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
