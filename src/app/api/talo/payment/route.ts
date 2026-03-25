import { type NextRequest, NextResponse } from "next/server";
import { getTaloApiKey } from "@/lib/env";
import { SITE_URL } from "@/lib/env";

// TODO: completar con la URL base correcta de la API de Talo
// una vez que tengamos la documentación oficial
const TALO_API_BASE = "https://api.talo.com.ar";

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
  let apiKey: string;
  try {
    apiKey = getTaloApiKey();
  } catch {
    return NextResponse.json(
      { error: "El servicio de pago con Talo no está configurado." },
      { status: 501 }
    );
  }

  try {
    const body: TaloPaymentBody = await req.json();
    const { items, buyer, totalAmount, externalReference } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay items en el pedido." }, { status: 400 });
    }

    // TODO: ajustar el payload y endpoint según la documentación de Talo
    const res = await fetch(`${TALO_API_BASE}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: totalAmount,
        currency: "ARS",
        external_reference: externalReference,
        description: items.map((i) => `${i.title} x${i.quantity}`).join(", "),
        payer: {
          name: `${buyer.firstName} ${buyer.lastName}`,
          email: buyer.email,
          phone: buyer.phone,
        },
        back_urls: {
          success: `${SITE_URL}/checkout/success`,
          failure: `${SITE_URL}/checkout/failure`,
          pending: `${SITE_URL}/checkout/pending`,
        },
        // TODO: agregar webhook_url si Talo lo soporta
        // notification_url: `${SITE_URL}/api/talo/webhook`,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Talo API error ${res.status}: ${err}`);
    }

    // TODO: ajustar los campos del response según la respuesta real de Talo
    const data = await res.json();

    return NextResponse.json({
      checkoutUrl: data.checkout_url ?? data.init_point ?? data.url,
      paymentId: data.id ?? data.payment_id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Talo payment]", message);
    return NextResponse.json(
      { error: "No se pudo crear el pago con Talo. Intentá nuevamente." },
      { status: 502 }
    );
  }
}
