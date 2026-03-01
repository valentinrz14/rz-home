export type TableSize = "120x60" | "140x70" | "150x70" | "160x80";

export type TableColor =
  | "hickory"
  | "roble-claro"
  | "blanco"
  | "gris-cemento"
  | "nogal"
  | "negro";

export type StructureColor = "blanco" | "negro";

export type ProductType = "estructura" | "tabla" | "completo";

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

export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}
