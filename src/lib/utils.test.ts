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
  it("formatea en ARS con símbolo $", () => {
    const result = formatPrice(799_000);
    expect(result).toContain("$");
    expect(result).toContain("799");
  });

  it("formatea cero", () => {
    expect(formatPrice(0)).toContain("0");
  });

  it("no incluye decimales", () => {
    const result = formatPrice(149_000);
    expect(result).not.toMatch(/[.,]\d{2}$/);
  });
});

// ─── getProductPrice ──────────────────────────────────────────────────────────
describe("getProductPrice", () => {
  it("retorna el precio de la estructura", () => {
    expect(getProductPrice({ type: "estructura" })).toBe(STRUCTURE_PRICE);
  });

  it("retorna el precio de la tapa por medida", () => {
    expect(getProductPrice({ type: "tabla", tableSize: "120x60" })).toBe(TABLE_PRICES["120x60"]);
    expect(getProductPrice({ type: "tabla", tableSize: "140x70" })).toBe(TABLE_PRICES["140x70"]);
    expect(getProductPrice({ type: "tabla", tableSize: "160x80" })).toBe(TABLE_PRICES["160x80"]);
  });

  it("retorna el precio del bundle completo por medida", () => {
    expect(getProductPrice({ type: "completo", tableSize: "120x60" })).toBe(
      BUNDLE_PRICES["120x60"]
    );
    expect(getProductPrice({ type: "completo", tableSize: "160x80" })).toBe(
      BUNDLE_PRICES["160x80"]
    );
  });

  it("retorna 0 si falta la medida", () => {
    expect(getProductPrice({ type: "tabla" })).toBe(0);
    expect(getProductPrice({ type: "completo" })).toBe(0);
  });
});

// ─── getProductPrice — motor simple ───────────────────────────────────────────
describe("getProductPrice (motor simple)", () => {
  it("retorna STRUCTURE_PRICE_SIMPLE para estructura sin tier", () => {
    expect(getProductPrice({ type: "estructura", motorType: "simple" })).toBe(
      STRUCTURE_PRICE_SIMPLE
    );
  });

  it("retorna STRUCTURE_PRICE_SIMPLE_MP cuando el tier es MP", () => {
    const mpTier = {
      structure: STRUCTURE_PRICE + 1,
      tables: TABLE_PRICES,
      bundles: BUNDLE_PRICES,
    };
    expect(getProductPrice({ type: "estructura", motorType: "simple" }, mpTier)).toBe(
      STRUCTURE_PRICE_SIMPLE_MP
    );
  });

  it("retorna bundle correcto para 120x60 (transfer)", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" })).toBe(
      BUNDLE_PRICES_SIMPLE["120x60"]
    );
  });

  it("retorna bundle correcto para 140x70 (transfer)", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple", tableSize: "140x70" })).toBe(
      BUNDLE_PRICES_SIMPLE["140x70"]
    );
  });

  it("retorna bundle MP para 120x60", () => {
    const mpTier = {
      structure: STRUCTURE_PRICE + 1,
      tables: TABLE_PRICES,
      bundles: BUNDLE_PRICES,
    };
    expect(
      getProductPrice({ type: "completo", motorType: "simple", tableSize: "120x60" }, mpTier)
    ).toBe(BUNDLE_PRICES_SIMPLE_MP["120x60"]);
  });

  it("retorna precio de tapa igual al doble motor", () => {
    expect(getProductPrice({ type: "tabla", motorType: "simple", tableSize: "120x60" })).toBe(
      TABLE_PRICES["120x60"]
    );
  });

  it("retorna 0 si falta la medida en bundle simple", () => {
    expect(getProductPrice({ type: "completo", motorType: "simple" })).toBe(0);
  });
});

// ─── getProductName ───────────────────────────────────────────────────────────
describe("getProductName", () => {
  it("incluye 'Estructura' y color para tipo estructura", () => {
    const name = getProductName({ type: "estructura", structureColor: "negro" });
    expect(name).toContain("Estructura");
    expect(name).toContain("Negro");
  });

  it("incluye medida para tipo tabla", () => {
    const name = getProductName({ type: "tabla", tableSize: "160x80" });
    expect(name).toContain("Tapa");
    expect(name).toContain("160x80");
  });

  it("incluye medida y color de estructura para completo", () => {
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

// ─── getProductName — motor simple ────────────────────────────────────────────
describe("getProductName (motor simple)", () => {
  it("incluye 'Motor Simple' en nombre de estructura", () => {
    const name = getProductName({
      type: "estructura",
      motorType: "simple",
      structureColor: "negro",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("Negro");
  });

  it("incluye 'Motor Simple' en nombre de bundle", () => {
    const name = getProductName({
      type: "completo",
      motorType: "simple",
      tableSize: "120x60",
      structureColor: "negro",
    });
    expect(name).toContain("Motor Simple");
    expect(name).toContain("120x60");
  });

  it("NO incluye 'Motor Simple' cuando motorType es doble", () => {
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
  it("calcula el total correcto", () => {
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

  it("retorna 0 para carrito vacío", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("respeta la cantidad de cada ítem", () => {
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
  it("genera ids distintos para configuraciones distintas", () => {
    const id1 = generateCartItemId({ type: "estructura", structureColor: "negro" });
    const id2 = generateCartItemId({ type: "estructura", structureColor: "blanco" });
    expect(id1).not.toBe(id2);
  });

  it("genera el mismo id para la misma configuración", () => {
    const config = {
      type: "completo" as const,
      tableSize: "160x80" as TableSize,
      structureColor: "negro" as const,
    };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("el id incluye el tipo de producto", () => {
    const id = generateCartItemId({ type: "estructura", structureColor: "negro" });
    expect(id).toContain("estructura");
  });
});
