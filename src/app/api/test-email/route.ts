/**
 * Endpoint de prueba — solo disponible en entorno local.
 * Permite verificar que el envío de emails funciona correctamente.
 *
 * Uso:
 *   curl -X POST http://localhost:3000/api/test-email \
 *     -H "Content-Type: application/json" \
 *     -d '{"to": "tu@email.com"}'
 */

import { type NextRequest, NextResponse } from "next/server";
import { sendNewOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/env";

const IS_LOCAL = SITE_URL.includes("localhost");

export async function POST(req: NextRequest) {
  if (!IS_LOCAL) {
    return NextResponse.json({ error: "Solo disponible en entorno local." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const to: string = body.to ?? "test@example.com";

  const sampleOrder = {
    buyerEmail: to,
    buyerName: "Valentin",
    buyerLastName: "RZ",
    buyerPhone: "11 5555-1234",
    buyerAddress: "Av. Corrientes 1234",
    postalCode: "1043",
    items: [
      { title: "Mesa Escritorio 160×80 — Hickory", quantity: 1, unit_price: 249_000 },
      { title: "Estructura Doble Motor — Negro", quantity: 1, unit_price: 699_000 },
      { title: "Envío Andreani a CP 1043", quantity: 1, unit_price: 8_500 },
    ],
    totalAmount: 956_500,
    paymentId: "TEST-123456789",
    externalReference: "rz-room-test",
    installments: 6,
    paymentMethod: "visa",
  };

  const [buyerResult, ownerResult] = await Promise.allSettled([
    sendOrderConfirmationEmail(sampleOrder),
    sendNewOrderNotificationEmail(sampleOrder),
  ]);

  return NextResponse.json({
    buyer: buyerResult.status === "fulfilled" ? "ok" : String(buyerResult.reason),
    owner: ownerResult.status === "fulfilled" ? "ok (o skip si EMAIL_NOTIFY no está seteado)" : String(ownerResult.reason),
    sentTo: to,
  });
}
