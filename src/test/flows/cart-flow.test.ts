/**
 * cart-flow.test.ts
 *
 * End-to-end cart flows: full purchase cycle,
 * persistence, quantity limits, product combinations.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  BUNDLE_PRICES,
  STRUCTURE_COLORS,
  STRUCTURE_PRICE,
  TABLE_COLORS,
  TABLE_PRICES,
  TABLE_SIZES,
} from "@/lib/products";
import { formatPrice, generateCartItemId, getCartTotal } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { StructureColor, TableColor, TableSize } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetCart() {
  useCartStore.setState({ items: [], isOpen: false });
}

function getItems() {
  return useCartStore.getState().items;
}

function addStructure(color: StructureColor = "negro") {
  useCartStore.getState().addItem({ type: "estructura", structureColor: color });
}

function addTable(size: TableSize, color: TableColor = "hickory") {
  useCartStore.getState().addItem({ type: "tabla", tableSize: size, tableColor: color });
}

function addBundle(
  size: TableSize,
  structureColor: StructureColor = "negro",
  tableColor: TableColor = "hickory"
) {
  useCartStore
    .getState()
    .addItem({ type: "completo", tableSize: size, structureColor, tableColor });
}

// ─── Reset ────────────────────────────────────────────────────────────────────

beforeEach(resetCart);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FULL FLOW: add → update → remove → clear
// ═══════════════════════════════════════════════════════════════════════════════

describe("full cart flow", () => {
  it("adds structure, table and bundle; calculates correct total", () => {
    addStructure("negro");
    addTable("160x80", "nogal");
    addBundle("120x60", "blanco", "blanco");

    const items = getItems();
    expect(items).toHaveLength(3);

    const expected = STRUCTURE_PRICE + TABLE_PRICES["160x80"] + BUNDLE_PRICES["120x60"];
    expect(getCartTotal(items)).toBe(expected);
  });

  it("full cycle: add → update quantity → remove one → clear", () => {
    addStructure();
    addTable("140x70");
    addBundle("160x80");

    expect(getItems()).toHaveLength(3);

    // Update structure quantity to 3
    const structureId = generateCartItemId({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().updateQuantity(structureId, 3);

    let items = getItems();
    const structure = items.find((i) => i.id === structureId)!;
    expect(structure.quantity).toBe(3);
    expect(structure.unitPrice).toBe(STRUCTURE_PRICE);

    // Total includes 3x structure
    const expectedTotal = STRUCTURE_PRICE * 3 + TABLE_PRICES["140x70"] + BUNDLE_PRICES["160x80"];
    expect(getCartTotal(items)).toBe(expectedTotal);

    // Remove the table
    const tableId = generateCartItemId({
      type: "tabla",
      tableSize: "140x70",
      tableColor: "hickory",
    });
    useCartStore.getState().removeItem(tableId);
    items = getItems();
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === tableId)).toBeUndefined();

    // Clear
    useCartStore.getState().clearCart();
    expect(getItems()).toHaveLength(0);
    expect(getCartTotal(getItems())).toBe(0);
  });

  it("isOpen state follows the flow correctly", () => {
    expect(useCartStore.getState().isOpen).toBe(false);

    addStructure();
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);

    addTable("120x60");
    expect(useCartStore.getState().isOpen).toBe(true);

    useCartStore.getState().clearCart();
    // clearCart does not close the cart (user may want to see it is empty)
    // behavior defined by the store
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DEDUPLICATION AND QUANTITIES
// ═══════════════════════════════════════════════════════════════════════════════

describe("deduplication and quantities", () => {
  it("adding the same structure 5 times → 1 item with quantity 5", () => {
    for (let i = 0; i < 5; i++) addStructure("negro");

    const items = getItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(5);
    expect(getCartTotal(items)).toBe(STRUCTURE_PRICE * 5);
  });

  it("structures of different colors → separate items", () => {
    addStructure("negro");
    addStructure("blanco");

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(STRUCTURE_PRICE * 2);
  });

  it("tables of different sizes → separate items", () => {
    addTable("120x60", "hickory");
    addTable("160x80", "hickory");

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(TABLE_PRICES["120x60"] + TABLE_PRICES["160x80"]);
  });

  it("tables of same size but different color → separate items", () => {
    addTable("160x80", "hickory");
    addTable("160x80", "negro");

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(TABLE_PRICES["160x80"] * 2);
  });

  it("updating quantity to 0 removes the item", () => {
    addStructure();
    const id = getItems()[0]!.id;
    useCartStore.getState().updateQuantity(id, 0);
    expect(getItems()).toHaveLength(0);
  });

  it("updating quantity to a negative number removes the item", () => {
    addTable("120x60");
    const id = getItems()[0]!.id;
    useCartStore.getState().updateQuantity(id, -99);
    expect(getItems()).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ALL PRODUCT COMBINATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe("all product combinations", () => {
  it("each table size has correct price in the cart", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    for (const size of sizes) addTable(size);

    const items = getItems();
    expect(items).toHaveLength(sizes.length);

    const expectedTotal = sizes.reduce((sum, size) => sum + TABLE_PRICES[size], 0);
    expect(getCartTotal(items)).toBe(expectedTotal);
  });

  it("all bundles have correct prices in the cart", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    for (const size of sizes) addBundle(size, "negro", "hickory");

    const expectedTotal = sizes.reduce((sum, size) => sum + BUNDLE_PRICES[size], 0);
    expect(getCartTotal(getItems())).toBe(expectedTotal);
  });

  it("mixed cart: structure + all tables + all bundles", () => {
    addStructure("negro");
    addStructure("blanco");

    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    sizes.forEach((size) => {
      addTable(size, "hickory");
      addBundle(size, "negro", "nogal");
    });

    const items = getItems();
    // 2 structures + 3 tables + 3 bundles = 8 items
    expect(items).toHaveLength(8);

    const expectedTotal =
      STRUCTURE_PRICE * 2 +
      sizes.reduce((sum, size) => sum + TABLE_PRICES[size] + BUNDLE_PRICES[size], 0);
    expect(getCartTotal(items)).toBe(expectedTotal);
  });

  it("all table colors create distinct items for the same size", () => {
    for (const color of TABLE_COLORS) addTable("160x80", color.id as TableColor);
    expect(getItems()).toHaveLength(TABLE_COLORS.length);
  });

  it("all structure colors create distinct items", () => {
    for (const color of STRUCTURE_COLORS) addStructure(color.id as StructureColor);
    expect(getItems()).toHaveLength(STRUCTURE_COLORS.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BUSINESS INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("business invariants in the cart", () => {
  it("bundle is greater than or equal to structure + table (rounded up)", () => {
    TABLE_SIZES.forEach((size) => {
      const bundlePrice = BUNDLE_PRICES[size.id];
      const separatePrice = STRUCTURE_PRICE + TABLE_PRICES[size.id];
      expect(bundlePrice).toBeGreaterThanOrEqual(separatePrice);
    });
  });

  it("cart price matches catalog for all product types", () => {
    addStructure("negro");
    addTable("160x80", "hickory");
    addBundle("160x80", "negro", "hickory");

    const items = getItems();
    const structure = items.find((i) => i.config.type === "estructura")!;
    const table = items.find((i) => i.config.type === "tabla")!;
    const bundle = items.find((i) => i.config.type === "completo")!;

    expect(structure.unitPrice).toBe(STRUCTURE_PRICE);
    expect(table.unitPrice).toBe(TABLE_PRICES["160x80"]);
    expect(bundle.unitPrice).toBe(BUNDLE_PRICES["160x80"]);
  });

  it("cart total scales linearly with quantity", () => {
    addStructure();
    const itemId = getItems()[0]!.id;
    const unitPrice = getItems()[0]!.unitPrice;

    for (let qty = 1; qty <= 10; qty++) {
      useCartStore.getState().updateQuantity(itemId, qty);
      expect(getCartTotal(getItems())).toBe(unitPrice * qty);
    }
  });

  it("formatPrice correctly reflects the cart total", () => {
    addBundle("160x80");
    const total = getCartTotal(getItems());
    const formatted = formatPrice(total);
    expect(formatted).toContain("$");
    expect(formatted).toContain("790");
  });

  it("generated name includes type, size and structure color", () => {
    addBundle("160x80", "blanco", "hickory");
    const item = getItems()[0]!;
    expect(item.name).toContain("Standing Desk Completo");
    expect(item.name).toContain("160x80");
    expect(item.name).toContain("Blanca");
  });

  it("removeItem with non-existent id does not throw or modify the cart", () => {
    addStructure();
    addTable("120x60");
    expect(getItems()).toHaveLength(2);

    expect(() => useCartStore.getState().removeItem("id-that-does-not-exist")).not.toThrow();
    expect(getItems()).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PERSISTENCE AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

describe("cart state persistence", () => {
  it("state persists across multiple operations without reset", () => {
    addStructure("negro");
    addTable("120x60", "hickory");
    expect(getItems()).toHaveLength(2);

    // Add more without resetting
    addBundle("160x80", "blanco", "nogal");
    expect(getItems()).toHaveLength(3);

    // Total is correct
    const expected = STRUCTURE_PRICE + TABLE_PRICES["120x60"] + BUNDLE_PRICES["160x80"];
    expect(getCartTotal(getItems())).toBe(expected);
  });

  it("clearCart leaves the cart in a clean initial state", () => {
    addStructure();
    addTable("120x60");
    addBundle("160x80");

    useCartStore.getState().clearCart();

    expect(getItems()).toHaveLength(0);
    expect(getCartTotal(getItems())).toBe(0);
  });

  it("openCart / closeCart do not affect items", () => {
    addStructure();
    addTable("140x70");
    const totalBefore = getCartTotal(getItems());

    useCartStore.getState().openCart();
    useCartStore.getState().closeCart();
    useCartStore.getState().toggleCart();

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(totalBefore);
  });
});
