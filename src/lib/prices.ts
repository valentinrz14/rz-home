import "server-only";
import { Redis } from "@upstash/redis";
import type { TableSize } from "@/types";
import { TABLE_SIZE } from "@/types";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_MP,
  BUNDLE_PRICES_SIMPLE,
  BUNDLE_PRICES_SIMPLE_MP,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_MP,
  STRUCTURE_PRICE_SIMPLE,
  STRUCTURE_PRICE_SIMPLE_MP,
  TABLE_PRICES,
  TABLE_PRICES_MP,
} from "./products";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PriceTier {
  structure: number;
  tables: Record<TableSize, number>;
  bundles: Record<TableSize, number>;
}

/** Motor simple: solo S y M (sin 160×80), sin tapa propia */
export interface SimplePriceTier {
  structure: number;
  bundles: Record<typeof TABLE_SIZE.S | typeof TABLE_SIZE.M, number>;
}

export interface PricesConfig {
  transfer: PriceTier;
  mp_one: PriceTier;
  simple_transfer: SimplePriceTier;
  simple_mp: SimplePriceTier;
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
  simple_transfer: {
    structure: STRUCTURE_PRICE_SIMPLE,
    bundles: {
      [TABLE_SIZE.S]: BUNDLE_PRICES_SIMPLE[TABLE_SIZE.S],
      [TABLE_SIZE.M]: BUNDLE_PRICES_SIMPLE[TABLE_SIZE.M],
    },
  },
  simple_mp: {
    structure: STRUCTURE_PRICE_SIMPLE_MP,
    bundles: {
      [TABLE_SIZE.S]: BUNDLE_PRICES_SIMPLE_MP[TABLE_SIZE.S],
      [TABLE_SIZE.M]: BUNDLE_PRICES_SIMPLE_MP[TABLE_SIZE.M],
    },
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
    if (stored) return { ...DEFAULT_PRICES, ...stored };
  } catch {
    // KV no disponible (ej: entorno local sin credenciales)
  }
  return DEFAULT_PRICES;
}

export async function savePrices(prices: PricesConfig): Promise<void> {
  await getKv().set(KV_KEY, prices);
}
