import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { saveOrder } from "@/lib/kv";
import { getCryptoConversion } from "@/lib/ripio";
import type { PaymentMethod, PendingOrder } from "@/types/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      buyerName,
      buyerLastName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      postalCode,
      items,
      paymentMethod,
      originalAmount,
      finalAmount,
    } = body as Partial<PendingOrder>;

    if (
      !buyerName ||
      !buyerLastName ||
      !buyerEmail ||
      !buyerPhone ||
      !buyerAddress ||
      !postalCode ||
      !items ||
      !paymentMethod ||
      originalAmount == null ||
      finalAmount == null
    ) {
      return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
    }

    const validMethods: PaymentMethod[] = [
      "transfer",
      "crypto_usdt_trc20",
      "crypto_usdt_polygon",
      "crypto_ltc",
    ];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: "Método de pago inválido." }, { status: 400 });
    }

    // Para pagos cripto, guardar la cotización en el momento del pedido
    const isCrypto = paymentMethod.startsWith("crypto_");
    const cryptoConversion =
      isCrypto && finalAmount ? await getCryptoConversion(finalAmount, paymentMethod) : null;

    const id = `rz-${Date.now()}`;
    const order: PendingOrder = {
      id,
      createdAt: new Date().toISOString(),
      status: "pending",
      paymentMethod,
      buyerName,
      buyerLastName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      postalCode,
      items,
      originalAmount,
      finalAmount,
      ...(cryptoConversion && {
        cryptoAmount: cryptoConversion.amount,
        cryptoTicker: cryptoConversion.ticker,
      }),
    };

    await saveOrder(order);

    return NextResponse.json({ orderId: id }, { status: 201 });
  } catch (_err) {
    return NextResponse.json({ error: "Error al guardar la orden." }, { status: 500 });
  }
}
