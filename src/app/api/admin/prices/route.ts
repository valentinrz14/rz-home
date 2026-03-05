import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { PricesConfig, PriceTier } from "@/lib/prices";
import { savePrices } from "@/lib/prices";

function isValidTier(tier: unknown): tier is PriceTier {
  if (!tier || typeof tier !== "object") return false;
  const t = tier as Record<string, unknown>;
  return typeof t.structure === "number" && !!t.tables && !!t.bundles;
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as PricesConfig;

  if (!isValidTier(body.transfer) || !isValidTier(body.mp_one) || !isValidTier(body.mp_cuotas)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  await savePrices(body);
  return NextResponse.json({ ok: true });
}
