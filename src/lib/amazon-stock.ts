import { Redis } from "@upstash/redis";

const STOCK_KEY = "stock:status";
const OVERRIDES_KEY = "stock:overrides";
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

/**
 * Manual overrides set from the admin panel.
 * null  → use scraped value (auto)
 * true  → force in stock
 * false → force out of stock
 */
export interface StockOverrides {
  doble_negro: boolean | null;
  doble_blanco: boolean | null;
  simple_negro: boolean | null;
}

export const OVERRIDES_DEFAULT: StockOverrides = {
  doble_negro: null,
  doble_blanco: null,
  simple_negro: null,
};

// ─── Amazon ASINs ─────────────────────────────────────────────────────────────

const AMAZON_URLS = {
  simpleNegro: "https://www.amazon.com/-/es/dp/B0DL589QC3?th=1",
  dobleNegro: "https://www.amazon.com/-/es/dp/B0DL58KZWN?th=1",
  dobleBlanco: "https://www.amazon.com/-/es/dp/B0DL59HC2G",
};

// ─── Scraper ──────────────────────────────────────────────────────────────────

async function fetchAmazonStock(url: string): Promise<boolean | null> {
  if (!url) return null;

  const key = process.env.SCRAPER_API_KEY;
  const fetchUrl = `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(url)}&country_code=us`;

  try {
    const res = await fetch(fetchUrl, { cache: "no-store" });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract the availability section
    const availMatch = html.match(/<div[^>]+id="availability"[^>]*>([\s\S]*?)<\/div>/i);
    const availText = availMatch?.[1] ?? html;

    const outOfStock =
      /no sabemos si este producto volverá a estar disponible|we don't know when or if this item will be back in stock|actualmente no disponible|no disponible|sin existencias|currently unavailable|out of stock|temporalmente no disponible/i.test(
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

/** Merges manual overrides on top of a scraped status (override wins when not null). */
function applyOverrides(status: StockStatus, overrides: StockOverrides): StockStatus {
  return {
    ...status,
    doble: {
      negro: overrides.doble_negro !== null ? overrides.doble_negro : status.doble.negro,
      blanco: overrides.doble_blanco !== null ? overrides.doble_blanco : status.doble.blanco,
    },
    simple: {
      negro: overrides.simple_negro !== null ? overrides.simple_negro : status.simple.negro,
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetches Amazon pages and stores the result in Redis. Called by the cron job. */
export async function refreshStock(): Promise<StockStatus> {
  const [simpleNegro, dobleNegro, dobleBlanco] = await Promise.all([
    fetchAmazonStock(AMAZON_URLS.simpleNegro),
    fetchAmazonStock(AMAZON_URLS.dobleNegro),
    fetchAmazonStock(AMAZON_URLS.dobleBlanco),
  ]);

  const scraped: StockStatus = {
    lastChecked: new Date().toISOString(),
    simple: { negro: simpleNegro },
    doble: { negro: dobleNegro, blanco: dobleBlanco },
  };

  try {
    const redis = getRedis();
    await redis.set(STOCK_KEY, scraped, { ex: CACHE_TTL_SECONDS });
  } catch {
    // Redis unavailable (e.g. local dev without credentials) — continue
  }

  return scraped;
}

/** Returns the last known stock status from Redis with overrides applied. */
export async function getStock(): Promise<StockStatus> {
  try {
    const redis = getRedis();
    const [cached, overrides] = await Promise.all([
      redis.get<StockStatus>(STOCK_KEY),
      redis.get<StockOverrides>(OVERRIDES_KEY),
    ]);
    const status = cached ?? STOCK_DEFAULT;
    return applyOverrides(status, overrides ?? OVERRIDES_DEFAULT);
  } catch {
    // Redis unavailable
  }
  return STOCK_DEFAULT;
}

/** Returns the current manual overrides from Redis. */
export async function getStockOverrides(): Promise<StockOverrides> {
  try {
    const overrides = await getRedis().get<StockOverrides>(OVERRIDES_KEY);
    return { ...OVERRIDES_DEFAULT, ...overrides };
  } catch {
    return OVERRIDES_DEFAULT;
  }
}

/** Persists a single override. Pass null to remove (revert to auto/scraped). */
export async function setStockOverride(
  variant: keyof StockOverrides,
  value: boolean | null
): Promise<void> {
  const redis = getRedis();
  const current = await getStockOverrides();
  await redis.set(OVERRIDES_KEY, { ...current, [variant]: value });
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
