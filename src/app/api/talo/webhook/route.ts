import { createHmac } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import type { OrderEmailData } from "@/lib/email";
import { sendNewOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { getTaloWebhookSecret } from "@/lib/env";

// TODO: ajustar la verificación de firma según la documentación de Talo
function verifyTaloSignature(req: NextRequest, rawBody: string): boolean {
  const secret = getTaloWebhookSecret();
  if (!secret) return true; // modo desarrollo: sin secreto configurado

  // TODO: usar el header correcto de Talo para la firma
  const signature = req.headers.get("x-talo-signature") ?? req.headers.get("x-signature") ?? "";
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

/** Talo hace un GET para validar la URL del webhook */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const signatureOk = verifyTaloSignature(req, rawBody);
    if (!signatureOk) {
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }

    // TODO: ajustar la estructura del payload según la documentación de Talo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = JSON.parse(rawBody);

    // Solo procesar pagos aprobados
    // TODO: ajustar los campos según la respuesta real de Talo
    const status = body.status ?? body.payment_status ?? body.state;
    if (status !== "approved" && status !== "paid" && status !== "completed") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payer = body.payer ?? body.buyer ?? {};
    const orderData: OrderEmailData = {
      buyerEmail: payer.email ?? "",
      buyerName: payer.name?.split(" ")[0] ?? payer.first_name ?? "",
      buyerLastName: payer.name?.split(" ").slice(1).join(" ") ?? payer.last_name ?? "",
      buyerPhone: payer.phone ?? undefined,
      buyerAddress: payer.address ?? undefined,
      postalCode: payer.zip_code ?? undefined,
      items: (body.items ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => ({
          title: item.title ?? item.description ?? "Producto",
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price ?? item.amount) || 0,
        })
      ),
      totalAmount: Number(body.amount ?? body.total_amount) || 0,
      paymentId: String(body.id ?? body.payment_id ?? ""),
      externalReference: body.external_reference ?? undefined,
    };

    await Promise.allSettled([
      sendOrderConfirmationEmail(orderData),
      sendNewOrderNotificationEmail(orderData),
    ]);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    // Siempre retornar 200 para evitar reintentos infinitos
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
