import { beforeEach, describe, it, expect } from "vitest";
import { useCartStore } from "./cartStore";

// ─── Reset store antes de cada test ──────────────────────────────────────────
beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

// ─── addItem ──────────────────────────────────────────────────────────────────
describe("addItem", () => {
  it("agrega un nuevo ítem al carrito", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("asigna el precio correcto al agregar la estructura", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    expect(useCartStore.getState().items[0].unitPrice).toBe(699_000);
  });

  it("asigna el precio correcto al agregar un bundle", () => {
    useCartStore
      .getState()
      .addItem({ type: "completo", tableSize: "160x80", structureColor: "negro", tableColor: "hickory" });
    expect(useCartStore.getState().items[0].unitPrice).toBe(899_000);
  });

  it("incrementa la cantidad si se agrega el mismo ítem dos veces", () => {
    const config = { type: "estructura" as const, structureColor: "negro" as const };
    useCartStore.getState().addItem(config);
    useCartStore.getState().addItem(config);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("agrega ítems distintos como entradas separadas", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore
      .getState()
      .addItem({ type: "tabla", tableSize: "120x60", tableColor: "hickory" });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("abre el carrito al agregar un ítem", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    expect(useCartStore.getState().isOpen).toBe(true);
  });
});

// ─── removeItem ───────────────────────────────────────────────────────────────
describe("removeItem", () => {
  it("elimina el ítem del carrito", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().removeItem(items[0].id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("no falla si el id no existe", () => {
    expect(() => useCartStore.getState().removeItem("id-inexistente")).not.toThrow();
  });
});

// ─── updateQuantity ───────────────────────────────────────────────────────────
describe("updateQuantity", () => {
  it("actualiza la cantidad correctamente", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().updateQuantity(items[0].id, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("elimina el ítem si la cantidad es 0", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().updateQuantity(items[0].id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("elimina el ítem si la cantidad es negativa", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const { items } = useCartStore.getState();
    useCartStore.getState().updateQuantity(items[0].id, -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ─── clearCart ────────────────────────────────────────────────────────────────
describe("clearCart", () => {
  it("vacía todos los ítems del carrito", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore
      .getState()
      .addItem({ type: "tabla", tableSize: "120x60", tableColor: "hickory" });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ─── toggleCart / openCart / closeCart ───────────────────────────────────────
describe("control del carrito", () => {
  it("openCart abre el carrito", () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("closeCart cierra el carrito", () => {
    useCartStore.setState({ isOpen: true });
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("toggleCart alterna el estado", () => {
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});
