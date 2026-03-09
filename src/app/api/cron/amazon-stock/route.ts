import { type NextRequest, NextResponse } from "next/server";
import { refreshStock } from "@/lib/amazon-stock";

// Run in Node.js runtime (needs fetch + Redis)
export const runtime = "nodejs";
// Give enough time for multiple Amazon fetches
export const maxDuration = 30;

/**
 * GET /api/cron/amazon-stock
 *
 * Called automatically by Vercel Cron once a day at midnight UTC (vercel.json).
 * Protected by the CRON_SECRET that Vercel sends as Authorization header.
 * Can also be triggered manually from the admin panel.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Validate Vercel's automatic CRON_SECRET header (skip in local dev)
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const status = await refreshStock();
  return NextResponse.json({ ok: true, status });
}
