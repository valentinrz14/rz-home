import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CartItem, CartItemConfig, TABLE_SIZE } from "@/types";
import type { PriceTier, SimplePriceTier } from "./prices";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_SIMPLE,
  BUNDLE_PRICES_SIMPLE_MP,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_SIMPLE,
  STRUCTURE_PRICE_SIMPLE_MP,
  TABLE_PRICES,
} from "./products";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProductPrice(
  config: CartItemConfig,
  tier?: PriceTier,
  simpleTier?: SimplePriceTier
): number {
  if ((config.motorType ?? "doble") === "simple") {
    const isMP = tier ? tier.structure > STRUCTURE_PRICE : false;
    if (config.type === "estructura") {
      return simpleTier?.structure ?? (isMP ? STRUCTURE_PRICE_SIMPLE_MP : STRUCTURE_PRICE_SIMPLE);
    }
    if (config.type === "tabla" && config.tableSize) {
      const tables = tier?.tables ?? TABLE_PRICES;
      return tables[config.tableSize] ?? 0;
    }
    if (config.type === "completo" && config.tableSize) {
      const s = config.tableSize as typeof TABLE_SIZE.S | typeof TABLE_SIZE.M;
      const bundlePrice = simpleTier?.bundles[s];
      if (bundlePrice !== undefined) return bundlePrice;
      return isMP ? (BUNDLE_PRICES_SIMPLE_MP[s] ?? 0) : (BUNDLE_PRICES_SIMPLE[s] ?? 0);
    }
    return 0;
  }

  const structure = tier?.structure ?? STRUCTURE_PRICE;
  const tables = tier?.tables ?? TABLE_PRICES;
  const bundles = tier?.bundles ?? BUNDLE_PRICES;

  if (config.type === "estructura") {
    return structure;
  }
  if (config.type === "tabla" && config.tableSize) {
    return tables[config.tableSize] ?? 0;
  }
  if (config.type === "completo" && config.tableSize) {
    return bundles[config.tableSize] ?? 0;
  }
  return 0;
}

export function getProductName(config: CartItemConfig): string {
  const parts: string[] = [];
  const isSimple = (config.motorType ?? "doble") === "simple";

  if (config.type === "estructura") {
    parts.push(
      isSimple ? "Estructura Standing Desk Motor Simple" : "Estructura Standing Desk Doble Motor"
    );
    if (config.structureColor) {
      parts.push(config.structureColor === "blanco" ? "Blanco" : "Negro");
    }
  } else if (config.type === "tabla") {
    parts.push("Tapa de Escritorio Premium");
    if (config.tableSize) parts.push(`${config.tableSize} cm`);
  } else if (config.type === "completo") {
    parts.push(isSimple ? "Standing Desk Motor Simple" : "Standing Desk Completo");
    if (config.tableSize) parts.push(`${config.tableSize} cm`);
    if (config.structureColor) {
      parts.push(`Estructura ${config.structureColor === "blanco" ? "Blanca" : "Negra"}`);
    }
  }

  return parts.join(" — ");
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function generateCartItemId(config: CartItemConfig): string {
  return [
    config.motorType ?? "doble",
    config.type,
    config.structureColor ?? "",
    config.tableSize ?? "",
    config.tableColor ?? "",
  ]
    .filter(Boolean)
    .join("-");
}
