import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { SITE_URL } from "@/lib/env";
import type { MercadoPagoItem } from "@/types";

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
      return NextResponse.json(
        { error: "No hay items en el pedido." },
        { status: 400 }
      );
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
        payment_methods: {
          installments: 12,
          excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
        },
        back_urls: {
          success: `${SITE_URL}/checkout/success`,
          failure: `${SITE_URL}/checkout/failure`,
          pending: `${SITE_URL}/checkout/pending`,
        },
        auto_return: "approved",
        statement_descriptor: "RZ ROOM",
        external_reference: `rz-room-${Date.now()}`,
        shipments: {
          mode: "not_specified",
        },
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
    });
  } catch (err) {
    console.error("[MercadoPago preference error]", err);
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago." },
      { status: 500 }
    );
  }
}
