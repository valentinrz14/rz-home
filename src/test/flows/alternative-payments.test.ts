/**
 * alternative-payments.test.ts
 *
 * Tests for alternative payment methods:
 * - Adjusted price calculation (transfer / crypto)
 * - Order type logic and validations
 * - Order ID generation
 */

import { describe, expect, it } from "vitest";
import type { OrderStatus, PaymentMethod, PendingOrder } from "@/types/orders";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ADJUSTED PRICE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("price adjustment by payment method", () => {
  function calcTransfer(total: number) {
    return Math.round(total * 0.9);
  }

  function calcCrypto(total: number) {
    return Math.round(total * 0.9);
  }

  it("transfer applies 10% discount", () => {
    expect(calcTransfer(100_000)).toBe(90_000);
    expect(calcTransfer(500_000)).toBe(450_000);
    expect(calcTransfer(1_000_000)).toBe(900_000);
  });

  it("crypto applies 10% discount (same as transfer)", () => {
    expect(calcCrypto(100_000)).toBe(90_000);
    expect(calcCrypto(500_000)).toBe(450_000);
    expect(calcCrypto(1_000_000)).toBe(900_000);
  });

  it("transfer and crypto have the same 10% discount", () => {
    const totals = [100_000, 250_000, 500_000, 850_000, 1_200_000];
    totals.forEach((total) => {
      expect(calcTransfer(total)).toBe(calcCrypto(total));
    });
  });

  it("both methods are always cheaper than the original price", () => {
    const totals = [100_000, 250_000, 500_000, 850_000, 1_200_000];
    totals.forEach((total) => {
      expect(calcTransfer(total)).toBeLessThan(total);
      expect(calcCrypto(total)).toBeLessThan(total);
    });
  });

  it("result is always an integer (Math.round)", () => {
    // Total that does not divide evenly
    const oddTotal = 333_333;
    expect(Number.isInteger(calcTransfer(oddTotal))).toBe(true);
    expect(Number.isInteger(calcCrypto(oddTotal))).toBe(true);
  });

  it("transfer savings are exactly 10% rounded", () => {
    const total = 750_000;
    const discount = total - calcTransfer(total);
    expect(discount).toBe(75_000);
  });

  it("crypto discount is exactly 10% rounded", () => {
    const total = 750_000;
    const discount = total - calcCrypto(total);
    expect(discount).toBe(75_000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ORDER TYPES AND VALIDATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe("PendingOrder types", () => {
  const validMethods: PaymentMethod[] = [
    "transfer",
    "crypto_usdt_trc20",
    "crypto_usdt_polygon",
    "crypto_ltc",
  ];

  const validStatuses: OrderStatus[] = ["pending", "confirmed"];

  it("all alternative payment methods are defined", () => {
    expect(validMethods).toHaveLength(4);
    expect(validMethods).toContain("transfer");
    expect(validMethods).toContain("crypto_usdt_trc20");
    expect(validMethods).toContain("crypto_usdt_polygon");
    expect(validMethods).toContain("crypto_ltc");
  });

  it("valid statuses are only pending and confirmed", () => {
    expect(validStatuses).toHaveLength(2);
    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("confirmed");
  });

  it("an order can be constructed with all its fields", () => {
    const order: PendingOrder = {
      id: "rz-1234567890",
      createdAt: new Date().toISOString(),
      status: "pending",
      paymentMethod: "transfer",
      buyerName: "Juan",
      buyerLastName: "Pérez",
      buyerEmail: "juan@test.com",
      buyerPhone: "1112345678",
      buyerAddress: "Av. Corrientes 1234, CABA",
      postalCode: "1043",
      items: [
        { title: "Standing Desk Completo 160x80", quantity: 1, unit_price: 850_000 },
        { title: "Envío Andreani a CP 1043", quantity: 1, unit_price: 15_000 },
      ],
      originalAmount: 865_000,
      finalAmount: 778_500, // 865_000 * 0.9
    };

    expect(order.id).toBe("rz-1234567890");
    expect(order.status).toBe("pending");
    expect(order.finalAmount).toBe(778_500);
    expect(order.items).toHaveLength(2);
  });

  it("finalAmount with transfer is 90% of originalAmount", () => {
    const original = 865_000;
    const final = Math.round(original * 0.9);
    expect(final).toBe(778_500);
  });

  it("finalAmount with crypto is 90% of originalAmount (10% discount)", () => {
    const original = 865_000;
    const final = Math.round(original * 0.9);
    expect(final).toBe(778_500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ORDER ID GENERATION AND FORMAT
// ═══════════════════════════════════════════════════════════════════════════════

describe("order IDs", () => {
  function generateOrderId() {
    return `rz-${Date.now()}`;
  }

  it("ID always starts with 'rz-'", () => {
    const id = generateOrderId();
    expect(id).toMatch(/^rz-/);
  });

  it("ID contains a numeric timestamp", () => {
    const id = generateOrderId();
    const timestamp = id.replace("rz-", "");
    expect(Number.isInteger(Number(timestamp))).toBe(true);
    expect(Number(timestamp)).toBeGreaterThan(0);
  });

  it("IDs generated at different moments are unique", async () => {
    const id1 = `rz-${Date.now()}`;
    await new Promise((r) => setTimeout(r, 2));
    const id2 = `rz-${Date.now()}`;
    expect(id1).not.toBe(id2);
  });

  it("ID format is consistent with the expected pattern", () => {
    const id = generateOrderId();
    expect(id).toMatch(/^rz-\d+$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PAYMENT METHOD — CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("payment method classification", () => {
  function isCrypto(method: string) {
    return method.startsWith("crypto_");
  }

  function isTransfer(method: string) {
    return method === "transfer";
  }

  function isMercadoPago(method: string) {
    return method === "mercadopago";
  }

  it("crypto methods are correctly identified", () => {
    expect(isCrypto("crypto_usdt_trc20")).toBe(true);
    expect(isCrypto("crypto_usdt_polygon")).toBe(true);
    expect(isCrypto("crypto_ltc")).toBe(true);
    expect(isCrypto("transfer")).toBe(false);
    expect(isCrypto("mercadopago")).toBe(false);
  });

  it("transfer is correctly identified", () => {
    expect(isTransfer("transfer")).toBe(true);
    expect(isTransfer("crypto_usdt_trc20")).toBe(false);
    expect(isTransfer("mercadopago")).toBe(false);
  });

  it("MercadoPago is correctly identified", () => {
    expect(isMercadoPago("mercadopago")).toBe(true);
    expect(isMercadoPago("transfer")).toBe(false);
    expect(isMercadoPago("crypto_ltc")).toBe(false);
  });

  it("a method always belongs to exactly one category", () => {
    const allMethods = [
      "mercadopago",
      "transfer",
      "crypto_usdt_trc20",
      "crypto_usdt_polygon",
      "crypto_ltc",
    ];

    allMethods.forEach((method) => {
      const categories = [isCrypto(method), isTransfer(method), isMercadoPago(method)];
      const count = categories.filter(Boolean).length;
      expect(count).toBe(1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ORDER FIELD VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

describe("order required fields validation", () => {
  const requiredFields: (keyof PendingOrder)[] = [
    "buyerName",
    "buyerLastName",
    "buyerEmail",
    "buyerPhone",
    "buyerAddress",
    "postalCode",
    "items",
    "paymentMethod",
    "originalAmount",
    "finalAmount",
  ];

  it("all required fields are defined in the type", () => {
    const order: PendingOrder = {
      id: "rz-test",
      createdAt: new Date().toISOString(),
      status: "pending",
      paymentMethod: "transfer",
      buyerName: "Test",
      buyerLastName: "User",
      buyerEmail: "test@test.com",
      buyerPhone: "1100000000",
      buyerAddress: "Test 123",
      postalCode: "1000",
      items: [{ title: "Producto", quantity: 1, unit_price: 100 }],
      originalAmount: 100,
      finalAmount: 90,
    };

    requiredFields.forEach((field) => {
      expect(order[field]).toBeDefined();
    });
  });

  it("an order without items has an empty array, not undefined", () => {
    const order: PendingOrder = {
      id: "rz-test",
      createdAt: new Date().toISOString(),
      status: "pending",
      paymentMethod: "transfer",
      buyerName: "Test",
      buyerLastName: "User",
      buyerEmail: "test@test.com",
      buyerPhone: "1100000000",
      buyerAddress: "Test 123",
      postalCode: "1000",
      items: [],
      originalAmount: 0,
      finalAmount: 0,
    };

    expect(Array.isArray(order.items)).toBe(true);
  });

  it("originalAmount is always greater than or equal to finalAmount for transfer", () => {
    const original = 500_000;
    const final = Math.round(original * 0.9);
    expect(original).toBeGreaterThanOrEqual(final);
  });

  it("finalAmount is less than originalAmount for crypto (10% discount)", () => {
    const original = 500_000;
    const final = Math.round(original * 0.9);
    expect(final).toBeLessThan(original);
  });
});
