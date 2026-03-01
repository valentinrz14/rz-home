import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-center">
      {/* Gradiente de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,115,85,0.15),transparent)]" />

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-400">
          Standing Desk Premium · Hecho en Argentina
        </p>

        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Tu escritorio,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
            a tu altura
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Standing desks con doble motor silencioso, tapas MDF premium de 36mm
          y envío a todo el país. Personalizá tu espacio de trabajo ideal.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="xl" asChild className="bg-white text-zinc-900 hover:bg-zinc-100">
            <Link href="/productos">
              Configurar mi escritorio
              <ArrowRight size={18} />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white">
            <Link href="/#como-funciona">Ver cómo funciona</Link>
          </Button>
        </div>

        {/* Stats rápidas */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-zinc-800 pt-10">
          {[
            { value: "2 motores", label: "independientes" },
            { value: "125 kg", label: "capacidad de carga" },
            { value: "36 mm", label: "espesor de tapa" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#productos-destacados"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown size={16} className="animate-bounce" />
      </a>
    </section>
  );
}
