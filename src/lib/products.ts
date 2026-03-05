import type { StructureColorOption, TableColorOption, TableSize, TableSizeOption } from "@/types";
import { TABLE_SIZE } from "@/types";

// ─── Precios transferencia / cripto ───────────────────────────────────────────
export const STRUCTURE_PRICE = 650_000;

// Redondeado para arriba al próximo múltiplo de $5.000
export const TABLE_PRICES: Record<TableSize, number> = {
  [TABLE_SIZE.S]: 100_000,
  [TABLE_SIZE.M]: 120_000,
  [TABLE_SIZE.L]: 140_000,
};

// Redondeado para arriba al próximo múltiplo de $5.000
export const BUNDLE_PRICES: Record<TableSize, number> = {
  [TABLE_SIZE.S]: 750_000,
  [TABLE_SIZE.M]: 770_000,
  [TABLE_SIZE.L]: 790_000,
};

// ─── Precios MercadoPago 1 pago ────────────────────────────────────────────────
export const STRUCTURE_PRICE_MP = 722_000;

// Redondeado para arriba al próximo múltiplo de $5.000
export const TABLE_PRICES_MP: Record<TableSize, number> = {
  [TABLE_SIZE.S]: 110_000,
  [TABLE_SIZE.M]: 130_000,
  [TABLE_SIZE.L]: 155_000,
};

// Redondeado para arriba al próximo múltiplo de $5.000
export const BUNDLE_PRICES_MP: Record<TableSize, number> = {
  [TABLE_SIZE.S]: 835_000,
  [TABLE_SIZE.M]: 855_000,
  [TABLE_SIZE.L]: 880_000,
};

// ─── Precios motor simple (transferencia / cripto) ────────────────────────────
export const STRUCTURE_PRICE_SIMPLE = 320_000;
export const BUNDLE_PRICES_SIMPLE: Record<typeof TABLE_SIZE.S | typeof TABLE_SIZE.M, number> = {
  [TABLE_SIZE.S]: 420_000,
  [TABLE_SIZE.M]: 459_000,
};

// ─── Precios motor simple MercadoPago 1 pago ──────────────────────────────────
export const STRUCTURE_PRICE_SIMPLE_MP = 326_400; // 320k * 1.02
export const BUNDLE_PRICES_SIMPLE_MP: Record<typeof TABLE_SIZE.S | typeof TABLE_SIZE.M, number> = {
  [TABLE_SIZE.S]: 428_400, // 420k * 1.02
  [TABLE_SIZE.M]: 468_180, // 459k * 1.02
};

// ─── Precios de referencia de competencia ──────────────────────────────────────
export const COMPETITOR_PRICE = 1_400_000;

// ─── Opciones de colores de tabla ─────────────────────────────────────────────
export const TABLE_COLORS: TableColorOption[] = [
  {
    id: "hickory",
    name: "Hickory",
    hex: "#9C6B3C",
    texture: "wood-hickory",
  },
  {
    id: "roble-claro",
    name: "Roble Claro",
    hex: "#C8A97A",
    texture: "wood-oak",
  },
  {
    id: "blanco",
    name: "Blanco",
    hex: "#F5F5F0",
  },
  {
    id: "gris-cemento",
    name: "Gris Cemento",
    hex: "#8A8A8A",
  },
  {
    id: "nogal",
    name: "Nogal",
    hex: "#5C3D1E",
    texture: "wood-walnut",
  },
  {
    id: "negro",
    name: "Negro",
    hex: "#1A1A1A",
  },
];

// ─── Opciones de tamaño de tabla ──────────────────────────────────────────────
export const TABLE_SIZES: TableSizeOption[] = [
  {
    id: TABLE_SIZE.S,
    label: "120 × 60 cm",
    width: 120,
    depth: 60,
    price: TABLE_PRICES[TABLE_SIZE.S],
    bundlePrice: BUNDLE_PRICES[TABLE_SIZE.S],
  },
  {
    id: TABLE_SIZE.M,
    label: "140 × 70 cm",
    width: 140,
    depth: 70,
    price: TABLE_PRICES[TABLE_SIZE.M],
    bundlePrice: BUNDLE_PRICES[TABLE_SIZE.M],
  },
  {
    id: TABLE_SIZE.L,
    label: "160 × 80 cm",
    width: 160,
    depth: 80,
    price: TABLE_PRICES[TABLE_SIZE.L],
    bundlePrice: BUNDLE_PRICES[TABLE_SIZE.L],
  },
];

// ─── Opciones de color de estructura ──────────────────────────────────────────
export const STRUCTURE_COLORS: StructureColorOption[] = [
  { id: "blanco", name: "Blanco", hex: "#F0F0F0" },
  { id: "negro", name: "Negro", hex: "#1A1A1A" },
];

// ─── Specs del standing desk ──────────────────────────────────────────────────
// Specs de la estructura eléctrica doble motor rz room
export const DESK_SPECS = {
  heightRange: { min: 71, max: 119 },
  weightCapacity: 120,
  motors: 2,
  noiseLevel: 50,
  memoryPresets: 3,
  antiCollision: true,
  speed: 38,
  warranty: 12,
  tableThickness: 36,
  compatibleWidth: { min: 110, max: 183 },
  voltage: "100V – 240V",
  assemblyTime: 20,
  brand: "rz room",
  includes: [
    "Estructura doble motor",
    "Controlador con display y 3 memorias",
    "Bandeja pasacables",
    "Gancho para auriculares",
    "Tornillería completa + llave Allen",
    "Manual de instalación",
  ],
} as const;

// ─── Specs del standing desk motor simple (DERSITE KD02) ──────────────────────
export const DESK_SPECS_SIMPLE = {
  heightRange: { min: 71, max: 119 },
  weightCapacity: 80,
  motors: 1,
  noiseLevel: 55,
  memoryPresets: 3,
  speed: 20, // mm/seg
  warranty: 12,
  tableThickness: 36,
  compatibleWidth: { min: 101, max: 160 },
  voltage: "100V – 240V",
  assemblyTime: 20,
} as const;

// ─── Features para marketing ──────────────────────────────────────────────────
export const PRODUCT_FEATURES = [
  {
    icon: "zap",
    title: "Doble motor silencioso",
    description:
      "Dos motores sincrónicos independientes. Movimiento suave, estable y silencioso (<50 dB).",
  },
  {
    icon: "shield",
    title: "Sensor anticolisión",
    description:
      "Detección inteligente de obstáculos. Si detecta algo, se detiene y retrocede automáticamente.",
  },
  {
    icon: "settings",
    title: "3 memorias programables",
    description: "Guardá tus alturas favoritas y cambiá de posición con un solo toque.",
  },
  {
    icon: "layers",
    title: "Tapa MDF premium 36mm",
    description: "Superficie de 36mm de espesor con tapacanto profesional. Resistente y duradera.",
  },
  {
    icon: "truck",
    title: "Envío Andreani a todo el país",
    description:
      "Enviamos a cualquier punto de Argentina a través de Andreani. El costo de envío queda a cargo del comprador.",
  },
  {
    icon: "package",
    title: "Armado y probado",
    description: "Cada escritorio sale armado, probado y con manual de instalación incluido.",
  },
];
