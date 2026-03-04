import { type NextRequest, NextResponse } from "next/server";
import { getCryptoConversion } from "@/lib/ripio";
import type { PaymentMethod } from "@/types/orders";

const VALID_METHODS: PaymentMethod[] = ["crypto_usdt_trc20", "crypto_usdt_polygon", "crypto_ltc"];

export async function GET(req: NextRequest) {
  const method = req.nextUrl.searchParams.get("method") as PaymentMethod;
  const amount = Number(req.nextUrl.searchParams.get("amount") ?? 0);

  if (!method || !VALID_METHODS.includes(method) || !amount || amount <= 0) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const conversion = await getCryptoConversion(amount, method);
  if (!conversion) {
    return NextResponse.json({ error: "No se pudo obtener cotización de Ripio" }, { status: 503 });
  }

  return NextResponse.json(conversion);
}
