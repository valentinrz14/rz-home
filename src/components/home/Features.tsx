import {
  Zap,
  Shield,
  Settings,
  Layers,
  Truck,
  Package,
} from "lucide-react";

const iconMap = {
  zap: Zap,
  shield: Shield,
  settings: Settings,
  layers: Layers,
  truck: Truck,
  package: Package,
} as const;

const features = [
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
      "Superficie de 36mm de espesor con tapacanto profesional. Resistente, elegante y duradera.",
  },
  {
    icon: "truck",
    title: "Andreani a todo el país",
    description:
      "Enviamos a cualquier punto de Argentina. El costo de envío lo cotizás al momento del checkout.",
  },
  {
    icon: "package",
    title: "Armado y probado",
    description:
      "Cada escritorio sale armado, probado y con su manual de instalación incluido.",
  },
] as const;

export function Features() {
  return (
    <section id="como-funciona" className="bg-white px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            Por qué elegirnos
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Todo lo que necesitás en un escritorio
          </h2>
          <p className="mt-4 text-zinc-500">
            Combinamos tecnología de doble motor con tapas MDF de alta densidad
            para darte el standing desk más completo del mercado argentino.
          </p>
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-100 bg-zinc-50 p-6 transition-all hover:border-zinc-200 hover:bg-white hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-brand-600">
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
