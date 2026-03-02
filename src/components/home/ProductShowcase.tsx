import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DersiteIllustration } from "@/components/products/DersiteIllustration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUNDLE_PRICES, STRUCTURE_PRICE, TABLE_PRICES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import type { StructureColor } from "@/types";

const products = [
  {
    id: "completo",
    badge: "Más vendido",
    title: "Standing Desk Completo",
    description:
      "Estructura doble motor rz room + tapa MDF premium 36mm. Elegí medida, color de tapa y color de estructura.",
    price: BUNDLE_PRICES["120x60"],
    priceLabel: "desde",
    href: "/productos?tipo=completo",
    highlight: true,
    illustration: {
      structureColor: "negro" as StructureColor,
      withTabletop: true,
      tableColorHex: "#9C6B3C",
    },
    specs: [
      "Estructura rz room doble motor",
      "Tapa MDF 36mm con melamina",
      "4 medidas · 6 colores de tapa",
      "Estructura blanca o negra",
      "3 memorias + anticolisión",
    ],
  },
  {
    id: "estructura",
    badge: "Solo estructura",
    title: "Estructura Doble Motor",
    description:
      "Estructura rz room regulable 71–119 cm con panel de control, 3 memorias, sensor anticolisión y bandeja pasacables.",
    price: STRUCTURE_PRICE,
    priceLabel: "",
    href: "/productos?tipo=estructura",
    highlight: false,
    illustration: {
      structureColor: "negro" as StructureColor,
      withTabletop: false,
      tableColorHex: "#9C6B3C",
    },
    specs: [
      "Doble motor silencioso (<50 dB)",
      "Altura: 71 – 119 cm",
      "Capacidad 120 kg",
      "3 memorias + display cm/in",
      "Bandeja pasacables + gancho",
    ],
  },
  {
    id: "tabla",
    badge: "Solo tapa",
    title: "Tapa de Escritorio",
    description:
      "Tapa MDF alta densidad 36mm con terminación melamina y tapacanto profesional en todos los bordes.",
    price: TABLE_PRICES["120x60"],
    priceLabel: "desde",
    href: "/productos?tipo=tabla",
    highlight: false,
    illustration: {
      structureColor: "blanco" as StructureColor,
      withTabletop: true,
      tableColorHex: "#9C6B3C",
    },
    specs: [
      "MDF alta densidad 36mm",
      "4 medidas disponibles",
      "6 colores de melamina",
      "Lista para instalar",
    ],
  },
];

export function ProductShowcase() {
  return (
    <section id="productos-destacados" className="bg-zinc-50 px-4 py-20 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Nuestros productos
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Configurá tu workspace
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Escritorio completo o componentes por separado. Vos elegís.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl border transition-all ${
                product.highlight
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-xl dark:border-zinc-600 dark:bg-zinc-800"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              }`}
            >
              {/* Ilustración */}
              <div
                className={`relative flex items-end justify-center overflow-hidden pt-6 ${
                  product.highlight ? "bg-zinc-800/60" : "bg-zinc-100/80 dark:bg-zinc-800/40"
                }`}
                style={{ height: "220px" }}
              >
                <div className="w-36">
                  <DersiteIllustration
                    structureColor={product.illustration.structureColor}
                    withTabletop={product.illustration.withTabletop}
                    tableColorHex={product.illustration.tableColorHex}
                    className="w-full"
                  />
                </div>
                <div className="absolute top-4 left-5">
                  <Badge
                    variant={product.highlight ? "brand" : "secondary"}
                    className={`text-sm ${product.highlight ? "bg-brand-500 text-white" : "dark:bg-zinc-700 dark:text-zinc-200"}`}
                  >
                    {product.badge}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-7">
                <h3
                  className={`font-display text-2xl font-bold ${
                    product.highlight ? "text-white" : "text-zinc-900 dark:text-white"
                  }`}
                >
                  {product.title}
                </h3>

                <p
                  className={`mt-3 text-base leading-relaxed ${
                    product.highlight ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {product.description}
                </p>

                <div className="mt-5">
                  {product.priceLabel && (
                    <span
                      className={`text-sm uppercase tracking-wide ${
                        product.highlight ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      {product.priceLabel}{" "}
                    </span>
                  )}
                  <span
                    className={`font-display text-4xl font-bold ${
                      product.highlight ? "text-white" : "text-zinc-900 dark:text-white"
                    }`}
                  >
                    {formatPrice(product.price)}
                  </span>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {product.specs.map((spec) => (
                    <li
                      key={spec}
                      className={`flex items-center gap-2.5 text-base ${
                        product.highlight ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          product.highlight ? "bg-brand-400" : "bg-zinc-400 dark:bg-zinc-600"
                        }`}
                      />
                      {spec}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-7 w-full gap-2 text-base ${
                    product.highlight
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  }`}
                  variant={product.highlight ? "outline" : "default"}
                  size="lg"
                >
                  <Link href={product.href}>
                    Configurar
                    <ArrowRight size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
