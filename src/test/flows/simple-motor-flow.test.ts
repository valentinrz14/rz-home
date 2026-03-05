/**
 * simple-motor-flow.test.ts
 *
 * End-to-end flows for the Standing Desk Single Motor product:
 * - Transfer and MercadoPago prices
 * - Cart: add, deduplication, totals
 * - Unique IDs: single motor vs dual motor do not collide
 * - Product names
 * - Business invariants specific to single motor
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  BUNDLE_PRICES,
  BUNDLE_PRICES_SIMPLE,
  BUNDLE_PRICES_SIMPLE_MP,
  STRUCTURE_PRICE,
  STRUCTURE_PRICE_SIMPLE,
  STRUCTURE_PRICE_SIMPLE_MP,
  TABLE_COLORS,
  TABLE_PRICES,
} from "@/lib/products";
import { generateCartItemId, getCartTotal, getProductName, getProductPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { CartItemConfig, StructureColor, TableColor } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetCart() {
  useCartStore.setState({ items: [], isOpen: false });
}

function getItems() {
  return useCartStore.getState().items;
}

function addSimpleBundle(
  size: "120x60" | "140x70",
  structureColor: StructureColor = "negro",
  tableColor: TableColor = "hickory"
) {
  useCartStore.getState().addItem({
    type: "completo",
    motorType: "simple",
    tableSize: size,
    structureColor,
    tableColor,
  });
}

function addSimpleStructure(color: StructureColor = "negro") {
  useCartStore
    .getState()
    .addItem({ type: "estructura", motorType: "simple", structureColor: color });
}

function addDualBundle(
  size: "120x60" | "140x70",
  structureColor: StructureColor = "negro",
  tableColor: TableColor = "hickory"
) {
  useCartStore
    .getState()
    .addItem({ type: "completo", motorType: "doble", tableSize: size, structureColor, tableColor });
}

// ─── Reset ────────────────────────────────────────────────────────────────────

beforeEach(resetCart);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TRANSFER PRICES
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductPrice — single motor (transfer)", () => {
  it("single motor structure has STRUCTURE_PRICE_SIMPLE price", () => {
    expect(getProductPrice({ type: "estructura", motorType: "simple" })).toBe(
      STRUCTURE_PRICE_SIMPLE
    );
  });

  it("single motor structure is cheaper than dual motor", () => {
    const simple = getProductPrice({ type: "estructura", motorType: "simple" });
    const dual = getProductPrice({ type: "estructura", motorType: "doble" });
    expect(simple).toBeLessThan(dual);
  });

  it("120x60 single motor bundle has correct price", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" })).toBe(
      BUNDLE_PRICES_SIMPLE["120x60"]
    );
  });

  it("140x70 single motor bundle has correct price", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "140x70" })).toBe(
      BUNDLE_PRICES_SIMPLE["140x70"]
    );
  });

  it("single motor table has the same price as dual motor (shared tables)", () => {
    const sizes: Array<"120x60" | "140x70"> = ["120x60", "140x70"];
    sizes.forEach((size) => {
      expect(getProductPrice({ type: "tabla", motorType: "simple", tableSize: size })).toBe(
        TABLE_PRICES[size]
      );
    });
  });

  it("returns 0 for single motor bundle without size", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple" })).toBe(0);
  });

  it("price does not change with different structure or table colors", () => {
    const structureColors: StructureColor[] = ["negro", "blanco"];
    const tableColors: TableColor[] = ["hickory", "negro", "blanco"];
    structureColors.forEach((sc) => {
      tableColors.forEach((tc) => {
        expect(
          getProductPrice({
            type: "completo",
            motorType: "simple",
            tableSize: "140x70",
            structureColor: sc,
            tableColor: tc,
          })
        ).toBe(BUNDLE_PRICES_SIMPLE["140x70"]);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MERCADOPAGO PRICES
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductPrice — single motor (MercadoPago)", () => {
  const mpTier = {
    structure: STRUCTURE_PRICE + 1,
    tables: TABLE_PRICES,
    bundles: BUNDLE_PRICES,
  };

  it("single motor structure with MP tier returns STRUCTURE_PRICE_SIMPLE_MP", () => {
    expect(getProductPrice({ type: "estructura", motorType: "simple" }, mpTier)).toBe(
      STRUCTURE_PRICE_SIMPLE_MP
    );
  });

  it("STRUCTURE_PRICE_SIMPLE_MP is greater than STRUCTURE_PRICE_SIMPLE", () => {
    expect(STRUCTURE_PRICE_SIMPLE_MP).toBeGreaterThan(STRUCTURE_PRICE_SIMPLE);
  });

  it("120x60 single motor bundle with MP tier returns correct MP price", () => {
    expect(
      getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" }, mpTier)
    ).toBe(BUNDLE_PRICES_SIMPLE_MP["120x60"]);
  });

  it("140x70 single motor bundle with MP tier returns correct MP price", () => {
    expect(
      getProductPrice({ type: "completo", motorType: "simple", tableSize: "140x70" }, mpTier)
    ).toBe(BUNDLE_PRICES_SIMPLE_MP["140x70"]);
  });

  it("single motor MP price is always greater than transfer price", () => {
    expect(STRUCTURE_PRICE_SIMPLE_MP).toBeGreaterThan(STRUCTURE_PRICE_SIMPLE);
    expect(BUNDLE_PRICES_SIMPLE_MP["120x60"]).toBeGreaterThan(BUNDLE_PRICES_SIMPLE["120x60"]);
    expect(BUNDLE_PRICES_SIMPLE_MP["140x70"]).toBeGreaterThan(BUNDLE_PRICES_SIMPLE["140x70"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PRODUCT NAMES
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductName — single motor", () => {
  it("single motor structure contains 'Motor Simple'", () => {
    const name = getProductName({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("Negro");
  });

  it("single motor bundle contains 'Motor Simple' and the size", () => {
    const name = getProductName({
      type: "completo",
      motorType: "simple",
      tableSize: "120x60",
      structureColor: "blanco",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("120x60");
    expect(name).toContain("Blanca");
  });

  it("single motor name is different from dual motor name", () => {
    const simple = getProductName({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    const dual = getProductName({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(simple).not.toBe(dual);
  });

  it("table name is the same for both motor types", () => {
    const withSimple = getProductName({ type: "tabla", motorType: "simple", tableSize: "140x70" });
    const withDual = getProductName({ type: "tabla", motorType: "doble", tableSize: "140x70" });
    expect(withSimple).toBe(withDual);
  });

  it("names are non-empty strings for all valid single motor configs", () => {
    const configs: CartItemConfig[] = [
      { type: "estructura", motorType: "simple", structureColor: "negro" },
      { type: "estructura", motorType: "simple", structureColor: "blanco" },
      { type: "tabla", motorType: "simple", tableSize: "120x60", tableColor: "hickory" },
      { type: "tabla", motorType: "simple", tableSize: "140x70", tableColor: "negro" },
      {
        type: "completo",
        motorType: "simple",
        tableSize: "120x60",
        structureColor: "negro",
        tableColor: "nogal",
      },
      {
        type: "completo",
        motorType: "simple",
        tableSize: "140x70",
        structureColor: "blanco",
        tableColor: "blanco",
      },
    ];
    configs.forEach((config) => {
      expect(getProductName(config).length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. UNIQUE IDs: SINGLE MOTOR ≠ DUAL MOTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("generateCartItemId — single motor vs dual motor", () => {
  it("single motor structure and dual motor structure have different IDs", () => {
    const simple = generateCartItemId({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    const dual = generateCartItemId({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(simple).not.toBe(dual);
  });

  it("120x60 single and dual bundles have different IDs", () => {
    const simple = generateCartItemId({
      type: "completo",
      motorType: "simple",
      tableSize: "120x60",
      structureColor: "negro",
      tableColor: "hickory",
    });
    const dual = generateCartItemId({
      type: "completo",
      motorType: "doble",
      tableSize: "120x60",
      structureColor: "negro",
      tableColor: "hickory",
    });
    expect(simple).not.toBe(dual);
  });

  it("same single motor config always generates the same ID", () => {
    const config: CartItemConfig = {
      type: "completo",
      motorType: "simple",
      tableSize: "140x70",
      structureColor: "negro",
      tableColor: "hickory",
    };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("config without motorType and with motorType='doble' generate the same ID", () => {
    const withoutMotor = generateCartItemId({ type: "estructura", structureColor: "negro" });
    const withDual = generateCartItemId({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(withoutMotor).toBe(withDual);
  });

  it("IDs of all single motor configs are unique among themselves", () => {
    const configs: CartItemConfig[] = [
      { type: "estructura", motorType: "simple", structureColor: "negro" },
      { type: "estructura", motorType: "simple", structureColor: "blanco" },
      {
        type: "completo",
        motorType: "simple",
        tableSize: "120x60",
        structureColor: "negro",
        tableColor: "hickory",
      },
      {
        type: "completo",
        motorType: "simple",
        tableSize: "120x60",
        structureColor: "blanco",
        tableColor: "hickory",
      },
      {
        type: "completo",
        motorType: "simple",
        tableSize: "140x70",
        structureColor: "negro",
        tableColor: "hickory",
      },
      {
        type: "completo",
        motorType: "simple",
        tableSize: "140x70",
        structureColor: "negro",
        tableColor: "negro",
      },
    ];
    const ids = configs.map(generateCartItemId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CART WITH SINGLE MOTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("cart — single motor products", () => {
  it("adds single motor structure with correct price", () => {
    addSimpleStructure("negro");
    const items = getItems();
    expect(items).toHaveLength(1);
    expect(items[0]!.unitPrice).toBe(STRUCTURE_PRICE_SIMPLE);
    expect(items[0]!.config.motorType).toBe("simple");
  });

  it("adds single motor 120x60 bundle with correct price", () => {
    addSimpleBundle("120x60");
    const item = getItems()[0]!;
    expect(item.unitPrice).toBe(BUNDLE_PRICES_SIMPLE["120x60"]);
  });

  it("adds single motor 140x70 bundle with correct price", () => {
    addSimpleBundle("140x70");
    const item = getItems()[0]!;
    expect(item.unitPrice).toBe(BUNDLE_PRICES_SIMPLE["140x70"]);
  });

  it("adding the same single motor bundle 3 times → 1 item with quantity 3", () => {
    addSimpleBundle("120x60");
    addSimpleBundle("120x60");
    addSimpleBundle("120x60");
    const items = getItems();
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(3);
  });

  it("all table colors create distinct items for single motor", () => {
    TABLE_COLORS.forEach((color) => {
      useCartStore.getState().addItem({
        type: "completo",
        motorType: "simple",
        tableSize: "120x60",
        structureColor: "negro",
        tableColor: color.id as TableColor,
      });
    });
    expect(getItems()).toHaveLength(TABLE_COLORS.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. MIXED CART: SINGLE MOTOR + DUAL MOTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("mixed cart — single motor and dual motor together", () => {
  it("single and dual bundles of the same size are separate items", () => {
    addSimpleBundle("120x60");
    addDualBundle("120x60");
    expect(getItems()).toHaveLength(2);
  });

  it("mixed cart total is correct", () => {
    addSimpleBundle("120x60");
    addDualBundle("120x60");
    const expected = BUNDLE_PRICES_SIMPLE["120x60"] + BUNDLE_PRICES["120x60"];
    expect(getCartTotal(getItems())).toBe(expected);
  });

  it("single and dual structures are separate items", () => {
    addSimpleStructure("negro");
    useCartStore
      .getState()
      .addItem({ type: "estructura", motorType: "doble", structureColor: "negro" });
    expect(getItems()).toHaveLength(2);
  });

  it("full cart with 4 different products calculates correct total", () => {
    addSimpleBundle("120x60");
    addSimpleBundle("140x70");
    addDualBundle("120x60");
    addSimpleStructure();

    const expected =
      BUNDLE_PRICES_SIMPLE["120x60"] +
      BUNDLE_PRICES_SIMPLE["140x70"] +
      BUNDLE_PRICES["120x60"] +
      STRUCTURE_PRICE_SIMPLE;

    expect(getItems()).toHaveLength(4);
    expect(getCartTotal(getItems())).toBe(expected);
  });

  it("single motor is always cheaper than dual motor for the same size", () => {
    addSimpleBundle("120x60");
    addDualBundle("120x60");
    const items = getItems();
    const simple = items.find((i) => i.config.motorType === "simple")!;
    const dual = items.find((i) => i.config.motorType === "doble")!;
    expect(simple.unitPrice).toBeLessThan(dual.unitPrice);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. BUSINESS INVARIANTS — SINGLE MOTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("business invariants — single motor", () => {
  it("single motor bundle is greater than or equal to simple structure + table (by size)", () => {
    (["120x60", "140x70"] as const).forEach((size) => {
      const bundle = BUNDLE_PRICES_SIMPLE[size];
      const separate = STRUCTURE_PRICE_SIMPLE + TABLE_PRICES[size];
      expect(bundle).toBeGreaterThanOrEqual(separate);
    });
  });

  it("cart price matches catalog", () => {
    addSimpleStructure("negro");
    addSimpleBundle("120x60", "negro", "hickory");
    useCartStore
      .getState()
      .addItem({ type: "tabla", motorType: "simple", tableSize: "140x70", tableColor: "hickory" });

    const items = getItems();
    const structure = items.find((i) => i.config.type === "estructura")!;
    const bundle = items.find((i) => i.config.type === "completo")!;
    const table = items.find((i) => i.config.type === "tabla")!;

    expect(structure.unitPrice).toBe(STRUCTURE_PRICE_SIMPLE);
    expect(bundle.unitPrice).toBe(BUNDLE_PRICES_SIMPLE["120x60"]);
    expect(table.unitPrice).toBe(TABLE_PRICES["140x70"]);
  });

  it("cart total scales linearly with quantity for single motor", () => {
    addSimpleBundle("140x70");
    const itemId = getItems()[0]!.id;
    const unitPrice = BUNDLE_PRICES_SIMPLE["140x70"];

    for (let qty = 1; qty <= 5; qty++) {
      useCartStore.getState().updateQuantity(itemId, qty);
      expect(getCartTotal(getItems())).toBe(unitPrice * qty);
    }
  });
});
