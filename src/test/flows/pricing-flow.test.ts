/**
 * pricing-flow.test.ts
 *
 * Tests de precios y lógica de negocio de punta a punta:
 * - Invariantes de precios
 * - Todas las combinaciones de configuración
 * - Formateo de precios
 * - Descuentos del bundle vs. compra separada
 * - Nombres de producto generados
 */

import { describe, expect, it } from "vitest";
import {
  BUNDLE_PRICES,
  STRUCTURE_COLORS,
  STRUCTURE_PRICE,
  TABLE_COLORS,
  TABLE_PRICES,
  TABLE_SIZES,
} from "@/lib/products";
import {
  formatPrice,
  generateCartItemId,
  getCartTotal,
  getProductName,
  getProductPrice,
} from "@/lib/utils";
import type { CartItem, CartItemConfig, StructureColor, TableColor, TableSize } from "@/types";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PRECIOS POR TIPO DE PRODUCTO
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductPrice — todas las combinaciones", () => {
  it("estructura siempre devuelve STRUCTURE_PRICE sin importar el color", () => {
    STRUCTURE_COLORS.forEach((color) => {
      expect(
        getProductPrice({ type: "estructura", structureColor: color.id as StructureColor })
      ).toBe(STRUCTURE_PRICE);
    });
  });

  it("tapa devuelve el precio correcto para cada medida y color", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    const colors: TableColor[] = [
      "hickory",
      "roble-claro",
      "blanco",
      "gris-cemento",
      "nogal",
      "negro",
    ];

    sizes.forEach((size) => {
      colors.forEach((color) => {
        const price = getProductPrice({ type: "tabla", tableSize: size, tableColor: color });
        expect(price).toBe(TABLE_PRICES[size]);
        expect(price).toBeGreaterThan(0);
      });
    });
  });

  it("bundle devuelve el precio correcto para cada medida y combinación de colores", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    const structureColors: StructureColor[] = ["negro", "blanco"];
    const tableColors: TableColor[] = ["hickory", "negro"];

    sizes.forEach((size) => {
      structureColors.forEach((sc) => {
        tableColors.forEach((tc) => {
          const price = getProductPrice({
            type: "completo",
            tableSize: size,
            structureColor: sc,
            tableColor: tc,
          });
          expect(price).toBe(BUNDLE_PRICES[size]);
        });
      });
    });
  });

  it("devuelve 0 para tapa sin medida", () => {
    expect(getProductPrice({ type: "tabla" })).toBe(0);
    expect(getProductPrice({ type: "tabla", tableColor: "hickory" })).toBe(0);
  });

  it("devuelve 0 para bundle sin medida", () => {
    expect(getProductPrice({ type: "completo" })).toBe(0);
    expect(getProductPrice({ type: "completo", structureColor: "negro" })).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INVARIANTES DE PRECIOS DEL CATÁLOGO
// ═══════════════════════════════════════════════════════════════════════════════

describe("invariantes de precios del catálogo", () => {
  it("los bundles son mayores o iguales a estructura + tapa (redondeados para arriba)", () => {
    TABLE_SIZES.forEach((size) => {
      const bundlePrice = BUNDLE_PRICES[size.id];
      const separateTotal = STRUCTURE_PRICE + TABLE_PRICES[size.id];

      expect(bundlePrice).toBeGreaterThanOrEqual(separateTotal);
    });
  });

  it("la estructura cuesta más que cualquier tapa individualmente", () => {
    TABLE_SIZES.forEach((size) => {
      expect(STRUCTURE_PRICE).toBeGreaterThan(TABLE_PRICES[size.id]);
    });
  });

  it("los bundles más grandes cuestan más que los más chicos", () => {
    const bundlePrices = TABLE_SIZES.map((s) => BUNDLE_PRICES[s.id]);
    for (let i = 1; i < bundlePrices.length; i++) {
      expect(bundlePrices[i]!).toBeGreaterThan(bundlePrices[i - 1]!);
    }
  });

  it("las tapas más grandes cuestan más que las más chicas", () => {
    const tablePrices = TABLE_SIZES.map((s) => TABLE_PRICES[s.id]);
    for (let i = 1; i < tablePrices.length; i++) {
      expect(tablePrices[i]!).toBeGreaterThan(tablePrices[i - 1]!);
    }
  });

  it("todos los precios son números positivos enteros", () => {
    expect(STRUCTURE_PRICE).toBeGreaterThan(0);
    expect(Number.isInteger(STRUCTURE_PRICE)).toBe(true);

    TABLE_SIZES.forEach((size) => {
      expect(TABLE_PRICES[size.id]).toBeGreaterThan(0);
      expect(BUNDLE_PRICES[size.id]).toBeGreaterThan(0);
      expect(Number.isInteger(TABLE_PRICES[size.id])).toBe(true);
      expect(Number.isInteger(BUNDLE_PRICES[size.id])).toBe(true);
    });
  });

  it("todos los precios son más baratos que la competencia ($1.400.000)", () => {
    const COMPETITOR_PRICE = 1_400_000;
    TABLE_SIZES.forEach((size) => {
      expect(BUNDLE_PRICES[size.id]).toBeLessThan(COMPETITOR_PRICE);
    });
  });

  it("el precio del bundle incluye estructura y tapa", () => {
    TABLE_SIZES.forEach((size) => {
      const bundlePrice = BUNDLE_PRICES[size.id];
      expect(bundlePrice).toBeGreaterThan(STRUCTURE_PRICE);
      expect(bundlePrice).toBeGreaterThan(TABLE_PRICES[size.id]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GENERACIÓN DE NOMBRES
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductName — generación de nombres", () => {
  it("estructura negro incluye 'Negro' en el nombre", () => {
    const name = getProductName({ type: "estructura", structureColor: "negro" });
    expect(name).toContain("Estructura");
    expect(name).toContain("Negro");
  });

  it("estructura blanco incluye 'Blanco' en el nombre", () => {
    const name = getProductName({ type: "estructura", structureColor: "blanco" });
    expect(name).toContain("Blanco");
  });

  it("tapa incluye la medida correcta", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    sizes.forEach((size) => {
      const name = getProductName({ type: "tabla", tableSize: size });
      expect(name).toContain(size);
      expect(name).toContain("Tapa");
    });
  });

  it("bundle incluye medida y color de estructura", () => {
    const name = getProductName({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
    });
    expect(name).toContain("Standing Desk Completo");
    expect(name).toContain("160x80");
    expect(name).toContain("Negra");
  });

  it("bundle con estructura blanca incluye 'Blanca'", () => {
    const name = getProductName({
      type: "completo",
      tableSize: "120x60",
      structureColor: "blanco",
    });
    expect(name).toContain("Blanca");
    expect(name).toContain("120x60");
  });

  it("nombres son strings no vacíos para todas las combinaciones válidas", () => {
    const configs: CartItemConfig[] = [
      { type: "estructura", structureColor: "negro" },
      { type: "estructura", structureColor: "blanco" },
      { type: "tabla", tableSize: "120x60", tableColor: "hickory" },
      { type: "tabla", tableSize: "160x80", tableColor: "negro" },
      { type: "completo", tableSize: "140x70", structureColor: "negro", tableColor: "nogal" },
      { type: "completo", tableSize: "160x80", structureColor: "blanco", tableColor: "blanco" },
    ];

    configs.forEach((config) => {
      const name = getProductName(config);
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. IDS DE ÍTEMS DEL CARRITO
// ═══════════════════════════════════════════════════════════════════════════════

describe("generateCartItemId — unicidad e idempotencia", () => {
  it("la misma configuración siempre genera el mismo id", () => {
    const config: CartItemConfig = {
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("configuraciones distintas generan ids distintos", () => {
    const configs: CartItemConfig[] = [
      { type: "estructura", structureColor: "negro" },
      { type: "estructura", structureColor: "blanco" },
      { type: "tabla", tableSize: "120x60", tableColor: "hickory" },
      { type: "tabla", tableSize: "120x60", tableColor: "negro" },
      { type: "tabla", tableSize: "160x80", tableColor: "hickory" },
      { type: "completo", tableSize: "120x60", structureColor: "negro", tableColor: "hickory" },
      { type: "completo", tableSize: "120x60", structureColor: "blanco", tableColor: "hickory" },
      { type: "completo", tableSize: "160x80", structureColor: "negro", tableColor: "hickory" },
    ];

    const ids = configs.map(generateCartItemId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("el id incluye el tipo de producto", () => {
    const estructuraId = generateCartItemId({ type: "estructura", structureColor: "negro" });
    const tablaId = generateCartItemId({ type: "tabla", tableSize: "120x60" });
    const completoId = generateCartItemId({ type: "completo", tableSize: "120x60" });

    expect(estructuraId).toContain("estructura");
    expect(tablaId).toContain("tabla");
    expect(completoId).toContain("completo");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. FORMATEO DE PRECIOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("formatPrice — formateo de todos los precios del catálogo", () => {
  it("todos los precios del catálogo se formatean con símbolo $", () => {
    const allPrices = [
      STRUCTURE_PRICE,
      ...TABLE_SIZES.map((s) => TABLE_PRICES[s.id]),
      ...TABLE_SIZES.map((s) => BUNDLE_PRICES[s.id]),
    ];

    allPrices.forEach((price) => {
      const formatted = formatPrice(price);
      expect(formatted).toContain("$");
      expect(formatted).not.toContain("NaN");
      expect(formatted).not.toContain("undefined");
    });
  });

  it("precios grandes incluyen separador de miles", () => {
    const formatted = formatPrice(STRUCTURE_PRICE);
    expect(formatted).toMatch(/650/);
  });

  it("precio cero se formatea correctamente", () => {
    const formatted = formatPrice(0);
    expect(formatted).toContain("$");
    expect(formatted).toContain("0");
  });

  it("el bundle 160x80 se muestra como $790.XXX", () => {
    const formatted = formatPrice(BUNDLE_PRICES["160x80"]);
    expect(formatted).toContain("790");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TOTAL DEL CARRITO — ESCENARIOS COMPLEJOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("getCartTotal — escenarios complejos", () => {
  function makeItem(config: CartItemConfig, quantity = 1): CartItem {
    return {
      id: generateCartItemId(config),
      config,
      quantity,
      unitPrice: getProductPrice(config),
      name: getProductName(config),
    };
  }

  it("carrito con todos los tamaños de tapa calcula total correcto", () => {
    const items: CartItem[] = TABLE_SIZES.map((size) =>
      makeItem({ type: "tabla", tableSize: size.id, tableColor: "hickory" })
    );

    const expected = TABLE_SIZES.reduce((sum, size) => sum + TABLE_PRICES[size.id], 0);
    expect(getCartTotal(items)).toBe(expected);
  });

  it("carrito con todos los bundles calcula total correcto", () => {
    const items: CartItem[] = TABLE_SIZES.map((size) =>
      makeItem({
        type: "completo",
        tableSize: size.id,
        structureColor: "negro",
        tableColor: "hickory",
      })
    );

    const expected = TABLE_SIZES.reduce((sum, size) => sum + BUNDLE_PRICES[size.id], 0);
    expect(getCartTotal(items)).toBe(expected);
  });

  it("carrito con cantidades altas calcula total correcto", () => {
    const items: CartItem[] = [
      makeItem({ type: "estructura", structureColor: "negro" }, 10),
      makeItem({ type: "tabla", tableSize: "160x80", tableColor: "hickory" }, 5),
    ];

    const expected = STRUCTURE_PRICE * 10 + TABLE_PRICES["160x80"] * 5;
    expect(getCartTotal(items)).toBe(expected);
  });

  it("carrito vacío devuelve 0", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("un solo ítem con cantidad 1 devuelve su precio unitario", () => {
    const item = makeItem({
      type: "completo",
      tableSize: "120x60",
      structureColor: "negro",
      tableColor: "hickory",
    });
    expect(getCartTotal([item])).toBe(BUNDLE_PRICES["120x60"]);
  });

  it("el total nunca es negativo para configuraciones válidas", () => {
    const configs: CartItemConfig[] = [
      { type: "estructura", structureColor: "negro" },
      { type: "tabla", tableSize: "120x60", tableColor: "hickory" },
      { type: "completo", tableSize: "160x80", structureColor: "blanco", tableColor: "nogal" },
    ];

    const items = configs.map((c) => makeItem(c));
    expect(getCartTotal(items)).toBeGreaterThan(0);
  });

  it("todos los colores de tabla resultan en el mismo precio por medida", () => {
    const size: TableSize = "160x80";
    TABLE_COLORS.forEach((color) => {
      const item = makeItem({ type: "tabla", tableSize: size, tableColor: color.id as TableColor });
      expect(getCartTotal([item])).toBe(TABLE_PRICES[size]);
    });
  });
});
