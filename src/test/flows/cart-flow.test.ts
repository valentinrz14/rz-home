/**
 * cart-flow.test.ts
 *
 * Flujos de punta a punta del carrito: ciclo completo de compra,
 * persistencia, límites de cantidad, combinaciones de productos.
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
// 1. FLUJO COMPLETO: agregar → actualizar → eliminar → vaciar
// ═══════════════════════════════════════════════════════════════════════════════

describe("flujo completo de carrito", () => {
  it("agrega estructura, tapa y bundle; calcula total correcto", () => {
    addStructure("negro");
    addTable("160x80", "nogal");
    addBundle("120x60", "blanco", "blanco");

    const items = getItems();
    expect(items).toHaveLength(3);

    const expected = STRUCTURE_PRICE + TABLE_PRICES["160x80"] + BUNDLE_PRICES["120x60"];
    expect(getCartTotal(items)).toBe(expected);
  });

  it("ciclo completo: agrega → modifica cantidad → elimina uno → vacía", () => {
    addStructure();
    addTable("140x70");
    addBundle("150x70");

    expect(getItems()).toHaveLength(3);

    // Modificar cantidad de la estructura a 3
    const estructuraId = generateCartItemId({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().updateQuantity(estructuraId, 3);

    let items = getItems();
    const estructura = items.find((i) => i.id === estructuraId)!;
    expect(estructura.quantity).toBe(3);
    expect(estructura.unitPrice).toBe(STRUCTURE_PRICE);

    // Total incluye 3x estructura
    const totalEsperado = STRUCTURE_PRICE * 3 + TABLE_PRICES["140x70"] + BUNDLE_PRICES["150x70"];
    expect(getCartTotal(items)).toBe(totalEsperado);

    // Eliminar la tapa
    const tapaId = generateCartItemId({
      type: "tabla",
      tableSize: "140x70",
      tableColor: "hickory",
    });
    useCartStore.getState().removeItem(tapaId);
    items = getItems();
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.id === tapaId)).toBeUndefined();

    // Vaciar
    useCartStore.getState().clearCart();
    expect(getItems()).toHaveLength(0);
    expect(getCartTotal(getItems())).toBe(0);
  });

  it("estado isOpen sigue el flujo correctamente", () => {
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
    // clearCart no cierra el carrito (el usuario podría querer ver que está vacío)
    // comportamiento definido por el store
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DEDUPLICACIÓN Y CANTIDADES
// ═══════════════════════════════════════════════════════════════════════════════

describe("deduplicación y cantidades", () => {
  it("agregar la misma estructura 5 veces → 1 ítem con quantity 5", () => {
    for (let i = 0; i < 5; i++) addStructure("negro");

    const items = getItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(5);
    expect(getCartTotal(items)).toBe(STRUCTURE_PRICE * 5);
  });

  it("estructuras de distinto color → ítems separados", () => {
    addStructure("negro");
    addStructure("blanco");

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(STRUCTURE_PRICE * 2);
  });

  it("tapas de distinto tamaño → ítems separados", () => {
    addTable("120x60", "hickory");
    addTable("160x80", "hickory");

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(TABLE_PRICES["120x60"] + TABLE_PRICES["160x80"]);
  });

  it("tapas de mismo tamaño pero distinto color → ítems separados", () => {
    addTable("160x80", "hickory");
    addTable("160x80", "negro");

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(TABLE_PRICES["160x80"] * 2);
  });

  it("actualizar cantidad a 0 elimina el ítem", () => {
    addStructure();
    const id = getItems()[0]!.id;
    useCartStore.getState().updateQuantity(id, 0);
    expect(getItems()).toHaveLength(0);
  });

  it("actualizar cantidad a un número negativo elimina el ítem", () => {
    addTable("120x60");
    const id = getItems()[0]!.id;
    useCartStore.getState().updateQuantity(id, -99);
    expect(getItems()).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TODAS LAS COMBINACIONES DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════════════════════

describe("todas las combinaciones de productos", () => {
  it("cada medida de tapa tiene precio correcto en el carrito", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "150x70", "160x80"];
    for (const size of sizes) addTable(size);

    const items = getItems();
    expect(items).toHaveLength(sizes.length);

    const expectedTotal = sizes.reduce((sum, size) => sum + TABLE_PRICES[size], 0);
    expect(getCartTotal(items)).toBe(expectedTotal);
  });

  it("todos los bundles tienen precios correctos en el carrito", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "150x70", "160x80"];
    for (const size of sizes) addBundle(size, "negro", "hickory");

    const expectedTotal = sizes.reduce((sum, size) => sum + BUNDLE_PRICES[size], 0);
    expect(getCartTotal(getItems())).toBe(expectedTotal);
  });

  it("carrito mixto: estructura + todas las tapas + todos los bundles", () => {
    addStructure("negro");
    addStructure("blanco");

    const sizes: TableSize[] = ["120x60", "140x70", "150x70", "160x80"];
    sizes.forEach((size) => {
      addTable(size, "hickory");
      addBundle(size, "negro", "nogal");
    });

    const items = getItems();
    // 2 estructuras + 4 tapas + 4 bundles = 10 ítems
    expect(items).toHaveLength(10);

    const expectedTotal =
      STRUCTURE_PRICE * 2 +
      sizes.reduce((sum, size) => sum + TABLE_PRICES[size] + BUNDLE_PRICES[size], 0);
    expect(getCartTotal(items)).toBe(expectedTotal);
  });

  it("todos los colores de tapa crean ítems distintos para la misma medida", () => {
    for (const color of TABLE_COLORS) addTable("160x80", color.id as TableColor);
    expect(getItems()).toHaveLength(TABLE_COLORS.length);
  });

  it("todos los colores de estructura crean ítems distintos", () => {
    for (const color of STRUCTURE_COLORS) addStructure(color.id as StructureColor);
    expect(getItems()).toHaveLength(STRUCTURE_COLORS.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. INVARIANTES DE NEGOCIO
// ═══════════════════════════════════════════════════════════════════════════════

describe("invariantes de negocio en el carrito", () => {
  it("el bundle siempre es más barato que estructura + tapa por separado", () => {
    TABLE_SIZES.forEach((size) => {
      const bundlePrice = BUNDLE_PRICES[size.id];
      const separatePrice = STRUCTURE_PRICE + TABLE_PRICES[size.id];
      expect(bundlePrice).toBeLessThan(separatePrice);
    });
  });

  it("precio en el carrito coincide con el catálogo para todos los tipos", () => {
    addStructure("negro");
    addTable("160x80", "hickory");
    addBundle("160x80", "negro", "hickory");

    const items = getItems();
    const estructura = items.find((i) => i.config.type === "estructura")!;
    const tabla = items.find((i) => i.config.type === "tabla")!;
    const bundle = items.find((i) => i.config.type === "completo")!;

    expect(estructura.unitPrice).toBe(STRUCTURE_PRICE);
    expect(tabla.unitPrice).toBe(TABLE_PRICES["160x80"]);
    expect(bundle.unitPrice).toBe(BUNDLE_PRICES["160x80"]);
  });

  it("el total del carrito escala linealmente con la cantidad", () => {
    addStructure();
    const itemId = getItems()[0]!.id;
    const unitPrice = getItems()[0]!.unitPrice;

    for (let qty = 1; qty <= 10; qty++) {
      useCartStore.getState().updateQuantity(itemId, qty);
      expect(getCartTotal(getItems())).toBe(unitPrice * qty);
    }
  });

  it("formatPrice refleja correctamente el total del carrito", () => {
    addBundle("160x80");
    const total = getCartTotal(getItems());
    const formatted = formatPrice(total);
    expect(formatted).toContain("$");
    expect(formatted).toContain("899");
  });

  it("nombre generado incluye tipo, medida y color de estructura", () => {
    addBundle("160x80", "blanco", "hickory");
    const item = getItems()[0]!;
    expect(item.name).toContain("Standing Desk Completo");
    expect(item.name).toContain("160x80");
    expect(item.name).toContain("Blanca");
  });

  it("removeItem con id inexistente no lanza error ni modifica el carrito", () => {
    addStructure();
    addTable("120x60");
    expect(getItems()).toHaveLength(2);

    expect(() => useCartStore.getState().removeItem("id-que-no-existe")).not.toThrow();
    expect(getItems()).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PERSISTENCIA Y RESET
// ═══════════════════════════════════════════════════════════════════════════════

describe("persistencia del estado del carrito", () => {
  it("el estado persiste entre múltiples operaciones sin reset", () => {
    addStructure("negro");
    addTable("120x60", "hickory");
    expect(getItems()).toHaveLength(2);

    // Agregar más sin resetear
    addBundle("160x80", "blanco", "nogal");
    expect(getItems()).toHaveLength(3);

    // El total es correcto
    const expected = STRUCTURE_PRICE + TABLE_PRICES["120x60"] + BUNDLE_PRICES["160x80"];
    expect(getCartTotal(getItems())).toBe(expected);
  });

  it("clearCart deja el carrito en estado inicial limpio", () => {
    addStructure();
    addTable("120x60");
    addBundle("160x80");

    useCartStore.getState().clearCart();

    expect(getItems()).toHaveLength(0);
    expect(getCartTotal(getItems())).toBe(0);
  });

  it("openCart / closeCart no afectan los ítems", () => {
    addStructure();
    addTable("140x70");
    const totalAntes = getCartTotal(getItems());

    useCartStore.getState().openCart();
    useCartStore.getState().closeCart();
    useCartStore.getState().toggleCart();

    expect(getItems()).toHaveLength(2);
    expect(getCartTotal(getItems())).toBe(totalAntes);
  });
});
