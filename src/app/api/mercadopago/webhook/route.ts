import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MercadoPago envía notificaciones de tipo "payment"
    if (body.type === "payment") {
      const paymentId = body.data?.id;
      if (paymentId) {
        const client = getMercadoPagoClient();
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        console.log(
          `[Webhook] Pago ${paymentId} — Status: ${paymentData.status} — Referencia: ${paymentData.external_reference}`
        );

        // TODO: Guardar el pedido en DB (Prisma + PostgreSQL) cuando
        // paymentData.status === "approved"
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Webhook error]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
