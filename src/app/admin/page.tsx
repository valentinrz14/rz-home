import {
  Package,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  XCircle,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import {
  TABLE_SIZES,
  TABLE_COLORS,
  STRUCTURE_PRICE,
  BUNDLE_PRICES,
  TABLE_PRICES,
} from "@/lib/products";
import { formatPrice } from "@/lib/utils";

// ─── Componente de cierre de sesión (cliente) ─────────────────────────────────
import { AdminLogoutButton } from "./LogoutButton";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function EnvStatus({ label, varName }: { label: string; varName: string }) {
  const isSet = !!process.env[varName];
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      {isSet ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
          <CheckCircle2 size={14} /> Configurado
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
          <XCircle size={14} /> Falta configurar
        </span>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              rz room · Admin
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Panel de administración</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ExternalLink size={14} />
              Ver tienda
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        {/* Resumen de precios */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Estructura sola", value: formatPrice(STRUCTURE_PRICE), icon: Package },
            { label: "Bundle desde", value: formatPrice(BUNDLE_PRICES["120x60"]), icon: ShoppingCart },
            { label: "Bundle hasta", value: formatPrice(BUNDLE_PRICES["160x80"]), icon: DollarSign },
            { label: "Colores de tapa", value: `${TABLE_COLORS.length} opciones`, icon: Package },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                  <Icon size={16} className="text-zinc-400" />
                </div>
                <p className="font-display text-xl font-bold text-white">{card.value}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabla de productos y precios */}
        <section className="mb-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-white">
            Catálogo y precios
          </h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Medida</th>
                  <th className="px-4 py-3 text-right">Solo tapa</th>
                  <th className="px-4 py-3 text-right">Bundle completo</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_SIZES.map((size, i) => (
                  <tr
                    key={size.id}
                    className={`border-b border-zinc-800/60 last:border-0 ${i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/30"}`}
                  >
                    <td className="px-4 py-3 text-zinc-300">Standing Desk</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{size.label}</td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-300">
                      {formatPrice(TABLE_PRICES[size.id])}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {formatPrice(BUNDLE_PRICES[size.id])}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-700 bg-zinc-900/60">
                  <td className="px-4 py-3 text-zinc-300">Estructura sola</td>
                  <td className="px-4 py-3 text-zinc-500">—</td>
                  <td className="px-4 py-3 text-right text-zinc-500">—</td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatPrice(STRUCTURE_PRICE)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Colores disponibles */}
        <section className="mb-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-white">
            Colores de tapa disponibles
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TABLE_COLORS.map((color) => (
              <div
                key={color.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-3"
              >
                <div
                  className="mb-2 h-8 w-full rounded-lg border border-zinc-700"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium text-zinc-300">{color.name}</p>
                <p className="text-xs text-zinc-600">{color.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Links útiles */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-white">
              Gestión de pagos
            </h2>
            <div className="space-y-2">
              {[
                {
                  label: "Dashboard MercadoPago",
                  desc: "Ver ventas, cobros y movimientos",
                  href: "https://www.mercadopago.com.ar/activities",
                },
                {
                  label: "Configurar webhooks",
                  desc: "URL: /api/mercadopago/webhook",
                  href: "https://www.mercadopago.com.ar/developers/panel/app",
                },
                {
                  label: "Credenciales de API",
                  desc: "Access token y public key",
                  href: "https://www.mercadopago.com.ar/developers/panel/credentials",
                },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 transition hover:border-zinc-700"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{link.label}</p>
                    <p className="text-xs text-zinc-500">{link.desc}</p>
                  </div>
                  <ExternalLink size={14} className="shrink-0 text-zinc-600" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-display text-xl font-semibold text-white">
              Variables de entorno
            </h2>
            <div className="space-y-2">
              <EnvStatus label="MERCADOPAGO_ACCESS_TOKEN" varName="MERCADOPAGO_ACCESS_TOKEN" />
              <EnvStatus label="NEXT_PUBLIC_MP_PUBLIC_KEY" varName="NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY" />
              <EnvStatus label="ADMIN_PASSWORD" varName="ADMIN_PASSWORD" />
              <EnvStatus label="NEXT_PUBLIC_SITE_URL" varName="NEXT_PUBLIC_SITE_URL" />
            </div>
          </div>
        </section>

        {/* Info órdenes */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <ShoppingCart size={28} className="mx-auto mb-2 text-zinc-600" />
          <p className="font-semibold text-zinc-300">Gestión de órdenes</p>
          <p className="mt-1 text-sm text-zinc-500">
            Las ventas se registran en MercadoPago. Para ver el historial de pagos,
            accedé al{" "}
            <a
              href="https://www.mercadopago.com.ar/activities"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
            >
              dashboard de MercadoPago
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
