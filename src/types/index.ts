export const TABLE_SIZE = {
  S: "120x60",
  M: "140x70",
  L: "160x80",
} as const;

export type TableSize = (typeof TABLE_SIZE)[keyof typeof TABLE_SIZE];

export type TableColor = "hickory" | "roble-claro" | "blanco" | "gris-cemento" | "nogal" | "negro";

export type StructureColor = "blanco" | "negro";

export type ProductType = "estructura" | "tabla" | "completo";

export type MotorType = "simple" | "doble";

export interface TableColorOption {
  id: TableColor;
  name: string;
  hex: string;
  texture?: string;
}

export interface TableSizeOption {
  id: TableSize;
  label: string;
  width: number;
  depth: number;
  price: number;
  bundlePrice: number;
}

export interface StructureColorOption {
  id: StructureColor;
  name: string;
  hex: string;
}

export interface CartItemConfig {
  type: ProductType;
  motorType?: MotorType;
  structureColor?: StructureColor;
  tableSize?: TableSize;
  tableColor?: TableColor;
}

export interface CartItem {
  id: string;
  config: CartItemConfig;
  quantity: number;
  unitPrice: number;
  name: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  notes: string;
}

export interface ShippingQuote {
  costo: number;
  plazo: number | null;
  pickup?: boolean;
}

export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}
