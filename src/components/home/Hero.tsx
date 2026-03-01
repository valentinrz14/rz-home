import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DersiteIllustration } from "@/components/products/DersiteIllustration";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-center">
      {/* Fondo gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900" />
      {/* Glow de marca */}
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-3xl" />
      <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-brand-800/8 blur-3xl" />

      {/* Ilustración decorativa — solo desktop */}
      <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 xl:block" style={{ width: "340px", opacity: 0.18 }}>
        <DersiteIllustration
          withTabletop
          structureColor="negro"
          tableColorHex="#9C6B3C"
          className="w-full"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-1.5 text-sm font-medium uppercase tracking-widest text-zinc-400">
          Standing Desk Premium · Argentina
        </p>

        <h1 className="font-display text-6xl font-bold leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-8xl">
          Tu escritorio,{" "}
          <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            a tu altura
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-zinc-400">
          Standing desks con doble motor silencioso, tapas MDF premium de 36mm
          y envío a todo el país. Personalizá tu espacio de trabajo.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="xl" asChild className="bg-white text-zinc-900 hover:bg-zinc-100">
            <Link href="/productos">
              Configurar mi escritorio
              <ArrowRight size={20} />
            </Link>
          </Button>
          <Button
            size="xl"
            variant="outline"
            asChild
            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            <Link href="/#como-funciona">Ver cómo funciona</Link>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 border-t border-zinc-800 pt-8">
          {[
            { value: "2 motores", label: "independientes" },
            { value: "120 kg", label: "capacidad de carga" },
            { value: "36 mm", label: "espesor de tapa" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#productos-destacados"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-400"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  );
}
