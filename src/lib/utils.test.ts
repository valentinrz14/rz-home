import { describe, it, expect } from "vitest";
import type { TableSize } from "@/types";
import {
  formatPrice,
  getProductPrice,
  getProductName,
  getCartTotal,
  generateCartItemId,
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
    expect(getProductPrice({ type: "estructura" })).toBe(699_000);
  });

  it("retorna el precio de la tapa por medida", () => {
    expect(getProductPrice({ type: "tabla", tableSize: "120x60" })).toBe(149_000);
    expect(getProductPrice({ type: "tabla", tableSize: "140x70" })).toBe(179_000);
    expect(getProductPrice({ type: "tabla", tableSize: "150x70" })).toBe(199_000);
    expect(getProductPrice({ type: "tabla", tableSize: "160x80" })).toBe(249_000);
  });

  it("retorna el precio del bundle completo por medida", () => {
    expect(getProductPrice({ type: "completo", tableSize: "120x60" })).toBe(799_000);
    expect(getProductPrice({ type: "completo", tableSize: "160x80" })).toBe(899_000);
  });

  it("retorna 0 si falta la medida", () => {
    expect(getProductPrice({ type: "tabla" })).toBe(0);
    expect(getProductPrice({ type: "completo" })).toBe(0);
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
      tableSize: "150x70",
      structureColor: "blanco",
    });
    expect(name).toContain("Standing Desk Completo");
    expect(name).toContain("150x70");
    expect(name).toContain("Blanca");
  });
});

// ─── getCartTotal ─────────────────────────────────────────────────────────────
describe("getCartTotal", () => {
  it("calcula el total correcto", () => {
    const items = [
      {
        id: "1",
        config: { type: "estructura" as const },
        unitPrice: 699_000,
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
    expect(getCartTotal(items)).toBe(699_000 + 149_000 * 2);
  });

  it("retorna 0 para carrito vacío", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("respeta la cantidad de cada ítem", () => {
    const items = [
      {
        id: "1",
        config: { type: "completo" as const, tableSize: "160x80" as TableSize },
        unitPrice: 899_000,
        quantity: 3,
        name: "Completo",
      },
    ];
    expect(getCartTotal(items)).toBe(899_000 * 3);
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
    const config = { type: "completo" as const, tableSize: "160x80" as TableSize, structureColor: "negro" as const };
    expect(generateCartItemId(config)).toBe(generateCartItemId(config));
  });

  it("el id incluye el tipo de producto", () => {
    const id = generateCartItemId({ type: "estructura", structureColor: "negro" });
    expect(id).toContain("estructura");
  });
});
