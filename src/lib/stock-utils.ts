/**
 * Shared stock types and pure helper functions.
 * Safe to import from both Server and Client Components.
 */

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

// ─── Pure helpers (no server deps) ───────────────────────────────────────────

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
