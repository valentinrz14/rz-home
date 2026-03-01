export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Elegí tu producto",
      description:
        "Seleccioná si querés el escritorio completo, solo la estructura o solo la tapa.",
    },
    {
      number: "02",
      title: "Personalizá",
      description:
        "Elegí el tamaño de la tapa (120x60 hasta 160x80), el color y el color de la estructura.",
    },
    {
      number: "03",
      title: "Pagá en cuotas",
      description:
        "Aceptamos tarjetas de crédito con cuotas sin interés a través de MercadoPago.",
    },
    {
      number: "04",
      title: "Recibís en casa",
      description:
        "Enviamos por Andreani a todo el país. Tu escritorio llega armado, probado y con manual.",
    },
  ];

  return (
    <section className="bg-white px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            El proceso
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Así de simple
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.5rem)] top-5 hidden h-px w-[calc(100%-3rem)] bg-zinc-200 lg:block" />
              )}

              <div className="relative text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-base font-semibold text-zinc-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
