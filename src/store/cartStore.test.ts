import { beforeEach, describe, expect, it } from "vitest";
import { BUNDLE_PRICES, STRUCTURE_PRICE } from "@/lib/products";
import { useCartStore } from "./cartStore";

// ─── Reset store before each test ─────────────────────────────────────────────
beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

// ─── addItem ──────────────────────────────────────────────────────────────────
describe("addItem", () => {
  it("adds a new item to the cart", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("assigns the correct price when adding a structure", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    expect(useCartStore.getState().items[0]?.unitPrice).toBe(STRUCTURE_PRICE);
  });

  it("assigns the correct price when adding a bundle", () => {
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });
    expect(useCartStore.getState().items[0]?.unitPrice).toBe(BUNDLE_PRICES["160x80"]);
  });

  it("increments quantity if the same item is added twice", () => {
    const config = { type: "estructura" as const, structureColor: "negro" as const };
    useCartStore.getState().addItem(config);
    useCartStore.getState().addItem(config);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it("adds different items as separate entries", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().addItem({ type: "tabla", tableSize: "120x60", tableColor: "hickory" });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("opens the cart when an item is added", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    expect(useCartStore.getState().isOpen).toBe(true);
  });
});

// ─── removeItem ───────────────────────────────────────────────────────────────
describe("removeItem", () => {
  it("removes the item from the cart", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().removeItem(items[0]!.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("does not throw if the id does not exist", () => {
    expect(() => useCartStore.getState().removeItem("non-existent-id")).not.toThrow();
  });
});

// ─── updateQuantity ───────────────────────────────────────────────────────────
describe("updateQuantity", () => {
  it("updates quantity correctly", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().updateQuantity(items[0]!.id, 5);
    expect(useCartStore.getState().items[0]!.quantity).toBe(5);
  });

  it("removes the item if quantity is set to 0", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().updateQuantity(items[0]!.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes the item if quantity is negative", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().updateQuantity(items[0]!.id, -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────
describe("clearCart", () => {
  it("empties all items from the cart", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().addItem({ type: "tabla", tableSize: "120x60", tableColor: "hickory" });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ─── toggleCart / openCart / closeCart ───────────────────────────────────────
describe("cart visibility controls", () => {
  it("openCart opens the cart", () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("closeCart closes the cart", () => {
    useCartStore.setState({ isOpen: true });
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("toggleCart alternates the state", () => {
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});
