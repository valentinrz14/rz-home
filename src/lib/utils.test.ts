import { describe, expect, it } from "vitest";
import type { TableSize } from "@/types";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_SIMPLE,
  BUNDLE_PRICES_SIMPLE_MP,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_SIMPLE,
  STRUCTURE_PRICE_SIMPLE_MP,
  TABLE_PRICES,
} from "./products";
import {
  formatPrice,
  generateCartItemId,
  getCartTotal,
  getProductName,
  getProductPrice,
} from "./utils";

// ─── formatPrice ──────────────────────────────────────────────────────────────
describe("formatPrice", () => {
  it("formats in ARS with $ symbol", () => {
    const result = formatPrice(799_000);
    expect(result).toContain("$");
    expect(result).toContain("799");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });

  it("does not include decimals", () => {
    const result = formatPrice(149_000);
    expect(result).not.toMatch(/[.,]\d{2}$/);
  });
});

// ─── getProductPrice ──────────────────────────────────────────────────────────
describe("getProductPrice", () => {
  it("returns structure price", () => {
    expect(getProductPrice({ type: "estructura" })).toBe(STRUCTURE_PRICE);
  });

  it("returns table price by size", () => {
    expect(getProductPrice({ type: "tabla", tableSize: "120x60" })).toBe(TABLE_PRICES["120x60"]);
    expect(getProductPrice({ type: "tabla", tableSize: "140x70" })).toBe(TABLE_PRICES["140x70"]);
    expect(getProductPrice({ type: "tabla", tableSize: "160x80" })).toBe(TABLE_PRICES["160x80"]);
  });

  it("returns bundle price by size", () => {
    expect(getProductPrice({ type: "completo", tableSize: "120x60" })).toBe(
      BUNDLE_PRICES["120x60"]
    );
    expect(getProductPrice({ type: "completo", tableSize: "160x80" })).toBe(
      BUNDLE_PRICES["160x80"]
    );
  });

  it("returns 0 if size is missing", () => {
    expect(getProductPrice({ type: "tabla" })).toBe(0);
    expect(getProductPrice({ type: "completo" })).toBe(0);
  });
});

// ─── getProductPrice — single motor ───────────────────────────────────────────
describe("getProductPrice (single motor)", () => {
  it("returns STRUCTURE_PRICE_SIMPLE for structure without tier", () => {
    expect(getProductPrice({ type: "estructura", motorType: "simple" })).toBe(
      STRUCTURE_PRICE_SIMPLE
    );
  });

  it("returns STRUCTURE_PRICE_SIMPLE_MP when tier is MP", () => {
    const mpTier = {
      structure: STRUCTURE_PRICE + 1,
      tables: TABLE_PRICES,
      bundles: BUNDLE_PRICES,
    };
    expect(getProductPrice({ type: "estructura", motorType: "simple" }, mpTier)).toBe(
      STRUCTURE_PRICE_SIMPLE_MP
    );
  });

  it("returns correct bundle price for 120x60 (transfer)", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" })).toBe(
      BUNDLE_PRICES_SIMPLE["120x60"]
    );
  });

  it("returns correct bundle price for 140x70 (transfer)", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "140x70" })).toBe(
      BUNDLE_PRICES_SIMPLE["140x70"]
    );
  });

  it("returns correct MP bundle price for 120x60", () => {
    const mpTier = {
      structure: STRUCTURE_PRICE + 1,
      tables: TABLE_PRICES,
      bundles: BUNDLE_PRICES,
    };
    expect(
      getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" }, mpTier)
    ).toBe(BUNDLE_PRICES_SIMPLE_MP["120x60"]);
  });

  it("returns same table price as dual motor", () => {
    expect(getProductPrice({ type: "tabla", motorType: "simple", tableSize: "120x60" })).toBe(
      TABLE_PRICES["120x60"]
    );
  });

  it("returns 0 if size is missing in simple bundle", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple" })).toBe(0);
  });
});

// ─── getProductName ───────────────────────────────────────────────────────────
describe("getProductName", () => {
  it("includes 'Estructura' and color for structure type", () => {
    const name = getProductName({ type: "estructura", structureColor: "negro" });
    expect(name).toContain("Estructura");
    expect(name).toContain("Negro");
  });

  it("includes size for table type", () => {
    const name = getProductName({ type: "tabla", tableSize: "160x80" });
    expect(name).toContain("Tapa");
    expect(name).toContain("160x80");
  });

  it("includes size and structure color for bundle", () => {
    const name = getProductName({
      type: "completo",
      tableSize: "160x80",
      structureColor: "blanco",
    });
    expect(name).toContain("Standing Desk Completo");
    expect(name).toContain("160x80");
    expect(name).toContain("Blanca");
  });
});

// ─── getProductName — single motor ────────────────────────────────────────────
describe("getProductName (single motor)", () => {
  it("includes 'Motor Simple' in structure name", () => {
    const name = getProductName({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("Negro");
  });

  it("includes 'Motor Simple' in bundle name", () => {
    const name = getProductName({
      type: "completo",
      motorType: "simple",
      tableSize: "120x60",
      structureColor: "negro",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("120x60");
  });

  it("does NOT include 'Motor Simple' when motorType is doble", () => {
    const name = getProductName({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(name).not.toContain("Motor Simple");
    expect(name).toContain("Doble Motor");
  });
});

// ─── getCartTotal ─────────────────────────────────────────────────────────────
describe("getCartTotal", () => {
  it("calculates the correct total", () => {
    const items = [
      {
        id: "1",
        config: { type: "estructura" as const },
        unitPrice: 520_000,
        quantity: 1,
        name: "Estructura",
      },
      {
        id: "2",
        config: { type: "tabla" as const, tableSize: "120x60" as TableSize },
        unitPrice: 149_000,
        quantity: 2,
        name: "Tapa",
      },
    ];
    expect(getCartTotal(items)).toBe(520_000 + 149_000 * 2);
  });

  it("returns 0 for empty cart", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("respects quantity of each item", () => {
    const items = [
      {
        id: "1",
        config: { type: "completo" as const, tableSize: "160x80" as TableSize },
        unitPrice: 680_000,
        quantity: 3,
        name: "Completo",
      },
    ];
    expect(getCartTotal(items)).toBe(680_000 * 3);
  });
});

// ─── generateCartItemId ───────────────────────────────────────────────────────
describe("generateCartItemId", () => {
  it("generates different ids for different configurations", () => {
    const id1 = generateCartItemId({ type: "estructura", structureColor: "negro" });
    const id2 = generateCartItemId({ type: "estructura", structureColor: "blanco" });
    expect(id1).not.toBe(id2);
  });

  it("generates the same id for the same configuration", () => {
    const config = {
      type: "completo" as const,
      tableSize: "160x80" as TableSize,
      structureColor: "negro" as const,
    };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("id includes the product type", () => {
    const id = generateCartItemId({ type: "estructura", structureColor: "negro" });
    expect(id).toContain("estructura");
  });
});
