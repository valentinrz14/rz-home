import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CartItem, CartItemConfig } from "@/types";
import { STRUCTURE_PRICE, TABLE_PRICES, BUNDLE_PRICES } from "./products";

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

export function getProductPrice(config: CartItemConfig): number {
  if (config.type === "estructura") {
    return STRUCTURE_PRICE;
  }
  if (config.type === "tabla" && config.tableSize) {
    return TABLE_PRICES[config.tableSize] ?? 0;
  }
  if (config.type === "completo" && config.tableSize) {
    return BUNDLE_PRICES[config.tableSize] ?? 0;
  }
  return 0;
}

export function getProductName(config: CartItemConfig): string {
  const parts: string[] = [];

  if (config.type === "estructura") {
    parts.push("Estructura Standing Desk Doble Motor");
    if (config.structureColor) {
      parts.push(config.structureColor === "blanco" ? "Blanco" : "Negro");
    }
  } else if (config.type === "tabla") {
    parts.push("Tapa de Escritorio Premium");
    if (config.tableSize) parts.push(config.tableSize + " cm");
  } else if (config.type === "completo") {
    parts.push("Standing Desk Completo");
    if (config.tableSize) parts.push(config.tableSize + " cm");
    if (config.structureColor) {
      parts.push(
        "Estructura " +
          (config.structureColor === "blanco" ? "Blanca" : "Negra")
      );
    }
  }

  return parts.join(" — ");
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function generateCartItemId(config: CartItemConfig): string {
  return [
    config.type,
    config.structureColor ?? "",
    config.tableSize ?? "",
    config.tableColor ?? "",
  ]
    .filter(Boolean)
    .join("-");
}
