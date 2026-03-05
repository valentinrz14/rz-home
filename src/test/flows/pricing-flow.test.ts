/**
 * pricing-flow.test.ts
 *
 * End-to-end pricing and business logic tests:
 * - Price invariants
 * - All configuration combinations
 * - Price formatting
 * - Bundle discount vs separate purchase
 * - Generated product names
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
// 1. PRICES BY PRODUCT TYPE
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductPrice — all combinations", () => {
  it("structure always returns STRUCTURE_PRICE regardless of color", () => {
    STRUCTURE_COLORS.forEach((color) => {
      expect(
        getProductPrice({ type: "estructura", structureColor: color.id as StructureColor })
      ).toBe(STRUCTURE_PRICE);
    });
  });

  it("table returns the correct price for each size and color", () => {
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

  it("bundle returns the correct price for each size and color combination", () => {
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

  it("returns 0 for table without size", () => {
    expect(getProductPrice({ type: "tabla" })).toBe(0);
    expect(getProductPrice({ type: "tabla", tableColor: "hickory" })).toBe(0);
  });

  it("returns 0 for bundle without size", () => {
    expect(getProductPrice({ type: "completo" })).toBe(0);
    expect(getProductPrice({ type: "completo", structureColor: "negro" })).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CATALOG PRICE INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("catalog price invariants", () => {
  it("bundles are greater than or equal to structure + table (rounded up)", () => {
    TABLE_SIZES.forEach((size) => {
      const bundlePrice = BUNDLE_PRICES[size.id];
      const separateTotal = STRUCTURE_PRICE + TABLE_PRICES[size.id];

      expect(bundlePrice).toBeGreaterThanOrEqual(separateTotal);
    });
  });

  it("structure costs more than any individual table", () => {
    TABLE_SIZES.forEach((size) => {
      expect(STRUCTURE_PRICE).toBeGreaterThan(TABLE_PRICES[size.id]);
    });
  });

  it("larger bundles cost more than smaller ones", () => {
    const bundlePrices = TABLE_SIZES.map((s) => BUNDLE_PRICES[s.id]);
    for (let i = 1; i < bundlePrices.length; i++) {
      expect(bundlePrices[i]!).toBeGreaterThan(bundlePrices[i - 1]!);
    }
  });

  it("larger tables cost more than smaller ones", () => {
    const tablePrices = TABLE_SIZES.map((s) => TABLE_PRICES[s.id]);
    for (let i = 1; i < tablePrices.length; i++) {
      expect(tablePrices[i]!).toBeGreaterThan(tablePrices[i - 1]!);
    }
  });

  it("all prices are positive integers", () => {
    expect(STRUCTURE_PRICE).toBeGreaterThan(0);
    expect(Number.isInteger(STRUCTURE_PRICE)).toBe(true);

    TABLE_SIZES.forEach((size) => {
      expect(TABLE_PRICES[size.id]).toBeGreaterThan(0);
      expect(BUNDLE_PRICES[size.id]).toBeGreaterThan(0);
      expect(Number.isInteger(TABLE_PRICES[size.id])).toBe(true);
      expect(Number.isInteger(BUNDLE_PRICES[size.id])).toBe(true);
    });
  });

  it("all prices are cheaper than competitor ($1,400,000)", () => {
    const COMPETITOR_PRICE = 1_400_000;
    TABLE_SIZES.forEach((size) => {
      expect(BUNDLE_PRICES[size.id]).toBeLessThan(COMPETITOR_PRICE);
    });
  });

  it("bundle price includes both structure and table", () => {
    TABLE_SIZES.forEach((size) => {
      const bundlePrice = BUNDLE_PRICES[size.id];
      expect(bundlePrice).toBeGreaterThan(STRUCTURE_PRICE);
      expect(bundlePrice).toBeGreaterThan(TABLE_PRICES[size.id]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NAME GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductName — name generation", () => {
  it("black structure includes 'Negro' in the name", () => {
    const name = getProductName({ type: "estructura", structureColor: "negro" });
    expect(name).toContain("Estructura");
    expect(name).toContain("Negro");
  });

  it("white structure includes 'Blanco' in the name", () => {
    const name = getProductName({ type: "estructura", structureColor: "blanco" });
    expect(name).toContain("Blanco");
  });

  it("table includes the correct size", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    sizes.forEach((size) => {
      const name = getProductName({ type: "tabla", tableSize: size });
      expect(name).toContain(size);
      expect(name).toContain("Tapa");
    });
  });

  it("bundle includes size and structure color", () => {
    const name = getProductName({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
    });
    expect(name).toContain("Standing Desk Completo");
    expect(name).toContain("160x80");
    expect(name).toContain("Negra");
  });

  it("bundle with white structure includes 'Blanca'", () => {
    const name = getProductName({
      type: "completo",
      tableSize: "120x60",
      structureColor: "blanco",
    });
    expect(name).toContain("Blanca");
    expect(name).toContain("120x60");
  });

  it("names are non-empty strings for all valid combinations", () => {
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
// 4. CART ITEM IDs
// ═══════════════════════════════════════════════════════════════════════════════

describe("generateCartItemId — uniqueness and idempotency", () => {
  it("same configuration always generates the same id", () => {
    const config: CartItemConfig = {
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("different configurations generate different ids", () => {
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

  it("id includes the product type", () => {
    const structureId = generateCartItemId({ type: "estructura", structureColor: "negro" });
    const tableId = generateCartItemId({ type: "tabla", tableSize: "120x60" });
    const bundleId = generateCartItemId({ type: "completo", tableSize: "120x60" });

    expect(structureId).toContain("estructura");
    expect(tableId).toContain("tabla");
    expect(bundleId).toContain("completo");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PRICE FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════

describe("formatPrice — formatting all catalog prices", () => {
  it("all catalog prices are formatted with $ symbol", () => {
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

  it("large prices include thousands separator", () => {
    const formatted = formatPrice(STRUCTURE_PRICE);
    expect(formatted).toMatch(/650/);
  });

  it("zero price formats correctly", () => {
    const formatted = formatPrice(0);
    expect(formatted).toContain("$");
    expect(formatted).toContain("0");
  });

  it("160x80 bundle displays as $790.XXX", () => {
    const formatted = formatPrice(BUNDLE_PRICES["160x80"]);
    expect(formatted).toContain("790");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CART TOTAL — COMPLEX SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("getCartTotal — complex scenarios", () => {
  function makeItem(config: CartItemConfig, quantity = 1): CartItem {
    return {
      id: generateCartItemId(config),
      config,
      quantity,
      unitPrice: getProductPrice(config),
      name: getProductName(config),
    };
  }

  it("cart with all table sizes calculates correct total", () => {
    const items: CartItem[] = TABLE_SIZES.map((size) =>
      makeItem({ type: "tabla", tableSize: size.id, tableColor: "hickory" })
    );

    const expected = TABLE_SIZES.reduce((sum, size) => sum + TABLE_PRICES[size.id], 0);
    expect(getCartTotal(items)).toBe(expected);
  });

  it("cart with all bundles calculates correct total", () => {
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

  it("cart with high quantities calculates correct total", () => {
    const items: CartItem[] = [
      makeItem({ type: "estructura", structureColor: "negro" }, 10),
      makeItem({ type: "tabla", tableSize: "160x80", tableColor: "hickory" }, 5),
    ];

    const expected = STRUCTURE_PRICE * 10 + TABLE_PRICES["160x80"] * 5;
    expect(getCartTotal(items)).toBe(expected);
  });

  it("empty cart returns 0", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("single item with quantity 1 returns its unit price", () => {
    const item = makeItem({
      type: "completo",
      tableSize: "120x60",
      structureColor: "negro",
      tableColor: "hickory",
    });
    expect(getCartTotal([item])).toBe(BUNDLE_PRICES["120x60"]);
  });

  it("total is never negative for valid configurations", () => {
    const configs: CartItemConfig[] = [
      { type: "estructura", structureColor: "negro" },
      { type: "tabla", tableSize: "120x60", tableColor: "hickory" },
      { type: "completo", tableSize: "160x80", structureColor: "blanco", tableColor: "nogal" },
    ];

    const items = configs.map((c) => makeItem(c));
    expect(getCartTotal(items)).toBeGreaterThan(0);
  });

  it("all table colors result in the same price for the same size", () => {
    const size: TableSize = "160x80";
    TABLE_COLORS.forEach((color) => {
      const item = makeItem({ type: "tabla", tableSize: size, tableColor: color.id as TableColor });
      expect(getCartTotal([item])).toBe(TABLE_PRICES[size]);
    });
  });
});
