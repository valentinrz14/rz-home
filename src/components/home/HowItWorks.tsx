export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Elegí tu producto",
      description: "Escritorio completo, solo la estructura o solo la tapa.",
    },
    {
      number: "02",
      title: "Personalizá",
      description: "Tamaño (120×60 a 160×80), color de tapa y de estructura.",
    },
    {
      number: "03",
      title: "Elegí cómo pagar",
      description: "Transferencia bancaria o MercadoPago.",
    },
    {
      number: "04",
      title: "Recibís en casa",
      description: "Envío Andreani a todo el país en 10 a 15 días. Llega probado y con manual.",
    },
  ];

  return (
    <section className="bg-white px-4 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            El proceso
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Así de simple
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.5rem)] top-6 hidden h-px w-[calc(100%-3rem)] bg-zinc-200 dark:bg-zinc-800 lg:block" />
              )}
              <div className="relative text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-base font-bold text-white dark:bg-zinc-700">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
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
