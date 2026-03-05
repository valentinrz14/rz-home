import { Redis } from "@upstash/redis";

const STOCK_KEY = "stock:status";
const CACHE_TTL_SECONDS = 60 * 60 * 2; // 2 h — safety net if cron misses

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * null  → couldn't determine (scraping blocked / env var not set)
 * true  → in stock
 * false → out of stock
 */
export interface StockStatus {
  lastChecked: string | null;
  doble: {
    negro: boolean | null;
    blanco: boolean | null;
  };
  simple: {
    negro: boolean | null;
    // No "blanco" — simple motor only comes in negro
  };
}

export const STOCK_DEFAULT: StockStatus = {
  lastChecked: null,
  doble: { negro: null, blanco: null },
  simple: { negro: null },
};

// ─── Amazon URLs (configurable via env) ───────────────────────────────────────

function amazonUrls() {
  return {
    simpleNegro:
      process.env.AMAZON_SIMPLE_NEGRO_URL ?? "https://www.amazon.com/-/es/dp/B0DL589QC3?th=1",
    dobleNegro:
      process.env.AMAZON_DOBLE_NEGRO_URL ?? "https://www.amazon.com/-/es/dp/B0DL58KZWN?th=1",
    // White variant URL — set AMAZON_DOBLE_BLANCO_URL in env with the correct th= value
    dobleBlanco: process.env.AMAZON_DOBLE_BLANCO_URL ?? "",
  };
}

// ─── Scraper ──────────────────────────────────────────────────────────────────

async function fetchAmazonStock(url: string): Promise<boolean | null> {
  if (!url) return null;

  try {
    const res = await fetch(url, {
      // Realistic desktop browser headers to reduce block rate
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      // Disable Next.js fetch cache
      cache: "no-store",
    });

    if (!res.ok) return null;

    const html = await res.text();

    // If Amazon is blocking us (CAPTCHA page or empty response) → unknown
    if (
      html.length < 5_000 ||
      html.includes("api-services-support@amazon.com") ||
      html.includes("Enter the characters you see below") ||
      html.includes("automated access") ||
      html.includes("robot check")
    ) {
      return null;
    }

    // Extract the availability section (most reliable signal)
    const availMatch = html.match(/<div[^>]+id="availability"[^>]*>([\s\S]*?)<\/div>/i);
    const availText = availMatch?.[1] ?? html;

    // "No disponible por el momento. No sabemos si este producto volverá a estar
    // disponible, ni cuándo." — permanently discontinued, check full HTML too
    const discontinuedInHtml =
      /no sabemos si este producto volverá a estar disponible/i.test(html) ||
      /we don't know when or if this item will be back in stock/i.test(html);

    const outOfStock =
      discontinuedInHtml ||
      /actualmente no disponible|no disponible|sin existencias|currently unavailable|out of stock|temporalmente no disponible/i.test(
        availText
      );

    const inStock = /en stock|disponible\.|add to cart|agregar al carrito/i.test(availText);

    if (outOfStock && !inStock) return false;
    if (inStock) return true;

    // No clear signal — treat as unknown
    return null;
  } catch {
    return null;
  }
}

// ─── Redis helpers ────────────────────────────────────────────────────────────

function getRedis() {
  return Redis.fromEnv();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetches Amazon pages and stores the result in Redis. Called by the cron job. */
export async function refreshStock(): Promise<StockStatus> {
  const urls = amazonUrls();

  const [simpleNegro, dobleNegro, dobleBlanco] = await Promise.all([
    fetchAmazonStock(urls.simpleNegro),
    fetchAmazonStock(urls.dobleNegro),
    fetchAmazonStock(urls.dobleBlanco),
  ]);

  const status: StockStatus = {
    lastChecked: new Date().toISOString(),
    simple: { negro: simpleNegro },
    doble: { negro: dobleNegro, blanco: dobleBlanco },
  };

  try {
    await getRedis().set(STOCK_KEY, status, { ex: CACHE_TTL_SECONDS });
  } catch {
    // Redis unavailable (e.g. local dev without credentials) — continue
  }

  return status;
}

/** Returns the last known stock status from Redis, or STOCK_DEFAULT if unavailable. */
export async function getStock(): Promise<StockStatus> {
  try {
    const cached = await getRedis().get<StockStatus>(STOCK_KEY);
    if (cached) return cached;
  } catch {
    // Redis unavailable
  }
  return STOCK_DEFAULT;
}

// ─── Stock check helpers (shared between server and client logic) ─────────────

/** Returns true if the given configuration is known to be out of stock. */
export function isConfigOOS(
  stock: StockStatus | null,
  motorType: "simple" | "doble",
  structureColor: "negro" | "blanco",
  productType: "estructura" | "tabla" | "completo"
): boolean {
  // Tapas are always available (not from Amazon)
  if (productType === "tabla") return false;
  if (!stock) return false;

  if (motorType === "simple") {
    return stock.simple.negro === false;
  }
  return stock.doble[structureColor] === false;
}

/** Returns true if ALL colors of a motor type are known to be out of stock. */
export function isMotorFullyOOS(stock: StockStatus | null, motorType: "simple" | "doble"): boolean {
  if (!stock) return false;
  if (motorType === "simple") return stock.simple.negro === false;
  return stock.doble.negro === false && stock.doble.blanco === false;
}
