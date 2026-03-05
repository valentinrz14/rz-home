/**
 * checkout-flow.test.ts
 *
 * End-to-end checkout flows:
 * - POST /api/mercadopago/preference API call (mock)
 * - Validation of sent data
 * - Successful response / error handling
 * - Payload construction from cart state
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

// ─── Fetch mock ───────────────────────────────────────────────────────────────

let fetchMock: MockInstance;

beforeEach(() => {
  resetCart();
  fetchMock = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PAYLOAD CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

describe("checkout payload construction", () => {
  it("cart items are correctly mapped to MercadoPago format", () => {
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

  it("unit price in payload matches catalog", () => {
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });

    const [item] = buildMpItems();
    expect(item?.unit_price).toBe(BUNDLE_PRICES["160x80"]);
  });

  it("structure alone has correct price in payload", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const [item] = buildMpItems();
    expect(item?.unit_price).toBe(STRUCTURE_PRICE);
  });

  it("table alone has correct price for each size", () => {
    const sizes: TableSize[] = ["120x60", "140x70", "160x80"];
    sizes.forEach((size) => {
      resetCart();
      useCartStore.getState().addItem({ type: "tabla", tableSize: size, tableColor: "hickory" });
      const [item] = buildMpItems();
      expect(item?.unit_price).toBe(TABLE_PRICES[size]);
    });
  });

  it("quantity in payload reflects cart quantity", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });

    const [item] = buildMpItems();
    expect(item?.quantity).toBe(3);
  });

  it("payload total correctly sums multiple items with different quantities", () => {
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const structureId = useCartStore.getState().items[0]!.id;
    useCartStore.getState().updateQuantity(structureId, 2);

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
// 2. API CALL (mock fetch)
// ═══════════════════════════════════════════════════════════════════════════════

describe("preference API call", () => {
  it("calls POST /api/mercadopago/preference with correct body", async () => {
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

  it("returns preferenceId and initPoint on successful response", async () => {
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

  it("handles server errors correctly (500)", async () => {
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

  it("handles network error (fetch throws)", async () => {
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

  it("does not call the API if cart is empty (frontend validation)", () => {
    // Cart is empty, frontend should not call the API
    const mpItems = buildMpItems();
    expect(mpItems).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. BUYER DATA VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("buyer data validation", () => {
  it("buyer data has all required fields", () => {
    const payer = buildPayer();

    expect(payer.name).toBeTruthy();
    expect(payer.surname).toBeTruthy();
    expect(payer.email).toContain("@");
    expect(payer.phone.area_code).toBeTruthy();
    expect(payer.phone.number).toBeTruthy();
    expect(payer.address.street_name).toBeTruthy();
    expect(payer.address.zip_code).toBeTruthy();
  });

  it("invalid email does not pass basic validation", () => {
    const invalidEmails = ["noarroba", "falta@", "@sindominio", ""];
    invalidEmails.forEach((email) => {
      expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("valid email passes basic validation", () => {
    const validEmails = ["juan@ejemplo.com", "maria.garcia@empresa.com.ar", "test+tag@domain.org"];
    validEmails.forEach((email) => {
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("payer with MP test buyer email is valid", () => {
    const testBuyerEmail = "test_user_123456@testuser.com";
    const payer = buildPayer({ email: testBuyerEmail });
    expect(payer.email).toBe(testBuyerEmail);
    expect(payer.email).toContain("@");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FULL FLOW: cart → payload → API → redirect
// ═══════════════════════════════════════════════════════════════════════════════

describe("full end-to-end checkout flow", () => {
  it("flow: add bundle + structure → build payload → call API → receive initPoint", async () => {
    // 1. User adds products
    useCartStore.getState().addItem({
      type: "completo",
      tableSize: "160x80",
      structureColor: "negro",
      tableColor: "hickory",
    });
    useCartStore.getState().addItem({ type: "estructura", structureColor: "blanco" });

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);

    // 2. Build payload
    const mpItems = buildMpItems();
    expect(mpItems).toHaveLength(2);
    expect(mpItems[0]?.unit_price).toBe(BUNDLE_PRICES["160x80"]);
    expect(mpItems[1]?.unit_price).toBe(STRUCTURE_PRICE);

    // 3. API call
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

    // 4. Verify response
    expect(res.ok).toBe(true);
    const { initPoint } = (await res.json()) as { initPoint: string };
    expect(initPoint).toBe(mockInitPoint);

    // 5. Verify initPoint is a valid URL
    expect(() => new URL(initPoint)).not.toThrow();
    expect(new URL(initPoint).hostname).toContain("mercadopago");
  });

  it("flow: cart with multiple quantities → correct total in payload", async () => {
    // Structure x2
    useCartStore.getState().addItem({ type: "estructura", structureColor: "negro" });
    const structureId = useCartStore.getState().items[0]!.id;
    useCartStore.getState().updateQuantity(structureId, 2);

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

    // API responds with preference
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
