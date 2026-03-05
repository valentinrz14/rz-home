/**
 * simple-motor-flow.test.ts
 *
 * Flujos de punta a punta para el producto Standing Desk Motor Simple:
 * - Precios transfer y MercadoPago
 * - Carrito: agregar, deduplicar, totales
 * - IDs únicos: motor simple vs doble no colisionan
 * - Nombres de producto
 * - Invariantes de negocio específicos del motor simple
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

function addDobleBundle(
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
// 1. PRECIOS TRANSFER
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductPrice — motor simple (transfer)", () => {
  it("estructura motor simple tiene precio STRUCTURE_PRICE_SIMPLE", () => {
    expect(getProductPrice({ type: "estructura", motorType: "simple" })).toBe(
      STRUCTURE_PRICE_SIMPLE
    );
  });

  it("estructura motor simple es más barata que doble motor", () => {
    const simple = getProductPrice({ type: "estructura", motorType: "simple" });
    const doble = getProductPrice({ type: "estructura", motorType: "doble" });
    expect(simple).toBeLessThan(doble);
  });

  it("bundle 120x60 motor simple tiene precio correcto", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" })).toBe(
      BUNDLE_PRICES_SIMPLE["120x60"]
    );
  });

  it("bundle 140x70 motor simple tiene precio correcto", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "140x70" })).toBe(
      BUNDLE_PRICES_SIMPLE["140x70"]
    );
  });

  it("tapa motor simple tiene el mismo precio que doble motor (tapas compartidas)", () => {
    const sizesPairs: Array<"120x60" | "140x70"> = ["120x60", "140x70"];
    sizesPairs.forEach((size) => {
      expect(getProductPrice({ type: "tabla", motorType: "simple", tableSize: size })).toBe(
        TABLE_PRICES[size]
      );
    });
  });

  it("devuelve 0 para bundle simple sin medida", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple" })).toBe(0);
  });

  it("el precio no cambia con distintos colores de estructura o tapa", () => {
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
// 2. PRECIOS MERCADOPAGO
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductPrice — motor simple (MercadoPago)", () => {
  const mpTier = {
    structure: STRUCTURE_PRICE + 1,
    tables: TABLE_PRICES,
    bundles: BUNDLE_PRICES,
  };

  it("estructura motor simple con tier MP devuelve STRUCTURE_PRICE_SIMPLE_MP", () => {
    expect(getProductPrice({ type: "estructura", motorType: "simple" }, mpTier)).toBe(
      STRUCTURE_PRICE_SIMPLE_MP
    );
  });

  it("STRUCTURE_PRICE_SIMPLE_MP es mayor que STRUCTURE_PRICE_SIMPLE", () => {
    expect(STRUCTURE_PRICE_SIMPLE_MP).toBeGreaterThan(STRUCTURE_PRICE_SIMPLE);
  });

  it("bundle 120x60 motor simple con tier MP devuelve precio MP correcto", () => {
    expect(
      getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" }, mpTier)
    ).toBe(BUNDLE_PRICES_SIMPLE_MP["120x60"]);
  });

  it("bundle 140x70 motor simple con tier MP devuelve precio MP correcto", () => {
    expect(
      getProductPrice({ type: "completo", motorType: "simple", tableSize: "140x70" }, mpTier)
    ).toBe(BUNDLE_PRICES_SIMPLE_MP["140x70"]);
  });

  it("precio MP simple es siempre mayor que precio transfer simple", () => {
    expect(STRUCTURE_PRICE_SIMPLE_MP).toBeGreaterThan(STRUCTURE_PRICE_SIMPLE);
    expect(BUNDLE_PRICES_SIMPLE_MP["120x60"]).toBeGreaterThan(BUNDLE_PRICES_SIMPLE["120x60"]);
    expect(BUNDLE_PRICES_SIMPLE_MP["140x70"]).toBeGreaterThan(BUNDLE_PRICES_SIMPLE["140x70"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NOMBRES DE PRODUCTO
// ═══════════════════════════════════════════════════════════════════════════════

describe("getProductName — motor simple", () => {
  it("estructura motor simple contiene 'Motor Simple'", () => {
    const name = getProductName({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("Negro");
  });

  it("bundle motor simple contiene 'Motor Simple' y la medida", () => {
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

  it("nombre motor simple es distinto al de doble motor", () => {
    const simple = getProductName({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    const doble = getProductName({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(simple).not.toBe(doble);
  });

  it("tapa sigue siendo la misma para ambos motores", () => {
    const conSimple = getProductName({ type: "tabla", motorType: "simple", tableSize: "140x70" });
    const conDoble = getProductName({ type: "tabla", motorType: "doble", tableSize: "140x70" });
    expect(conSimple).toBe(conDoble);
  });

  it("nombres son strings no vacíos para todas las configs válidas de motor simple", () => {
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
// 4. IDs ÚNICOS: MOTOR SIMPLE ≠ DOBLE MOTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("generateCartItemId — motor simple vs doble", () => {
  it("estructura simple y estructura doble tienen IDs distintos", () => {
    const simple = generateCartItemId({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    const doble = generateCartItemId({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(simple).not.toBe(doble);
  });

  it("bundle 120x60 simple y doble tienen IDs distintos", () => {
    const simple = generateCartItemId({
      type: "completo",
      motorType: "simple",
      tableSize: "120x60",
      structureColor: "negro",
      tableColor: "hickory",
    });
    const doble = generateCartItemId({
      type: "completo",
      motorType: "doble",
      tableSize: "120x60",
      structureColor: "negro",
      tableColor: "hickory",
    });
    expect(simple).not.toBe(doble);
  });

  it("la misma config de motor simple siempre genera el mismo ID", () => {
    const config: CartItemConfig = {
      type: "completo",
      motorType: "simple",
      tableSize: "140x70",
      structureColor: "negro",
      tableColor: "hickory",
    };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("config sin motorType y con motorType='doble' generan el mismo ID", () => {
    const sinMotor = generateCartItemId({ type: "estructura", structureColor: "negro" });
    const conDoble = generateCartItemId({
      type: "estructura",
      motorType: "doble",
      structureColor: "negro",
    });
    expect(sinMotor).toBe(conDoble);
  });

  it("IDs de todas las configs de motor simple son únicos entre sí", () => {
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
// 5. CARRITO CON MOTOR SIMPLE
// ═══════════════════════════════════════════════════════════════════════════════

describe("carrito — productos motor simple", () => {
  it("agrega estructura motor simple con precio correcto", () => {
    addSimpleStructure("negro");
    const items = getItems();
    expect(items).toHaveLength(1);
    expect(items[0]!.unitPrice).toBe(STRUCTURE_PRICE_SIMPLE);
    expect(items[0]!.config.motorType).toBe("simple");
  });

  it("agrega bundle simple 120x60 con precio correcto", () => {
    addSimpleBundle("120x60");
    const item = getItems()[0]!;
    expect(item.unitPrice).toBe(BUNDLE_PRICES_SIMPLE["120x60"]);
  });

  it("agrega bundle simple 140x70 con precio correcto", () => {
    addSimpleBundle("140x70");
    const item = getItems()[0]!;
    expect(item.unitPrice).toBe(BUNDLE_PRICES_SIMPLE["140x70"]);
  });

  it("agregar el mismo bundle simple 3 veces → 1 ítem con quantity 3", () => {
    addSimpleBundle("120x60");
    addSimpleBundle("120x60");
    addSimpleBundle("120x60");
    const items = getItems();
    expect(items).toHaveLength(1);
    expect(items[0]!.quantity).toBe(3);
  });

  it("todos los colores de tapa crean ítems distintos para motor simple", () => {
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
// 6. CARRITO MIXTO: MOTOR SIMPLE + DOBLE MOTOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("carrito mixto — motor simple y doble juntos", () => {
  it("bundle simple y doble de la misma medida son ítems distintos", () => {
    addSimpleBundle("120x60");
    addDobleBundle("120x60");
    expect(getItems()).toHaveLength(2);
  });

  it("total del carrito mixto es correcto", () => {
    addSimpleBundle("120x60");
    addDobleBundle("120x60");
    const expected = BUNDLE_PRICES_SIMPLE["120x60"] + BUNDLE_PRICES["120x60"];
    expect(getCartTotal(getItems())).toBe(expected);
  });

  it("estructura simple y doble son ítems distintos", () => {
    addSimpleStructure("negro");
    useCartStore
      .getState()
      .addItem({ type: "estructura", motorType: "doble", structureColor: "negro" });
    expect(getItems()).toHaveLength(2);
  });

  it("carrito completo con 4 productos distintos calcula total correcto", () => {
    addSimpleBundle("120x60");
    addSimpleBundle("140x70");
    addDobleBundle("120x60");
    addSimpleStructure();

    const expected =
      BUNDLE_PRICES_SIMPLE["120x60"] +
      BUNDLE_PRICES_SIMPLE["140x70"] +
      BUNDLE_PRICES["120x60"] +
      STRUCTURE_PRICE_SIMPLE;

    expect(getItems()).toHaveLength(4);
    expect(getCartTotal(getItems())).toBe(expected);
  });

  it("el motor simple siempre es más barato que el doble para la misma medida", () => {
    addSimpleBundle("120x60");
    addDobleBundle("120x60");
    const items = getItems();
    const simple = items.find((i) => i.config.motorType === "simple")!;
    const doble = items.find((i) => i.config.motorType === "doble")!;
    expect(simple.unitPrice).toBeLessThan(doble.unitPrice);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. INVARIANTES DE NEGOCIO — MOTOR SIMPLE
// ═══════════════════════════════════════════════════════════════════════════════

describe("invariantes de negocio — motor simple", () => {
  it("el bundle simple es mayor o igual a estructura simple + tapa (por medida)", () => {
    (["120x60", "140x70"] as const).forEach((size) => {
      const bundle = BUNDLE_PRICES_SIMPLE[size];
      const separate = STRUCTURE_PRICE_SIMPLE + TABLE_PRICES[size];
      expect(bundle).toBeGreaterThanOrEqual(separate);
    });
  });

  it("precio en el carrito coincide con el catálogo", () => {
    addSimpleStructure("negro");
    addSimpleBundle("120x60", "negro", "hickory");
    useCartStore
      .getState()
      .addItem({ type: "tabla", motorType: "simple", tableSize: "140x70", tableColor: "hickory" });

    const items = getItems();
    const estructura = items.find((i) => i.config.type === "estructura")!;
    const bundle = items.find((i) => i.config.type === "completo")!;
    const tabla = items.find((i) => i.config.type === "tabla")!;

    expect(estructura.unitPrice).toBe(STRUCTURE_PRICE_SIMPLE);
    expect(bundle.unitPrice).toBe(BUNDLE_PRICES_SIMPLE["120x60"]);
    expect(tabla.unitPrice).toBe(TABLE_PRICES["140x70"]);
  });

  it("el total del carrito escala linealmente con la cantidad para motor simple", () => {
    addSimpleBundle("140x70");
    const itemId = getItems()[0]!.id;
    const unitPrice = BUNDLE_PRICES_SIMPLE["140x70"];

    for (let qty = 1; qty <= 5; qty++) {
      useCartStore.getState().updateQuantity(itemId, qty);
      expect(getCartTotal(getItems())).toBe(unitPrice * qty);
    }
  });
});
