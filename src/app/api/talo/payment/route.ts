import { type NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/env";
import { getTaloClient, getTaloUserId } from "@/lib/talo";

interface TaloPaymentBody {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  externalReference: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: TaloPaymentBody = await req.json();
    const { items, buyer, totalAmount, externalReference } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay items en el pedido." }, { status: 400 });
    }

    const talo = getTaloClient();
    const userId = getTaloUserId();

    const payment = await talo.payments.create({
      user_id: userId,
      price: {
        amount: totalAmount,
        currency: "ARS",
      },
      payment_options: ["transfer"],
      external_id: externalReference,
      webhook_url: `${SITE_URL}/api/talo/webhook`,
      redirect_url: `${SITE_URL}/checkout/success`,
      motive: items.map((i) => `${i.title} x${i.quantity}`).join(", "),
      client_data: {
        first_name: buyer.firstName,
        last_name: buyer.lastName,
        email: buyer.email,
        phone: buyer.phone,
      },
    });

    // payment_url viene en la respuesta pero no está tipado explícitamente
    // (el schema usa .passthrough())
    const paymentAny = payment as Record<string, unknown>;
    const checkoutUrl = paymentAny.payment_url as string | undefined;

    if (!checkoutUrl) {
      // Si no hay payment_url, Talo provee datos de transferencia directamente
      // (CVU/alias en transaction_fields). Devolvemos la data para mostrar en frontend.
      return NextResponse.json({
        paymentId: payment.id,
        transactionFields: payment.transaction_fields,
        quotes: payment.quotes,
      });
    }

    return NextResponse.json({
      checkoutUrl,
      paymentId: payment.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    // Error logged server-side for debugging Talo payment failures

    if (message.includes("Variable de entorno faltante")) {
      return NextResponse.json(
        { error: "El servicio de pago con Talo no está configurado." },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo crear el pago con Talo. Intentá nuevamente." },
      { status: 502 }
    );
  }
}
