import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              rz<span className="text-brand-500">room</span>
            </span>
            <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              Standing desks premium con doble motor y tapas MDF de alta densidad.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com/rzroom.ar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:hola@rzroom.com.ar"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-white"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Productos</h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/productos", label: "Standing Desk Completo" },
                { href: "/productos?tipo=estructura", label: "Solo Estructura" },
                { href: "/productos?tipo=tabla", label: "Solo Tapa" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Ayuda</h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/#como-funciona", label: "¿Cómo funciona?" },
                { href: "/#faq", label: "Preguntas frecuentes" },
                { href: "/#contacto", label: "Contacto" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Contacto</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-2.5 text-base text-zinc-500 dark:text-zinc-400">
                <Mail size={18} className="mt-0.5 shrink-0" />
                <a href="mailto:hola@rzroom.com.ar" className="hover:text-zinc-900 dark:hover:text-white">
                  hola@rzroom.com.ar
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-base text-zinc-500 dark:text-zinc-400">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-8 dark:border-zinc-800 sm:flex-row">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} rz room. Todos los derechos reservados.
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Envíos a todo el país con Andreani · Pagos con tarjeta
          </p>
        </div>
      </div>
    </footer>
  );
}
