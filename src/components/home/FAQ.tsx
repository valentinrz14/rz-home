"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "¿El escritorio viene armado?",
    a: "Sí. Cada standing desk se envía probado. El armado es muy simple (~20 min): agujeros pre-perforados, instrucciones claras y llave Allen incluida. Solo necesitás un destornillador Phillips.",
  },
  {
    q: "¿Cuál es el rango de altura?",
    a: "Nuestra estructura se ajusta entre 71 cm y 119 cm. Compatible con personas de cualquier altura, sentado o de pie. Podés configurar altura mínima y máxima según tu preferencia.",
  },
  {
    q: "¿Qué significa 'doble motor'?",
    a: "Un motor independiente en cada columna. Más estable, silencioso (<50 dB) y con mayor capacidad de carga (120 kg con tapa incluida). Cambio de altura completo en segundos.",
  },
  {
    q: "¿Puedo comprar solo la tapa o solo la estructura?",
    a: "Sí. Vendemos los componentes por separado. Si ya tenés una estructura compatible, comprá solo la tapa. O si tenés tu propia madera, comprá solo la estructura.",
  },
  {
    q: "¿Cómo es el envío?",
    a: "Enviamos a todo el país por Andreani. El costo se cotiza en el checkout según tu código postal. Tiempo estimado: 10 a 15 días hábiles.",
  },
  {
    q: "¿Cuántas cuotas puedo elegir?",
    a: "Aceptamos tarjetas de crédito con cuotas sin interés a través de MercadoPago. La cantidad de cuotas depende de tu banco y tarjeta.",
  },
  {
    q: "¿Qué garantía tiene?",
    a: "La estructura eléctrica tiene 12 meses de garantía. Las tapas MDF están garantizadas contra defectos de fabricación.",
  },
  {
    q: "¿Qué incluye la estructura?",
    a: "Estructura doble motor, controlador con display y 3 memorias, bandeja pasacables, gancho para auriculares, tornillería completa y llave Allen. Compatible con tapas de 110 a 180 cm de ancho.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-zinc-50 px-4 py-20 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            FAQ
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="text-base font-medium text-zinc-900 dark:text-white">{faq.q}</span>
                <span className="ml-4 shrink-0 text-zinc-400">
                  {open === i ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  open === i ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
