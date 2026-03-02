import { Preference } from "mercadopago";
import { type NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/env";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import type { MercadoPagoItem } from "@/types";

const IS_LOCAL = SITE_URL.includes("localhost");

interface CreatePreferenceBody {
  items: MercadoPagoItem[];
  payer: {
    name: string;
    surname: string;
    email: string;
    phone: { area_code: string; number: string };
    address: {
      street_name: string;
      street_number: string;
      zip_code: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePreferenceBody = await req.json();
    const { items, payer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay items en el pedido." }, { status: 400 });
    }

    const client = getMercadoPagoClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "ARS",
        })),
        payer,
        // metadata: persiste en el pago y lo usamos en el webhook para reconstruir el email.
        metadata: {
          items: JSON.stringify(
            items.map((item) => ({
              title: item.title,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          ),
          buyer_first_name: payer.name,
          buyer_last_name: payer.surname,
          buyer_phone: `${payer.phone.area_code} ${payer.phone.number}`,
          buyer_address: payer.address.street_name,
          buyer_zip: payer.address.zip_code,
        },
        payment_methods: {
          installments: 12,
          excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
        },
        // MercadoPago rejects localhost URLs — omit back_urls and auto_return in local dev.
        ...(!IS_LOCAL && {
          back_urls: {
            success: `${SITE_URL}/checkout/success`,
            failure: `${SITE_URL}/checkout/failure`,
            pending: `${SITE_URL}/checkout/pending`,
          },
          auto_return: "approved" as const,
        }),
        statement_descriptor: "RZ ROOM",
        external_reference: `rz-room-${Date.now()}`,
        shipments: {
          mode: "not_specified",
        },
      },
    });

    // In local development, use sandbox_init_point so test credentials and
    // test buyer accounts work correctly (avoids "una de las partes es de prueba").
    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
    });
  } catch (err) {
    console.error("MercadoPago preference error:", err);
    return NextResponse.json({ error: "Error al crear la preferencia de pago." }, { status: 500 });
  }
}
