import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BUNDLE_PRICES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

const rows = [
  { feature: "Doble motor independiente", rzroom: true, comp: true },
  { feature: "Altura 71–119 cm", rzroom: true, comp: true },
  { feature: "Panel con 3 memorias + display", rzroom: true, comp: true },
  { feature: "Sensor anticolisión", rzroom: true, comp: true },
  { feature: "Tapa MDF 36mm de doble capa", rzroom: true, comp: false },
  { feature: "6 colores de tapa disponibles", rzroom: true, comp: false },
  { feature: "4 medidas de tapa disponibles", rzroom: true, comp: false },
  { feature: "Tapacanto profesional 4 lados", rzroom: true, comp: false },
  {
    feature: "Envío Andreani incluido",
    rzroom: false,
    comp: false,
    note: "El cliente paga el envío en ambos casos",
  },
];

export function PriceComparison() {
  const rzroomPrice = BUNDLE_PRICES["160x80"];
  const competitorPrice = 2_240_000;
  const saving = competitorPrice - rzroomPrice;

  return (
    <section className="bg-white px-4 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            ¿Por qué elegirnos?
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            La misma calidad, otro precio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
            Misma estructura de doble motor. Tapas premium propias. Sin el markup de intermediarios.
          </p>
        </div>

        {/* Tabla comparativa */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {/* Encabezado */}
          <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-5 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Característica
            </div>
            <div className="flex flex-col items-center justify-center border-l border-zinc-200 bg-zinc-900 p-5 dark:border-zinc-700 dark:bg-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                rz room
              </span>
              <span className="mt-1.5 font-display text-2xl font-bold text-white">
                {formatPrice(rzroomPrice)}
              </span>
              <span className="mt-0.5 text-xs text-zinc-500">escritorio completo 160×80</span>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-zinc-200 p-5 dark:border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Competencia
              </span>
              <span className="mt-1.5 font-display text-2xl font-bold text-zinc-400 line-through dark:text-zinc-600">
                {formatPrice(competitorPrice)}
              </span>
              <span className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
                precio referencia
              </span>
            </div>
          </div>

          {/* Filas */}
          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 border-b border-zinc-100 last:border-0 dark:border-zinc-800/60 ${
                i % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/30"
              }`}
            >
              <div className="p-5 text-sm text-zinc-700 dark:text-zinc-300">
                {row.feature}
                {row.note && (
                  <span className="mt-0.5 block text-xs text-zinc-400 dark:text-zinc-500">
                    {row.note}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center border-l border-zinc-100 bg-zinc-900/5 p-5 dark:border-zinc-800/60 dark:bg-zinc-800/20">
                {row.rzroom ? (
                  <CheckCircle2 size={22} className="text-green-500" />
                ) : (
                  <XCircle size={22} className="text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
              <div className="flex items-center justify-center border-l border-zinc-100 p-5 dark:border-zinc-800/60">
                {row.comp ? (
                  <CheckCircle2 size={22} className="text-green-500" />
                ) : (
                  <XCircle size={22} className="text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ahorro */}
        <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center dark:border-brand-900/50 dark:bg-brand-950/30 sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              Tu ahorro estimado
            </p>
            <p className="mt-1 font-display text-4xl font-bold text-brand-600 dark:text-brand-300">
              {formatPrice(saving)}
            </p>
            <p className="mt-2 text-sm text-brand-600/70 dark:text-brand-400/70">
              Más las ventajas exclusivas: tapas propias, 6 colores y 4 medidas.
            </p>
          </div>
          <Button size="lg" asChild className="shrink-0">
            <Link href="/productos">Configurar ahora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
