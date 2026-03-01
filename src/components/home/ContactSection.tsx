import { Mail, Instagram, MessageCircle } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contacto" className="bg-zinc-900 px-4 py-24 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Contacto
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Tenés alguna pregunta?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          Estamos para ayudarte. Escribinos por cualquiera de estos medios y te
          respondemos a la brevedad.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: "+54 11 XXXX-XXXX",
              href: "https://wa.me/54911XXXXXXXX",
              description: "Lunes a sábado, 9 a 18 hs",
            },
            {
              icon: Mail,
              label: "Email",
              value: "hola@rzroom.com.ar",
              href: "mailto:hola@rzroom.com.ar",
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
                className="group flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/50 p-8 transition-all hover:border-zinc-700 hover:bg-zinc-800"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors group-hover:bg-brand-600">
                  <Icon size={22} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-1 text-base font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
