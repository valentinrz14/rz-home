import { Instagram, Mail, MessageCircle } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contacto" className="bg-zinc-900 px-4 py-20 text-white dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-400">
          Contacto
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          ¿Tenés alguna pregunta?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Escribinos por cualquiera de estos medios.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: "+541159774027",
              href: "https://wa.me/5491159774027",
              description: "Lun a sáb, 9 a 18 hs",
            },
            {
              icon: Mail,
              label: "Email",
              value: "ecomerce.rzhome@gmail.com",
              href: "mailto:ecomerce.rzhome@gmail.com",
              description: "Respondemos en 24 hs",
            },
            {
              icon: Instagram,
              label: "Instagram",
              value: "@rzroom.ar",
              href: "https://instagram.com/rzroom.ar",
              description: "Seguinos para novedades",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/50 p-7 transition-all hover:border-zinc-700 hover:bg-zinc-800"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors group-hover:bg-brand-600">
                  <Icon size={26} />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-1.5 text-lg font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
