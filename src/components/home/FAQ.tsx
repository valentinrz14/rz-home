"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "¿El escritorio viene armado?",
    a: "Sí. Cada standing desk se envía completamente armado, probado y con su manual de instalación incluido. Solo tenés que conectarlo y empezar a usarlo.",
  },
  {
    q: "¿Cuál es el rango de altura del escritorio?",
    a: "La estructura se ajusta entre 70 cm y 121 cm de altura. Es compatible con personas de cualquier altura, tanto para trabajar sentado como de pie.",
  },
  {
    q: "¿Qué significa 'doble motor'?",
    a: "El standing desk tiene un motor independiente en cada columna. Esto lo hace más estable, silencioso (menos de 50 dB) y con mayor capacidad de carga (hasta 125 kg incluyendo la tapa).",
  },
  {
    q: "¿Puedo comprar solo la tapa o solo la estructura?",
    a: "¡Sí! Vendemos los componentes por separado. Si ya tenés una estructura compatible, podés comprar solo la tapa. O si tenés tu propia madera, podés comprar solo la estructura.",
  },
  {
    q: "¿Cómo es el envío?",
    a: "Enviamos a todo el país a través de Andreani. El costo de envío se cotiza en el checkout según tu código postal. El tiempo estimado de entrega es de 3 a 7 días hábiles.",
  },
  {
    q: "¿Cuántas cuotas puedo elegir?",
    a: "Aceptamos tarjetas de crédito con cuotas sin interés a través de MercadoPago. La cantidad de cuotas disponibles depende de tu banco y tarjeta.",
  },
  {
    q: "¿Qué garantía tiene el producto?",
    a: "La estructura eléctrica tiene 12 meses de garantía. Las tapas de MDF están garantizadas contra defectos de fabricación.",
  },
  {
    q: "¿Qué espesor tiene la tapa?",
    a: "Las tapas son de MDF de alta densidad con 36mm de espesor total, terminación melanina y tapacanto profesional en todos los bordes.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-zinc-50 px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-zinc-50"
              >
                <span className="text-sm font-medium text-zinc-900">
                  {faq.q}
                </span>
                <span className="ml-4 shrink-0 text-zinc-400">
                  {open === i ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  open === i ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-4 text-sm leading-relaxed text-zinc-500">
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
