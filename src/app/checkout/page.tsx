"use client";

import { ArrowLeft, ArrowRight, CreditCard, Lock, MapPin, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { CartItem, CheckoutFormData, ShippingQuote } from "@/types";

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

// ── Paso 1: Calculador de envío ───────────────────────────────────────────────

function ShippingStep({
  items,
  total,
  onContinue,
}: {
  items: CartItem[];
  total: number;
  onContinue: (postalCode: string, quote: ShippingQuote) => void;
}) {
  const [postalCode, setPostalCode] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setQuote(null);
    setLoading(true);

    try {
      const cartItems = items.map((item) => ({
        type: item.config.type,
        size: item.config.tableSize,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const res = await fetch("/api/andreani/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigoPostal: postalCode, items: cartItems }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo calcular el envío.");
      }

      setQuote(data as ShippingQuote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const grandTotal = quote ? total + quote.costo : null;

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
        <span className="text-base text-zinc-500 dark:text-zinc-400">Envío</span>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="text-base text-zinc-400 dark:text-zinc-600">Pago</span>
      </div>

      {/* Indicador de paso */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
          1
        </div>
        <span className="font-medium text-zinc-900 dark:text-white">Calcular envío</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
          2
        </div>
        <span className="text-base text-zinc-400 dark:text-zinc-600">Datos y pago</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Calculador */}
        <div className="lg:col-span-3">
          <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Calculá el costo de envío
          </h1>
          <p className="mb-6 text-base text-zinc-500 dark:text-zinc-400">
            Ingresá tu código postal para conocer el precio y tiempo de entrega con Andreani.
          </p>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Código postal
              </label>
              <div className="flex gap-3">
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Ej: 1043"
                  maxLength={4}
                  pattern="\d{4}"
                  required
                  className={INPUT_CLASS}
                />
                <Button type="submit" disabled={loading || postalCode.length !== 4} className="shrink-0 gap-2">
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Truck size={16} />
                  )}
                  {loading ? "Calculando..." : "Calcular"}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-base text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
          </form>

          {/* Resultado de cotización */}
          {quote && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-950/30">
              <div className="flex items-start gap-3">
                <Package size={22} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    Envío disponible a CP {postalCode}
                  </p>
                  <div className="mt-2 flex flex-col gap-1 text-base">
                    <div className="flex justify-between">
                      <span className="text-green-700 dark:text-green-400">Costo de envío</span>
                      <span className="font-bold text-green-800 dark:text-green-300">
                        {formatPrice(quote.costo)}
                      </span>
                    </div>
                    {quote.plazo !== null && (
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-400">Plazo estimado</span>
                        <span className="text-green-800 dark:text-green-300">
                          {quote.plazo} día{quote.plazo !== 1 ? "s" : ""} hábil{quote.plazo !== 1 ? "es" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                <MapPin size={13} />
                Andreani · Entrega a domicilio
              </div>
            </div>
          )}

          {/* Botón continuar */}
          {quote && (
            <Button
              size="xl"
              className="mt-6 w-full gap-2 text-lg"
              onClick={() => onContinue(postalCode, quote)}
            >
              Continuar al pago <ArrowRight size={18} />
            </Button>
          )}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Resumen del pedido
            </h2>
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
              <span className={quote ? "font-medium text-zinc-900 dark:text-white" : "text-zinc-500"}>
                {quote ? formatPrice(quote.costo) : "Ingresá tu CP"}
              </span>
            </div>
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-700" />
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">Total</span>
              <span className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                {grandTotal !== null ? formatPrice(grandTotal) : formatPrice(total)}
              </span>
            </div>
            {grandTotal !== null && (
              <p className="mt-1 text-right text-xs text-zinc-400">productos + envío incluidos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Paso 2: Datos personales + pago ──────────────────────────────────────────

function PaymentStep({
  items,
  total,
  shipping,
  postalCode,
  onBack,
}: {
  items: CartItem[];
  total: number;
  shipping: ShippingQuote;
  postalCode: string;
  onBack: () => void;
}) {
  const grandTotal = total + shipping.costo;

  const [form, setForm] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode,
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
      const mpItems = [
        ...items.map((item) => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: "ARS",
        })),
        {
          id: "envio-andreani",
          title: `Envío Andreani a CP ${postalCode}`,
          quantity: 1,
          unit_price: shipping.costo,
          currency_id: "ARS",
        },
      ];

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-base text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Volver al envío
        </button>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="text-base font-medium text-zinc-900 dark:text-white">Pago</span>
      </div>

      {/* Indicador de paso */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-500 hover:border-zinc-500 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400"
        >
          1
        </button>
        <span className="text-base text-zinc-400 dark:text-zinc-600">Envío</span>
        <div className="h-px flex-1 bg-zinc-900 dark:bg-white" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
          2
        </div>
        <span className="font-medium text-zinc-900 dark:text-white">Datos y pago</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="mb-5 font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Datos de entrega
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
                  <CreditCard size={20} /> Pagar {formatPrice(grandTotal)} con MercadoPago
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Lock size={14} /> Pago seguro con MercadoPago · SSL encriptado
            </div>
          </form>
        </div>

        {/* Resumen */}
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
              <span className="text-zinc-600 dark:text-zinc-400">
                Envío Andreani · CP {postalCode}
                {shipping.plazo !== null && (
                  <span className="ml-1 text-xs text-zinc-400">
                    ({shipping.plazo} día{shipping.plazo !== 1 ? "s" : ""})
                  </span>
                )}
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {formatPrice(shipping.costo)}
              </span>
            </div>
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-700" />
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">Total</span>
              <span className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(grandTotal)}
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

// ── Página principal ──────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items } = useCartStore();
  const total = getCartTotal(items);

  const [step, setStep] = useState<1 | 2>(1);
  const [postalCode, setPostalCode] = useState("");
  const [shipping, setShipping] = useState<ShippingQuote | null>(null);

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

  if (step === 2 && shipping) {
    return (
      <PaymentStep
        items={items}
        total={total}
        shipping={shipping}
        postalCode={postalCode}
        onBack={() => setStep(1)}
      />
    );
  }

  return (
    <ShippingStep
      items={items}
      total={total}
      onContinue={(cp, quote) => {
        setPostalCode(cp);
        setShipping(quote);
        setStep(2);
      }}
    />
  );
}
