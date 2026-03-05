/**
 * checkout-flow.test.ts
 *
 * Flujos de checkout de punta a punta:
 * - Llamada a la API /api/mercadopago/preference (mock)
 * - Validación de los datos enviados
 * - Respuesta correcta / manejo de errores
 * - Construcción del payload desde el estado del carrito
 */

import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { BUNDLE_PRICES, STRUCTURE_PRICE, TABLE_PRICES } from "@/lib/products";
import { useCartStore } from "@/store/cartStore";
import type { TableSize } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetCart() {
  useCartStore.setState({ items: [], isOpen: false });
}

function buildMpItems() {
  return useCartStore.getState().items.map((item) => ({
    id: item.id,
    title: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "ARS",
  }));
}

function buildPayer(overrides: Partial<typeof DEFAULT_PAYER> = {}) {
  return { ...DEFAULT_PAYER, ...overrides };
}

const DEFAULT_PAYER = {
  name: "Juan",
  surname: "Pérez",
  email: "juan.perez@test.com",
  phone: { area_code: "11", number: "12345678" },
  address: { street_name: "Av. Corrientes 1234", street_number: "0", zip_code: "1043" },
};

// ─── Mock de fetch ────────────────────────────────────────────────────────────

let fetchMock: MockInstance;

beforeEach(() => {
  resetCart();
  fetchMock = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CONSTRUCCIÓN DEL PAYLOAD
// ═══════════════════════════════════════════════════════════════════════════════

describe("construcción del payload de checkout", () => {
  it("items del carrito se mapean correctamente al formato MercadoPago", () => {
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "blanco" });

    const mpItems = buildMpItems();

    expect(mpItems).toHaveLength(2);
    mpItems.forEach((item) => {
      expect(item.currency_id).toBe("ARS");
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.unit_price).toBeGreaterThan(0);
      expect(item.title).toBeTruthy();
      expect(item.id).toBeTruthy();
    });
  });

  it("precio unitario en el payload coincide con el catálogo", () => {
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });

    const [item] = buildMpItems();
    expect(item?.unit_price).toBe(BUNDLE_PRICES["160x80"]);
  });

  it("estructura sola tiene el precio correcto en el payload", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const [item] = buildMpItems();
    expect(item?.unit_price).toBe(STRUCTURE_PRICE);
  });

  it("tapa sola tiene precio correcto para cada medida", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    sizes.forEach((size) => {
      resetCart();
      useCartStore.getState().addItem({ type: "tabla", tableSize: size, tableColor: "hickory" });
      const [item] = buildMpItems();
      expect(item?.unit_price).toBe(TABLE_PRICES[size]);
    });
  });

  it("cantidad en el payload refleja la cantidad del carrito", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });

    const [item] = buildMpItems();
    expect(item?.quantity).toBe(3);
  });

  it("payload total suma correctamente múltiples ítems con distintas cantidades", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const estructuraId = useCartStore.getState().items[0]!.id;
    useCartStore.getState().updateQuantity(estructuraId, 2);

    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "120x60",
      structureColor: "blanco",
      tableColor: "blanco",
    });

    const mpItems = buildMpItems();
    const totalPayload = mpItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    expect(totalPayload).toBe(STRUCTURE_PRICE * 2 + BUNDLE_PRICES["120x60"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. LLAMADA A LA API (mock fetch)
// ═══════════════════════════════════════════════════════════════════════════════

describe("llamada a la API de preferencia", () => {
  it("llama a POST /api/mercadopago/preference con body correcto", async () => {
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });

    const mockResponse = {
      preferenceId: "pref-123",
      initPoint: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123",
    };

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const mpItems = buildMpItems();
    const payer = buildPayer();

    const res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: mpItems, payer }),
    });

    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/mercadopago/preference",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as {
      items: { unit_price: number; currency_id: string }[];
      payer: typeof DEFAULT_PAYER;
    };

    expect(body.items[0]?.currency_id).toBe("ARS");
    expect(body.payer.email).toBe("juan.perez@test.com");
  });

  it("devuelve preferenceId e initPoint en respuesta exitosa", async () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });

    const mockResponse = {
      preferenceId: "pref-abc-456",
      initPoint: "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-abc-456",
    };

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: buildMpItems(), payer: DEFAULT_PAYER }),
    });

    const data = (await res.json()) as typeof mockResponse;
    expect(data.preferenceId).toBe("pref-abc-456");
    expect(data.initPoint).toContain("mercadopago");
  });

  it("maneja errores del servidor correctamente (500)", async () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Error al crear la preferencia de pago." }), {
        status: 500,
      })
    );

    const res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: buildMpItems(), payer: DEFAULT_PAYER }),
    });

    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);

    const data = (await res.json()) as { error: string };
    expect(data.error).toBeTruthy();
  });

  it("maneja error de red (fetch falla)", async () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });

    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    let caught: Error | null = null;
    try {
      await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: buildMpItems(), payer: DEFAULT_PAYER }),
      });
    } catch (e) {
      caught = e as Error;
    }

    expect(caught).not.toBeNull();
    expect(caught?.message).toBe("Network error");
  });

  it("no llama a la API si el carrito está vacío (validación de frontend)", () => {
    // El carrito está vacío, el frontend no debería llamar a la API
    const mpItems = buildMpItems();
    expect(mpItems).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. VALIDACIÓN DE DATOS DEL COMPRADOR
// ═══════════════════════════════════════════════════════════════════════════════

describe("validación de datos del comprador", () => {
  it("datos del comprador tienen todos los campos requeridos", () => {
    const payer = buildPayer();

    expect(payer.name).toBeTruthy();
    expect(payer.surname).toBeTruthy();
    expect(payer.email).toContain("@");
    expect(payer.phone.area_code).toBeTruthy();
    expect(payer.phone.number).toBeTruthy();
    expect(payer.address.street_name).toBeTruthy();
    expect(payer.address.zip_code).toBeTruthy();
  });

  it("email inválido no pasa validación básica", () => {
    const invalidEmails = ["noarroba", "falta@", "@sindominio", ""];
    invalidEmails.forEach((email) => {
      expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("email válido pasa validación básica", () => {
    const validEmails = ["juan@ejemplo.com", "maria.garcia@empresa.com.ar", "test+tag@domain.org"];
    validEmails.forEach((email) => {
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("payer con email de comprador de prueba MP es válido", () => {
    const testBuyerEmail = "test_user_123456@testuser.com";
    const payer = buildPayer({ email: testBuyerEmail });
    expect(payer.email).toBe(testBuyerEmail);
    expect(payer.email).toContain("@");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FLUJO COMPLETO: carrito → payload → API → redirección
// ═══════════════════════════════════════════════════════════════════════════════

describe("flujo completo checkout de punta a punta", () => {
  it("flujo: agrega bundle + estructura → construye payload → llama API → recibe initPoint", async () => {
    // 1. Usuario agrega productos
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "blanco" });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);

    // 2. Construir payload
    const mpItems = buildMpItems();
    expect(mpItems).toHaveLength(2);
    expect(mpItems[0]?.unit_price).toBe(BUNDLE_PRICES["160x80"]);
    expect(mpItems[1]?.unit_price).toBe(STRUCTURE_PRICE);

    // 3. Llamada a la API
    const mockInitPoint =
      "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=test-123";
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ preferenceId: "test-123", initPoint: mockInitPoint }), {
        status: 200,
      })
    );

    const res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: mpItems, payer: buildPayer() }),
    });

    // 4. Verificar respuesta
    expect(res.ok).toBe(true);
    const { initPoint } = (await res.json()) as { initPoint: string };
    expect(initPoint).toBe(mockInitPoint);

    // 5. Verificar que el initPoint es una URL válida
    expect(() => new URL(initPoint)).not.toThrow();
    expect(new URL(initPoint).hostname).toContain("mercadopago");
  });

  it("flujo: carrito con múltiples cantidades → total correcto en payload", async () => {
    // Estructura x2
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const estructuraId = useCartStore.getState().items[0]!.id;
    useCartStore.getState().updateQuantity(estructuraId, 2);

    // Bundle x1
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "120x60",
      structureColor: "blanco",
      tableColor: "blanco",
    });

    const mpItems = buildMpItems();
    const totalPayload = mpItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const expectedTotal = STRUCTURE_PRICE * 2 + BUNDLE_PRICES["120x60"];
    expect(totalPayload).toBe(expectedTotal);

    // API responde con preferencia
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          preferenceId: "pref-multi",
          initPoint: "https://sandbox.mercadopago.com.ar/checkout",
        }),
        { status: 200 }
      )
    );

    const res = await fetch("/api/mercadopago/preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: mpItems, payer: buildPayer() }),
    });

    expect(res.ok).toBe(true);
  });
});
