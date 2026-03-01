import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              rz<span className="text-brand-600">room</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Standing desks premium con estructura de doble motor y tapas MDF de
              alta densidad, diseñados para que trabajes mejor.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com/rzroom.ar"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
              >
                <Instagram size={16} />
              </a>
              <a
                href="mailto:hola@rzroom.com.ar"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Productos</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/productos", label: "Standing Desk Completo" },
                { href: "/productos?tipo=estructura", label: "Solo Estructura" },
                { href: "/productos?tipo=tabla", label: "Solo Tapa" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Ayuda</h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/#como-funciona", label: "¿Cómo funciona?" },
                { href: "/#faq", label: "Preguntas frecuentes" },
                { href: "/#contacto", label: "Contacto" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-zinc-500">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <a
                  href="mailto:hola@rzroom.com.ar"
                  className="hover:text-zinc-900"
                >
                  hola@rzroom.com.ar
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-zinc-500">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} rz room. Todos los derechos reservados.
          </p>
          <p className="text-xs text-zinc-400">
            Envíos a todo el país con Andreani · Pagos con tarjeta
          </p>
        </div>
      </div>
    </footer>
  );
}
