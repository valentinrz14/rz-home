import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { getMpWebhookSecret } from "@/lib/env";

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
    console.warn("[Webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado — omitiendo verificación.");
    return true;
  }

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  // Extraer ts y v1 del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => part.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  // Construir el template que MP firma
  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", webhookSecret)
    .update(template)
    .digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "payment") {
      const dataId = String(body.data?.id ?? "");

      if (!verifyMpSignature(req, dataId)) {
        console.warn("[Webhook] Firma inválida — request rechazado.");
        return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
      }

      if (dataId) {
        const client = getMercadoPagoClient();
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: dataId });

        console.log(
          `[Webhook] Pago ${dataId} — Status: ${paymentData.status} — ` +
            `Referencia: ${paymentData.external_reference}`
        );

        if (paymentData.status === "approved") {
          // TODO: Guardar el pedido en DB cuando esté disponible
          console.log(`[Webhook] ✅ Pago aprobado — ${paymentData.external_reference}`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Webhook error]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
