import { NextResponse } from "next/server";
import { getStock } from "@/lib/amazon-stock";

export const runtime = "nodejs";

/**
 * GET /api/stock
 * Public endpoint — returns the latest stock status from Redis.
 * Cached by CDN/ISR for 5 minutes; client hook re-fetches on mount.
 */
export async function GET() {
  const stock = await getStock();
  return NextResponse.json(stock, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
