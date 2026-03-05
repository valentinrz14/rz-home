import { describe, expect, it } from "vitest";
import type { TableSize } from "@/types";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_SIMPLE,
  BUNDLE_PRICES_SIMPLE_MP,
  STRUCTURE_COLORS,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_SIMPLE,
  STRUCTURE_PRICE_SIMPLE_MP,
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
  it("tiene exactamente 3 medidas", () => {
    expect(TABLE_SIZES).toHaveLength(3);
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
  it("el bundle es mayor o igual a estructura + tapa (puede estar redondeado para arriba)", () => {
    Object.entries(TABLE_PRICES).forEach(([size, tablePrice]) => {
      const bundlePrice = BUNDLE_PRICES[size as TableSize];
      const precioPorSeparado = STRUCTURE_PRICE + tablePrice;
      expect(bundlePrice).toBeGreaterThanOrEqual(precioPorSeparado);
    });
  });

  it("la estructura cuesta más que cualquier tapa sola", () => {
    Object.values(TABLE_PRICES).forEach((tablePrice) => {
      expect(STRUCTURE_PRICE).toBeGreaterThan(tablePrice);
    });
  });

  it("todos los bundles son más baratos que la competencia ($1.400.000)", () => {
    const COMPETITOR_PRICE = 1_400_000;
    Object.values(BUNDLE_PRICES).forEach((bundlePrice) => {
      expect(bundlePrice).toBeLessThan(COMPETITOR_PRICE);
    });
  });

  it("el precio de la estructura es positivo", () => {
    expect(STRUCTURE_PRICE).toBeGreaterThan(0);
  });
});

// ─── Motor simple: medidas disponibles ────────────────────────────────────────
describe("BUNDLE_PRICES_SIMPLE — medidas", () => {
  it("solo tiene 2 medidas: 120x60 y 140x70 (sin 160x80)", () => {
    expect(Object.keys(BUNDLE_PRICES_SIMPLE)).toEqual(["120x60", "140x70"]);
  });

  it("la medida 140x70 cuesta más que 120x60", () => {
    expect(BUNDLE_PRICES_SIMPLE["140x70"]).toBeGreaterThan(BUNDLE_PRICES_SIMPLE["120x60"]);
  });

  it("todos los precios son positivos e integers", () => {
    Object.values(BUNDLE_PRICES_SIMPLE).forEach((price) => {
      expect(price).toBeGreaterThan(0);
      expect(Number.isInteger(price)).toBe(true);
    });
  });
});

// ─── Motor simple: invariantes de precio vs doble motor ───────────────────────
describe("precios motor simple vs doble motor", () => {
  it("STRUCTURE_PRICE_SIMPLE es más barato que STRUCTURE_PRICE", () => {
    expect(STRUCTURE_PRICE_SIMPLE).toBeLessThan(STRUCTURE_PRICE);
  });

  it("los bundles simple son más baratos que los bundles doble para las mismas medidas", () => {
    (["120x60", "140x70"] as const).forEach((size) => {
      expect(BUNDLE_PRICES_SIMPLE[size]).toBeLessThan(BUNDLE_PRICES[size]);
    });
  });

  it("STRUCTURE_PRICE_SIMPLE es mayor que cualquier tapa doble motor", () => {
    Object.values(TABLE_PRICES).forEach((tablePrice) => {
      expect(STRUCTURE_PRICE_SIMPLE).toBeGreaterThan(tablePrice);
    });
  });
});

// ─── Motor simple: precios MercadoPago (+2%) ──────────────────────────────────
describe("precios MercadoPago motor simple", () => {
  it("STRUCTURE_PRICE_SIMPLE_MP es exactamente 2% más que STRUCTURE_PRICE_SIMPLE", () => {
    const expected = Math.round(STRUCTURE_PRICE_SIMPLE * 1.02);
    expect(STRUCTURE_PRICE_SIMPLE_MP).toBe(expected);
  });

  it("BUNDLE_PRICES_SIMPLE_MP[120x60] es aprox. 2% más que transfer", () => {
    const transfer = BUNDLE_PRICES_SIMPLE["120x60"];
    expect(BUNDLE_PRICES_SIMPLE_MP["120x60"]).toBeGreaterThan(transfer);
    expect(BUNDLE_PRICES_SIMPLE_MP["120x60"]).toBeLessThanOrEqual(Math.ceil(transfer * 1.02) + 1);
  });

  it("BUNDLE_PRICES_SIMPLE_MP[140x70] es aprox. 2% más que transfer", () => {
    const transfer = BUNDLE_PRICES_SIMPLE["140x70"];
    expect(BUNDLE_PRICES_SIMPLE_MP["140x70"]).toBeGreaterThan(transfer);
    expect(BUNDLE_PRICES_SIMPLE_MP["140x70"]).toBeLessThanOrEqual(Math.ceil(transfer * 1.02) + 1);
  });

  it("todos los precios MP simple son positivos e integers", () => {
    Object.values(BUNDLE_PRICES_SIMPLE_MP).forEach((price) => {
      expect(price).toBeGreaterThan(0);
      expect(Number.isInteger(price)).toBe(true);
    });
    expect(Number.isInteger(STRUCTURE_PRICE_SIMPLE_MP)).toBe(true);
  });
});
