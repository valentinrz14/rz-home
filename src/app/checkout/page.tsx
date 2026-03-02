"use client";

import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { CheckoutFormData } from "@/types";

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const INPUT_CLASS =
  "w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-500";

export default function CheckoutPage() {
  const { items } = useCartStore();
  const total = getCartTotal(items);

  const [form, setForm] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const mpItems = items.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "ARS",
      }));

      const res = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: mpItems,
          payer: {
            name: form.firstName,
            surname: form.lastName,
            email: form.email,
            phone: {
              area_code: form.phone.replace(/\D/g, "").slice(0, 2),
              number: form.phone.replace(/\D/g, "").slice(2),
            },
            address: { street_name: form.address, street_number: "0", zip_code: form.postalCode },
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al procesar el pago.");
      }

      const { initPoint } = await res.json();
      window.location.href = initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">No hay productos en tu carrito.</p>
        <Button asChild variant="outline">
          <Link href="/productos">
            <ArrowLeft size={16} /> Ir a productos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/carrito"
          className="flex items-center gap-2 text-base text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al carrito
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="text-base font-medium text-zinc-900 dark:text-white">Checkout</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="mb-5 font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Datos de envío
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Nombre *
                </label>
                <input
                  name="firstName"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Apellido *
                </label>
                <input
                  name="lastName"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email *
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="juan@email.com"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Teléfono *
              </label>
              <input
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+54 11 1234-5678"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Provincia *
                </label>
                <select
                  name="province"
                  required
                  value={form.province}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  <option value="">Seleccioná</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ciudad *
                </label>
                <input
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Buenos Aires"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Dirección *
              </label>
              <input
                name="address"
                required
                value={form.address}
                onChange={handleChange}
                placeholder="Av. Corrientes 1234, Piso 5 Dpto B"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Código postal *
              </label>
              <input
                name="postalCode"
                required
                value={form.postalCode}
                onChange={handleChange}
                placeholder="1043"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notas (opcional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Instrucciones especiales..."
                className={INPUT_CLASS}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-base text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" size="xl" className="w-full gap-2 text-lg" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={20} /> Pagar con MercadoPago
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Lock size={14} /> Pago seguro con MercadoPago · SSL encriptado
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Resumen</h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2 text-base">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="ml-1 text-zinc-400"> x{item.quantity}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium text-zinc-900 dark:text-white">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-700" />
            <div className="flex justify-between text-base">
              <span className="text-zinc-600 dark:text-zinc-400">Envío (Andreani)</span>
              <span className="text-zinc-500">A calcular</span>
            </div>
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-700" />
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">Total</span>
              <span className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(total)}
              </span>
            </div>

            <div className="mt-5 rounded-lg bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
              <p className="font-semibold">Cuotas sin interés</p>
              <p className="mt-1 text-brand-700 dark:text-brand-400">
                Hasta 12 cuotas sin interés con tarjetas seleccionadas via MercadoPago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
