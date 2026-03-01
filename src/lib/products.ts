import type {
  TableColorOption,
  TableSizeOption,
  StructureColorOption,
} from "@/types";

// ─── Precios ──────────────────────────────────────────────────────────────────
//
// Costos de producción (ARS):
//   Tabla 160x80: $153.800  |  Estructura doble motor: $376.000
//
// Estrategia: margen ~70-90% sobre costo, siempre más barato que competencia.
// Competencia referencia: JUST.ERGONOMICS cobra $2.240.000 el bundle completo.
//
export const STRUCTURE_PRICE = 699_000; // Solo estructura doble motor

export const TABLE_PRICES: Record<string, number> = {
  "120x60": 149_000,
  "140x70": 179_000,
  "150x70": 199_000,
  "160x80": 249_000,
};

export const BUNDLE_PRICES: Record<string, number> = {
  "120x60": 799_000,
  "140x70": 829_000,
  "150x70": 849_000,
  "160x80": 899_000,
};

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
    id: "120x60",
    label: "120 × 60 cm",
    width: 120,
    depth: 60,
    price: TABLE_PRICES["120x60"],
    bundlePrice: BUNDLE_PRICES["120x60"],
  },
  {
    id: "140x70",
    label: "140 × 70 cm",
    width: 140,
    depth: 70,
    price: TABLE_PRICES["140x70"],
    bundlePrice: BUNDLE_PRICES["140x70"],
  },
  {
    id: "150x70",
    label: "150 × 70 cm",
    width: 150,
    depth: 70,
    price: TABLE_PRICES["150x70"],
    bundlePrice: BUNDLE_PRICES["150x70"],
  },
  {
    id: "160x80",
    label: "160 × 80 cm",
    width: 160,
    depth: 80,
    price: TABLE_PRICES["160x80"],
    bundlePrice: BUNDLE_PRICES["160x80"],
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
    description:
      "Guardá tus alturas favoritas y cambiá de posición con un solo toque.",
  },
  {
    icon: "layers",
    title: "Tapa MDF premium 36mm",
    description:
      "Superficie de 36mm de espesor con tapacanto profesional. Resistente y duradera.",
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
    description:
      "Cada escritorio sale armado, probado y con manual de instalación incluido.",
  },
];
