import { describe, expect, it } from "vitest";
import type { TableSize } from "@/types";
import {
  BUNDLE_PRICES,
  STRUCTURE_COLORS,
  STRUCTURE_PRICE,
  TABLE_COLORS,
  TABLE_PRICES,
  TABLE_SIZES,
} from "./products";

// ─── Colores de tapa ──────────────────────────────────────────────────────────
describe("TABLE_COLORS", () => {
  it("tiene exactamente 6 colores", () => {
    expect(TABLE_COLORS).toHaveLength(6);
  });

  it("cada color tiene id, name y hex válido", () => {
    TABLE_COLORS.forEach((color) => {
      expect(color.id).toBeTruthy();
      expect(color.name).toBeTruthy();
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("los ids son únicos", () => {
    const ids = TABLE_COLORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("incluye el color hickory", () => {
    expect(TABLE_COLORS.some((c) => c.id === "hickory")).toBe(true);
  });
});

// ─── Medidas de tapa ──────────────────────────────────────────────────────────
describe("TABLE_SIZES", () => {
  it("tiene exactamente 4 medidas", () => {
    expect(TABLE_SIZES).toHaveLength(4);
  });

  it("el precio del bundle siempre es mayor que el precio de la tapa sola", () => {
    TABLE_SIZES.forEach((size) => {
      expect(size.bundlePrice).toBeGreaterThan(size.price);
    });
  });

  it("tapas más grandes cuestan más", () => {
    const prices = TABLE_SIZES.map((s) => s.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]!).toBeGreaterThan(prices[i - 1]!);
    }
  });

  it("cada medida tiene ancho y profundidad positivos", () => {
    TABLE_SIZES.forEach((size) => {
      expect(size.width).toBeGreaterThan(0);
      expect(size.depth).toBeGreaterThan(0);
    });
  });
});

// ─── Colores de estructura ────────────────────────────────────────────────────
describe("STRUCTURE_COLORS", () => {
  it("tiene exactamente 2 colores: blanco y negro", () => {
    expect(STRUCTURE_COLORS).toHaveLength(2);
    const ids = STRUCTURE_COLORS.map((c) => c.id);
    expect(ids).toContain("blanco");
    expect(ids).toContain("negro");
  });
});

// ─── Coherencia de precios ────────────────────────────────────────────────────
describe("precios", () => {
  it("el bundle es más barato que comprar por separado", () => {
    Object.entries(TABLE_PRICES).forEach(([size, tablePrice]) => {
      const bundlePrice = BUNDLE_PRICES[size as TableSize];
      const precioPorSeparado = STRUCTURE_PRICE + tablePrice;
      expect(bundlePrice).toBeLessThan(precioPorSeparado);
    });
  });

  it("la estructura cuesta más que cualquier tapa sola", () => {
    Object.values(TABLE_PRICES).forEach((tablePrice) => {
      expect(STRUCTURE_PRICE).toBeGreaterThan(tablePrice);
    });
  });

  it("todos los bundles son más baratos que la competencia ($2.240.000)", () => {
    const COMPETITOR_PRICE = 2_240_000;
    Object.values(BUNDLE_PRICES).forEach((bundlePrice) => {
      expect(bundlePrice).toBeLessThan(COMPETITOR_PRICE);
    });
  });

  it("el precio de la estructura es positivo", () => {
    expect(STRUCTURE_PRICE).toBeGreaterThan(0);
  });
});
