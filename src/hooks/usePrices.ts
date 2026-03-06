"use client";

import { useEffect, useState } from "react";
import type { PricesConfig } from "@/lib/prices";
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
} from "@/lib/products";
import { TABLE_SIZE } from "@/types";

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
