import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUNDLE_PRICES, STRUCTURE_PRICE, TABLE_PRICES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

const products = [
  {
    id: "completo",
    badge: "Más vendido",
    badgeVariant: "default" as const,
    title: "Standing Desk Completo",
    description:
      "Estructura doble motor + tapa MDF premium de 36mm. Elegí tu medida, color de tapa y color de estructura.",
    price: BUNDLE_PRICES["120x60"],
    priceLabel: "desde",
    href: "/productos?tipo=completo",
    highlight: true,
    specs: [
      "Estructura doble motor",
      "Tapa MDF 36mm",
      "4 medidas disponibles",
      "6 colores de tapa",
      "Estructura blanca o negra",
    ],
  },
  {
    id: "estructura",
    badge: "Solo estructura",
    badgeVariant: "secondary" as const,
    title: "Estructura Doble Motor",
    description:
      "Estructura regulable en altura con doble motor, panel de control con 3 memorias y sensor anticolisión. Para combinar con tu propia tapa.",
    price: STRUCTURE_PRICE,
    priceLabel: "",
    href: "/productos?tipo=estructura",
    highlight: false,
    specs: [
      "Doble motor silencioso",
      "Altura: 70 – 121 cm",
      "Capacidad 125 kg",
      "3 memorias programables",
      "Color blanco o negro",
    ],
  },
  {
    id: "tabla",
    badge: "Solo tapa",
    badgeVariant: "secondary" as const,
    title: "Tapa de Escritorio Premium",
    description:
      "Tapa MDF de 36mm de espesor con tapacanto profesional. Disponible en 4 medidas y hasta 6 colores.",
    price: TABLE_PRICES["120x60"],
    priceLabel: "desde",
    href: "/productos?tipo=tabla",
    highlight: false,
    specs: [
      "MDF alta densidad 36mm",
      "4 medidas disponibles",
      "6 colores disponibles",
      "Tapacanto profesional",
      "Lista para instalar",
    ],
  },
];

export function ProductShowcase() {
  return (
    <section
      id="productos-destacados"
      className="bg-zinc-50 px-4 py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            Nuestros productos
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Configurá tu workspace ideal
          </h2>
          <p className="mt-4 text-zinc-500">
            Armá tu escritorio de la manera que más se adapte a vos. Podés comprar
            el conjunto completo o los componentes por separado.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                product.highlight
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-xl"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md"
              }`}
            >
              <Badge
                variant={
                  product.highlight ? "brand" : product.badgeVariant
                }
                className={`w-fit ${product.highlight ? "bg-brand-500 text-white" : ""}`}
              >
                {product.badge}
              </Badge>

              <h3
                className={`mt-4 text-xl font-bold ${
                  product.highlight ? "text-white" : "text-zinc-900"
                }`}
              >
                {product.title}
              </h3>

              <p
                className={`mt-2 text-sm leading-relaxed ${
                  product.highlight ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {product.description}
              </p>

              {/* Precio */}
              <div className="mt-6">
                {product.priceLabel && (
                  <span
                    className={`text-xs uppercase tracking-wide ${
                      product.highlight ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    {product.priceLabel}{" "}
                  </span>
                )}
                <span
                  className={`text-3xl font-bold ${
                    product.highlight ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Specs */}
              <ul className="mt-6 flex-1 space-y-2">
                {product.specs.map((spec) => (
                  <li
                    key={spec}
                    className={`flex items-center gap-2 text-sm ${
                      product.highlight ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        product.highlight ? "bg-brand-400" : "bg-zinc-400"
                      }`}
                    />
                    {spec}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className={`mt-8 w-full gap-2 ${
                  product.highlight
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : ""
                }`}
                variant={product.highlight ? "outline" : "default"}
              >
                <Link href={product.href}>
                  Configurar
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
