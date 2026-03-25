import { type NextRequest, NextResponse } from "next/server";
import { createWebhookHandler } from "talo-pay";
import type { OrderEmailData } from "@/lib/email";
import { sendNewOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { getTaloCredentials, getTaloEnvironment } from "@/lib/env";

/** Talo hace un GET para validar la URL del webhook */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const creds = getTaloCredentials();

    const handler = createWebhookHandler(
      {
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        userId: creds.userId,
        environment: getTaloEnvironment(),
      },
      {
        onPaymentUpdated: async ({ event, payment }) => {
          // Solo procesar pagos exitosos
          if (payment.payment_status !== "SUCCESS") return;

          const clientData = (payment as Record<string, unknown>).client_data as
            | { first_name?: string; last_name?: string; email?: string; phone?: string }
            | undefined;

          const price = (payment as Record<string, unknown>).price as
            | { amount?: number }
            | undefined;

          const motive = (payment as Record<string, unknown>).motive as string | undefined;

          const orderData: OrderEmailData = {
            buyerEmail: clientData?.email ?? "",
            buyerName: clientData?.first_name ?? "",
            buyerLastName: clientData?.last_name ?? "",
            buyerPhone: clientData?.phone ?? undefined,
            items: [],
            totalAmount: price?.amount ?? 0,
            paymentId: event.paymentId,
            externalReference: event.externalId ?? undefined,
          };

          // Parsear items del motive (formato: "Item1 x1, Item2 x2")
          if (motive) {
            orderData.items = motive.split(", ").map((part) => {
              const match = part.match(/^(.+?)\s+x(\d+)$/);
              return {
                title: (match ? match[1] : part) ?? "Producto",
                quantity: match ? Number(match[2]) : 1,
                unit_price: 0,
              };
            });
          }

          await Promise.allSettled([
            sendOrderConfirmationEmail(orderData),
            sendNewOrderNotificationEmail(orderData),
          ]);
        },
      }
    );

    // El handler del SDK espera un Request estándar (WinterCG compatible)
    const response = await handler(req as unknown as Request);
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch {
    // Siempre retornar 200 para evitar reintentos infinitos
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
