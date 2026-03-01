import {
  Zap,
  Shield,
  Settings,
  Layers,
  Truck,
  Package,
  Volume2,
  Ruler,
  Plug,
} from "lucide-react";

const iconMap = {
  zap: Zap,
  shield: Shield,
  settings: Settings,
  layers: Layers,
  truck: Truck,
  package: Package,
  volume: Volume2,
  ruler: Ruler,
  plug: Plug,
} as const;

const features = [
  {
    icon: "zap" as const,
    title: "Doble motor silencioso",
    description:
      "Sistema de elevación dual motor eléctrico. Ajuste suave, uniforme y rápido. Casi inaudible (<50 dB).",
  },
  {
    icon: "shield" as const,
    title: "Sensor anticolisión",
    description:
      "Detección inteligente de obstáculos con sensibilidad configurable. Se detiene y retrocede automáticamente.",
  },
  {
    icon: "settings" as const,
    title: "3 memorias + display",
    description:
      "Controlador con 3 memorias programables. Cambiá entre cm y pulgadas. Configurable según espesor de tapa.",
  },
  {
    icon: "layers" as const,
    title: "Tapa MDF premium 36mm",
    description:
      "MDF alta densidad con melamina y tapacanto profesional en los 4 bordes. Resistente y duradera.",
  },
  {
    icon: "ruler" as const,
    title: "Altura 71 – 119 cm",
    description:
      "Rango ajustable de 71 a 119 cm. Compatible con tapas de 110 cm a 180 cm de ancho.",
  },
  {
    icon: "plug" as const,
    title: "100V – 240V universal",
    description:
      "Funciona con cualquier voltaje. Bandeja pasacables incluida + gancho para auriculares.",
  },
  {
    icon: "truck" as const,
    title: "Envío Andreani a todo el país",
    description:
      "Enviamos por Andreani a cualquier punto del país. Tiempo estimado: 10 a 15 días hábiles.",
  },
  {
    icon: "package" as const,
    title: "Armado fácil y probado",
    description:
      "Armado en ~20 min con instrucciones claras. Agujeros pre-perforados. Sale probado con manual incluido.",
  },
  {
    icon: "volume" as const,
    title: "Ultra silencioso",
    description:
      "No interrumpe videollamadas ni reuniones. Cambio de altura completo en segundos sin ruidos mecánicos.",
  },
] as const;

export function Features() {
  return (
    <section id="como-funciona" className="bg-white px-4 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Características
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Todo lo que necesitás
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Sistema de doble motor propio con tapas MDF de alta densidad.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-zinc-100 bg-zinc-50/50 p-7 transition-all hover:border-zinc-200 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-brand-600 dark:bg-zinc-800 dark:group-hover:bg-brand-600">
                  <Icon size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
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
