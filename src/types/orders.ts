export type PaymentMethod = "transfer" | "crypto_usdt_trc20" | "crypto_usdt_polygon" | "crypto_ltc";

export type OrderStatus = "pending" | "confirmed";

export interface PendingOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  buyerName: string;
  buyerLastName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  postalCode: string;
  items: Array<{ title: string; quantity: number; unit_price: number }>;
  /** Precio de productos + envío sin ajuste por método de pago */
  originalAmount: number;
  /** Precio final con descuento/recargo aplicado */
  finalAmount: number;
  /** Monto en cripto al momento del pedido (solo para métodos crypto_*) */
  cryptoAmount?: string;
  /** Ticker de la crypto usada (ej: "USDT", "LTC") */
  cryptoTicker?: string;
}
