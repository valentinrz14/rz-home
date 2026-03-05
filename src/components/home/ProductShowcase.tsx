import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { DersiteIllustration } from "@/components/products/DersiteIllustration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StockStatus } from "@/lib/amazon-stock";
import { isMotorFullyOOS } from "@/lib/amazon-stock";
import type { PricesConfig } from "@/lib/prices";
import { BUNDLE_PRICES_SIMPLE } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import type { StructureColor } from "@/types";
import { TABLE_SIZE } from "@/types";

const productDefs = [
  {
    id: "doble",
    badge: "Más vendido",
    title: "Standing Desk Doble Motor",
    description:
      "La opción más potente y silenciosa. Disponible como escritorio completo, solo estructura o solo tapa.",
    getPrice: (p: PricesConfig) => p.transfer.bundles[TABLE_SIZE.S],
    priceLabel: "completo desde",
    href: "/products?motor=doble",
    highlight: true,
    illustration: {
      structureColor: "negro" as StructureColor,
      withTabletop: true,
      tableColorHex: "#9C6B3C",
    },
    specs: [
      "Doble motor silencioso (<50 dB)",
      "Capacidad 120 kg",
      "3 medidas · 6 colores de tapa",
      "3 memorias + anticolisión",
      "Escritorio completo, estructura o tapa",
    ],
  },
  {
    id: "simple",
    badge: "Nuevo · Accesible",
    title: "Standing Desk Motor Simple",
    description:
      "La opción accesible para empezar con ergonomía ajustable. Completo, solo estructura o solo tapa.",
    getPrice: (_p: PricesConfig) => BUNDLE_PRICES_SIMPLE[TABLE_SIZE.S],
    priceLabel: "completo desde",
    href: "/products?motor=simple",
    highlight: false,
    illustration: {
      structureColor: "blanco" as StructureColor,
      withTabletop: true,
      tableColorHex: "#9C6B3C",
    },
    specs: [
      "Motor silencioso (≤55 dB)",
      "Capacidad 80 kg",
      "2 medidas · 6 colores de tapa",
      "3 memorias + display digital",
      "Escritorio completo, estructura o tapa",
    ],
  },
];

interface Props {
  prices: PricesConfig;
  stock?: StockStatus | null;
}

export function ProductShowcase({ prices, stock = null }: Props) {
  const products = productDefs.map((p) => ({
    ...p,
    price: p.getPrice(prices),
    fullyOOS: isMotorFullyOOS(stock, p.id as "simple" | "doble"),
  }));
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                <div className="absolute top-4 left-5 flex gap-2">
                  <Badge
                    variant={product.highlight ? "brand" : "secondary"}
                    className={`text-sm ${product.highlight ? "bg-brand-500 text-white" : "dark:bg-zinc-700 dark:text-zinc-200"}`}
                  >
                    {product.badge}
                  </Badge>
                  {product.fullyOOS && (
                    <Badge variant="destructive" className="text-sm">
                      Sin stock
                    </Badge>
                  )}
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

      {/* ─── ¿Cuál te conviene? ───────────────────────────────────────── */}
      <div className="mx-auto mt-10 max-w-4xl">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          ¿No sabés cuál elegir?
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              title: "Elegí el Doble Motor si…",
              href: "/products?motor=doble",
              items: [
                "Usás el escritorio 8+ horas por día",
                "Tenés monitors pesados o múltiples periféricos",
                "Querés la mayor estabilidad posible",
                "El espacio es compartido y el ruido importa",
                "Buscás la opción más duradera a largo plazo",
              ],
              highlight: true,
            },
            {
              title: "Elegí el Motor Simple si…",
              href: "/products?motor=simple",
              items: [
                "Es tu primer standing desk",
                "Usás monitor estándar y accesorios ligeros",
                "Buscás la opción más accesible en precio",
                "Home office personal con uso moderado",
                "Querés probar ergonomía ajustable sin invertir de más",
              ],
              highlight: false,
            },
          ].map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className={`group block rounded-2xl border p-6 transition-all hover:shadow-md ${
                col.highlight
                  ? "border-zinc-800 bg-zinc-900 dark:border-zinc-600 dark:bg-zinc-800"
                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              }`}
            >
              <p
                className={`mb-4 text-base font-semibold ${
                  col.highlight ? "text-white" : "text-zinc-900 dark:text-white"
                }`}
              >
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2.5 text-sm ${
                      col.highlight ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${col.highlight ? "text-brand-400" : "text-green-500"}`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p
                className={`mt-5 flex items-center gap-1.5 text-sm font-medium transition-all group-hover:gap-2.5 ${
                  col.highlight ? "text-brand-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Ver producto <ArrowRight size={14} />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
