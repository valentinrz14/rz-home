import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStockOverrides, type StockOverrides, setStockOverride } from "@/lib/amazon-stock";

export const runtime = "nodejs";

/** GET /api/admin/stock — returns current overrides (admin only) */
export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const overrides = await getStockOverrides();
  return NextResponse.json(overrides);
}

/** PUT /api/admin/stock — set a single override */
export async function PUT(request: Request) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")?.value) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as { variant: keyof StockOverrides; value: boolean | null };

  const validVariants: Array<keyof StockOverrides> = [
    "doble_negro",
    "doble_blanco",
    "simple_negro",
  ];
  if (!validVariants.includes(body.variant)) {
    return NextResponse.json({ error: "Variante inválida." }, { status: 400 });
  }
  if (body.value !== null && typeof body.value !== "boolean") {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }

  await setStockOverride(body.variant, body.value);
  return NextResponse.json({ ok: true });
}
