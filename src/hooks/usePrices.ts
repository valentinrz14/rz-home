"use client";

import { useEffect, useState } from "react";
import type { PricesConfig } from "@/lib/prices";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_MP,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_MP,
  TABLE_PRICES,
  TABLE_PRICES_MP,
} from "@/lib/products";

const DEFAULT_PRICES: PricesConfig = {
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

export function usePrices(): PricesConfig {
  const [prices, setPrices] = useState<PricesConfig>(DEFAULT_PRICES);

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((data: PricesConfig) => setPrices(data))
      .catch(() => {});
  }, []);

  return prices;
}
