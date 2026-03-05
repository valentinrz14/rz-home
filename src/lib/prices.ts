import "server-only";
import { Redis } from "@upstash/redis";
import type { TableSize } from "@/types";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_MP,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_MP,
  TABLE_PRICES,
  TABLE_PRICES_MP,
} from "./products";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PriceTier {
  structure: number;
  tables: Record<TableSize, number>;
  bundles: Record<TableSize, number>;
}

export interface PricesConfig {
  transfer: PriceTier;
  mp_one: PriceTier;
  mp_cuotas: PriceTier; // 3 cuotas
  mp_6: PriceTier; // 6 cuotas
}

// ─── Valores por defecto ──────────────────────────────────────────────────────

export const DEFAULT_PRICES: PricesConfig = {
  transfer: {
    structure: STRUCTURE_PRICE,
    tables: { ...TABLE_PRICES },
    bundles: { ...BUNDLE_PRICES },
  },
  mp_one: {
    structure: STRUCTURE_PRICE_MP,
    tables: { ...TABLE_PRICES_MP },
    bundles: { ...BUNDLE_PRICES_MP },
  },
  mp_cuotas: {
    structure: STRUCTURE_PRICE_MP,
    tables: { ...TABLE_PRICES_MP },
    bundles: { ...BUNDLE_PRICES_MP },
  },
  mp_6: {
    structure: STRUCTURE_PRICE_MP,
    tables: { ...TABLE_PRICES_MP },
    bundles: { ...BUNDLE_PRICES_MP },
  },
};

// ─── KV ───────────────────────────────────────────────────────────────────────

const KV_KEY = "config:prices";

function getKv() {
  return Redis.fromEnv();
}

export async function getPrices(): Promise<PricesConfig> {
  try {
    const stored = await getKv().get<PricesConfig>(KV_KEY);
    // Spread DEFAULT_PRICES first so any new tier (e.g. mp_6) added later has a fallback
    if (stored) return { ...DEFAULT_PRICES, ...stored };
  } catch {
    // KV no disponible (ej: entorno local sin credenciales)
  }
  return DEFAULT_PRICES;
}

export async function savePrices(prices: PricesConfig): Promise<void> {
  await getKv().set(KV_KEY, prices);
}
