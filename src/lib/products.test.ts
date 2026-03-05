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

// ─── Table colors ─────────────────────────────────────────────────────────────
describe("TABLE_COLORS", () => {
  it("has exactly 6 colors", () => {
    expect(TABLE_COLORS).toHaveLength(6);
  });

  it("each color has a valid id, name and hex", () => {
    TABLE_COLORS.forEach((color) => {
      expect(color.id).toBeTruthy();
      expect(color.name).toBeTruthy();
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("ids are unique", () => {
    const ids = TABLE_COLORS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the hickory color", () => {
    expect(TABLE_COLORS.some((c) => c.id === "hickory")).toBe(true);
  });
});

// ─── Table sizes ──────────────────────────────────────────────────────────────
describe("TABLE_SIZES", () => {
  it("has exactly 3 sizes", () => {
    expect(TABLE_SIZES).toHaveLength(3);
  });

  it("bundle price is always greater than table-only price", () => {
    TABLE_SIZES.forEach((size) => {
      expect(size.bundlePrice).toBeGreaterThan(size.price);
    });
  });

  it("larger tables cost more", () => {
    const prices = TABLE_SIZES.map((s) => s.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]!).toBeGreaterThan(prices[i - 1]!);
    }
  });

  it("each size has positive width and depth", () => {
    TABLE_SIZES.forEach((size) => {
      expect(size.width).toBeGreaterThan(0);
      expect(size.depth).toBeGreaterThan(0);
    });
  });
});

// ─── Structure colors ─────────────────────────────────────────────────────────
describe("STRUCTURE_COLORS", () => {
  it("has exactly 2 colors: white and black", () => {
    expect(STRUCTURE_COLORS).toHaveLength(2);
    const ids = STRUCTURE_COLORS.map((c) => c.id);
    expect(ids).toContain("blanco");
    expect(ids).toContain("negro");
  });
});

// ─── Price consistency ────────────────────────────────────────────────────────
describe("prices", () => {
  it("bundle is greater than or equal to structure + table (may be rounded up)", () => {
    Object.entries(TABLE_PRICES).forEach(([size, tablePrice]) => {
      const bundlePrice = BUNDLE_PRICES[size as TableSize];
      const separatePrice = STRUCTURE_PRICE + tablePrice;
      expect(bundlePrice).toBeGreaterThanOrEqual(separatePrice);
    });
  });

  it("structure costs more than any table alone", () => {
    Object.values(TABLE_PRICES).forEach((tablePrice) => {
      expect(STRUCTURE_PRICE).toBeGreaterThan(tablePrice);
    });
  });

  it("all bundles are cheaper than competitor price ($1,400,000)", () => {
    const COMPETITOR_PRICE = 1_400_000;
    Object.values(BUNDLE_PRICES).forEach((bundlePrice) => {
      expect(bundlePrice).toBeLessThan(COMPETITOR_PRICE);
    });
  });

  it("structure price is positive", () => {
    expect(STRUCTURE_PRICE).toBeGreaterThan(0);
  });
});

// ─── Single motor: available sizes ───────────────────────────────────────────
describe("BUNDLE_PRICES_SIMPLE — sizes", () => {
  it("only has 2 sizes: 120x60 and 140x70 (no 160x80)", () => {
    expect(Object.keys(BUNDLE_PRICES_SIMPLE)).toEqual(["120x60", "140x70"]);
  });

  it("140x70 costs more than 120x60", () => {
    expect(BUNDLE_PRICES_SIMPLE["140x70"]).toBeGreaterThan(BUNDLE_PRICES_SIMPLE["120x60"]);
  });

  it("all prices are positive integers", () => {
    Object.values(BUNDLE_PRICES_SIMPLE).forEach((price) => {
      expect(price).toBeGreaterThan(0);
      expect(Number.isInteger(price)).toBe(true);
    });
  });
});

// ─── Single motor: price invariants vs dual motor ─────────────────────────────
describe("single motor prices vs dual motor", () => {
  it("STRUCTURE_PRICE_SIMPLE is cheaper than STRUCTURE_PRICE", () => {
    expect(STRUCTURE_PRICE_SIMPLE).toBeLessThan(STRUCTURE_PRICE);
  });

  it("single motor bundles are cheaper than dual motor bundles for the same sizes", () => {
    (["120x60", "140x70"] as const).forEach((size) => {
      expect(BUNDLE_PRICES_SIMPLE[size]).toBeLessThan(BUNDLE_PRICES[size]);
    });
  });

  it("STRUCTURE_PRICE_SIMPLE is greater than any dual motor table price", () => {
    Object.values(TABLE_PRICES).forEach((tablePrice) => {
      expect(STRUCTURE_PRICE_SIMPLE).toBeGreaterThan(tablePrice);
    });
  });
});

// ─── Single motor: MercadoPago prices (+2%) ───────────────────────────────────
describe("MercadoPago prices for single motor", () => {
  it("STRUCTURE_PRICE_SIMPLE_MP is exactly 2% more than STRUCTURE_PRICE_SIMPLE", () => {
    const expected = Math.round(STRUCTURE_PRICE_SIMPLE * 1.02);
    expect(STRUCTURE_PRICE_SIMPLE_MP).toBe(expected);
  });

  it("BUNDLE_PRICES_SIMPLE_MP[120x60] is approx. 2% more than transfer price", () => {
    const transfer = BUNDLE_PRICES_SIMPLE["120x60"];
    expect(BUNDLE_PRICES_SIMPLE_MP["120x60"]).toBeGreaterThan(transfer);
    expect(BUNDLE_PRICES_SIMPLE_MP["120x60"]).toBeLessThanOrEqual(Math.ceil(transfer * 1.02) + 1);
  });

  it("BUNDLE_PRICES_SIMPLE_MP[140x70] is approx. 2% more than transfer price", () => {
    const transfer = BUNDLE_PRICES_SIMPLE["140x70"];
    expect(BUNDLE_PRICES_SIMPLE_MP["140x70"]).toBeGreaterThan(transfer);
    expect(BUNDLE_PRICES_SIMPLE_MP["140x70"]).toBeLessThanOrEqual(Math.ceil(transfer * 1.02) + 1);
  });

  it("all MP simple prices are positive integers", () => {
    Object.values(BUNDLE_PRICES_SIMPLE_MP).forEach((price) => {
      expect(price).toBeGreaterThan(0);
      expect(Number.isInteger(price)).toBe(true);
    });
    expect(Number.isInteger(STRUCTURE_PRICE_SIMPLE_MP)).toBe(true);
  });
});
