"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Building2,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MP_FEE } from "@/lib/products";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { CartItem, CheckoutFormData, ShippingQuote } from "@/types";
import type { PaymentMethod } from "@/types/orders";

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
                <Button
                  type="submit"
                  disabled={loading || postalCode.length !== 4}
                  className="shrink-0 gap-2"
                >
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
                          {quote.plazo} día{quote.plazo !== 1 ? "s" : ""} hábil
                          {quote.plazo !== 1 ? "es" : ""}
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
              <span
                className={quote ? "font-medium text-zinc-900 dark:text-white" : "text-zinc-500"}
              >
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

// ── Selector de método de pago ─────────────────────────────────────────────────

type SelectedMethod = "mercadopago" | PaymentMethod;

const CRYPTO_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "crypto_usdt_trc20", label: "USDT TRC-20" },
  { value: "crypto_usdt_polygon", label: "USDT Polygon" },
  { value: "crypto_ltc", label: "Litecoin (LTC)" },
];

const MP_INSTALLMENT_OPTIONS: { count: 1 | 3 | 6; label: string; fee: number }[] = [
  { count: 1, label: "1 pago", fee: MP_FEE.one_payment },
  { count: 3, label: "3 cuotas", fee: MP_FEE.three_cuotas },
  { count: 6, label: "6 cuotas", fee: MP_FEE.six_cuotas },
];

function PaymentMethodSelector({
  grandTotal,
  selected,
  onSelect,
  mpInstallments,
  onSelectMpInstallments,
  cryptoConversion,
  cryptoLoading,
}: {
  grandTotal: number;
  selected: SelectedMethod;
  onSelect: (method: SelectedMethod) => void;
  mpInstallments: 1 | 3 | 6;
  onSelectMpInstallments: (n: 1 | 3 | 6) => void;
  cryptoConversion: { amount: string; ticker: string } | null;
  cryptoLoading: boolean;
}) {
  const cryptoTotal = Math.round(grandTotal * 0.9);
  const isCrypto =
    selected === "crypto_usdt_trc20" ||
    selected === "crypto_usdt_polygon" ||
    selected === "crypto_ltc";

  const mpFee =
    mpInstallments === 3
      ? MP_FEE.three_cuotas
      : mpInstallments === 6
        ? MP_FEE.six_cuotas
        : MP_FEE.one_payment;
  const mpPrice = Math.round(grandTotal * (1 + mpFee));

  return (
    <div className="mb-6 space-y-3">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Método de pago</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Transferencia — precio base */}
        <button
          type="button"
          onClick={() => onSelect("transfer")}
          className={`rounded-xl border p-4 text-left transition ${
            selected === "transfer"
              ? "border-green-600 bg-green-600 text-white"
              : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
          }`}
        >
          <Building2
            size={20}
            className={`mb-2 ${selected === "transfer" ? "text-white" : "text-zinc-500"}`}
          />
          <p className="font-semibold text-sm">Transferencia</p>
          <p
            className={`text-xs mt-0.5 ${selected === "transfer" ? "text-green-100" : "text-green-600 dark:text-green-400"}`}
          >
            Precio base
          </p>
          <p className="mt-1.5 font-display text-base font-bold">{formatPrice(grandTotal)}</p>
        </button>

        {/* MercadoPago */}
        <button
          type="button"
          onClick={() => onSelect("mercadopago")}
          className={`rounded-xl border p-4 text-left transition ${
            selected === "mercadopago"
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
              : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
          }`}
        >
          <CreditCard
            size={20}
            className={`mb-2 ${selected === "mercadopago" ? "text-white dark:text-zinc-900" : "text-zinc-500"}`}
          />
          <p className="font-semibold text-sm">MercadoPago</p>
          <p
            className={`text-xs mt-0.5 ${selected === "mercadopago" ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}
          >
            {selected === "mercadopago"
              ? `${mpInstallments === 1 ? "1 pago" : `${mpInstallments} cuotas`} · +${Math.round(mpFee * 100)}%`
              : "Tarjeta / cuotas"}
          </p>
          <p className="mt-1.5 font-display text-base font-bold">{formatPrice(mpPrice)}</p>
        </button>

        {/* Cripto */}
        <button
          type="button"
          onClick={() => onSelect(isCrypto ? selected : "crypto_usdt_trc20")}
          className={`rounded-xl border p-4 text-left transition ${
            isCrypto
              ? "border-green-600 bg-green-600 text-white"
              : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
          }`}
        >
          <Bitcoin size={20} className={`mb-2 ${isCrypto ? "text-white" : "text-zinc-500"}`} />
          <p className="font-semibold text-sm">Cripto</p>
          <p
            className={`text-xs mt-0.5 ${isCrypto ? "text-green-100" : "text-green-600 dark:text-green-400"}`}
          >
            −10% descuento
          </p>
          <p className="mt-1.5 font-display text-base font-bold">{formatPrice(cryptoTotal)}</p>
        </button>
      </div>

      {/* Sub-selector de cuotas MP */}
      {selected === "mercadopago" && (
        <div className="flex gap-2 flex-wrap">
          {MP_INSTALLMENT_OPTIONS.map(({ count, label, fee }) => {
            const price = Math.round(grandTotal * (1 + fee));
            const isSelected = mpInstallments === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onSelectMpInstallments(count)}
                className={`flex flex-col items-start rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <span>{label}</span>
                <span className="font-bold mt-0.5">{formatPrice(price)}</span>
                {count > 1 && (
                  <span
                    className={isSelected ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-400"}
                  >
                    {count}x {formatPrice(Math.round(price / count))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-selector de cripto + cotización en tiempo real */}
      {isCrypto && (
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {CRYPTO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  selected === opt.value
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Cotización Ripio */}
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/40 dark:bg-green-950/30">
            {cryptoLoading ? (
              <Loader2 size={14} className="animate-spin text-green-600 dark:text-green-400" />
            ) : cryptoConversion ? (
              <>
                <span className="text-xs text-green-700 dark:text-green-400">
                  Equivalente a pagar:
                </span>
                <span className="font-mono text-sm font-bold text-green-800 dark:text-green-300">
                  {cryptoConversion.amount} {cryptoConversion.ticker}
                </span>
                <span className="ml-auto text-xs text-green-600 dark:text-green-500">
                  cotización Ripio
                </span>
              </>
            ) : (
              <span className="text-xs text-green-600 dark:text-green-400">
                No se pudo obtener cotización
              </span>
            )}
          </div>
        </div>
      )}
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
  const router = useRouter();
  const { clearCart } = useCartStore();
  const grandTotal = total + shipping.costo;

  const [selectedMethod, setSelectedMethod] = useState<SelectedMethod>("transfer");
  const [mpInstallments, setMpInstallments] = useState<1 | 3 | 6>(1);
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
  const [cryptoConversion, setCryptoConversion] = useState<{
    amount: string;
    ticker: string;
  } | null>(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);

  const isMercadoPago = selectedMethod === "mercadopago";
  const isTransfer = selectedMethod === "transfer";
  const isCrypto =
    selectedMethod === "crypto_usdt_trc20" ||
    selectedMethod === "crypto_usdt_polygon" ||
    selectedMethod === "crypto_ltc";

  const mpFee =
    mpInstallments === 3
      ? MP_FEE.three_cuotas
      : mpInstallments === 6
        ? MP_FEE.six_cuotas
        : MP_FEE.one_payment;

  const adjustedTotal = isMercadoPago
    ? Math.round(grandTotal * (1 + mpFee))
    : isCrypto
      ? Math.round(grandTotal * 0.9)
      : grandTotal; // transfer = precio base, sin ajuste

  // Cotización cripto en tiempo real desde Ripio
  useEffect(() => {
    if (!isCrypto) {
      setCryptoConversion(null);
      return;
    }
    let cancelled = false;
    setCryptoLoading(true);
    setCryptoConversion(null);
    fetch(`/api/ripio/rate?method=${selectedMethod}&amount=${adjustedTotal}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setCryptoConversion(data ?? null);
      })
      .catch(() => {
        if (!cancelled) setCryptoConversion(null);
      })
      .finally(() => {
        if (!cancelled) setCryptoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCrypto, selectedMethod, adjustedTotal]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleMercadoPago() {
    // Aplicar recargo de cuotas multiplicando cada precio
    const feeMult = 1 + mpFee;
    const mpItems = [
      ...items.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: Math.round(item.unitPrice * feeMult),
        currency_id: "ARS",
      })),
      {
        id: "envio-andreani",
        title: `Envío Andreani a CP ${postalCode}`,
        quantity: 1,
        unit_price: Math.round(shipping.costo * feeMult),
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
  }

  async function handleAlternativePayment() {
    const orderItems = [
      ...items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
      {
        title: `Envío Andreani a CP ${postalCode}`,
        quantity: 1,
        unit_price: shipping.costo,
      },
    ];

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerName: form.firstName,
        buyerLastName: form.lastName,
        buyerEmail: form.email,
        buyerPhone: form.phone,
        buyerAddress: `${form.address}, ${form.city}, ${form.province}`,
        postalCode: form.postalCode,
        items: orderItems,
        paymentMethod: selectedMethod,
        originalAmount: grandTotal,
        finalAmount: adjustedTotal,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Error al registrar el pedido.");
    }

    const { orderId } = await res.json();
    clearCart();
    router.push(
      `/checkout/pending?orderId=${orderId}&method=${selectedMethod}&amount=${adjustedTotal}`
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isMercadoPago) {
        await handleMercadoPago();
      } else {
        await handleAlternativePayment();
      }
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

            {/* Selector de método de pago */}
            <PaymentMethodSelector
              grandTotal={grandTotal}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
              mpInstallments={mpInstallments}
              onSelectMpInstallments={setMpInstallments}
              cryptoConversion={cryptoConversion}
              cryptoLoading={cryptoLoading}
            />

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
              ) : isMercadoPago ? (
                <>
                  <CreditCard size={20} /> Pagar {formatPrice(adjustedTotal)} con MercadoPago
                </>
              ) : (
                <>
                  Confirmar pedido · {formatPrice(adjustedTotal)}
                  <ArrowRight size={20} />
                </>
              )}
            </Button>

            {isMercadoPago && (
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                <Lock size={14} /> Pago seguro con MercadoPago · SSL encriptado
              </div>
            )}

            {isTransfer && (
              <p className="text-center text-xs text-zinc-400">
                Recibirás los datos bancarios en la siguiente pantalla.
              </p>
            )}

            {isCrypto && (
              <p className="text-center text-xs text-zinc-400">
                Recibirás la dirección de wallet en la siguiente pantalla. Precio con 10% de
                descuento.
              </p>
            )}
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

            {/* Recargo MP */}
            {isMercadoPago && (
              <>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal base</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>
                    Recargo MP ({mpInstallments === 1 ? "1 pago" : `${mpInstallments} cuotas`} · +
                    {Math.round(mpFee * 100)}%)
                  </span>
                  <span>+{formatPrice(adjustedTotal - grandTotal)}</span>
                </div>
                <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />
              </>
            )}

            {/* Descuento cripto */}
            {isCrypto && (
              <>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span className="line-through">{formatPrice(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Descuento cripto (−10%)</span>
                  <span className="text-green-600">−{formatPrice(grandTotal - adjustedTotal)}</span>
                </div>
                <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />
              </>
            )}

            <div className="flex justify-between">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">Total</span>
              <span className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(adjustedTotal)}
              </span>
            </div>

            {isMercadoPago && mpInstallments > 1 && (
              <p className="mt-1 text-right text-xs text-zinc-400">
                {mpInstallments} cuotas de {formatPrice(Math.round(adjustedTotal / mpInstallments))}{" "}
                c/u
              </p>
            )}

            {/* Equivalente cripto en sidebar */}
            {isCrypto && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/40 dark:bg-green-950/30">
                <span className="text-xs text-green-700 dark:text-green-400">
                  Equivalente cripto
                </span>
                {cryptoLoading ? (
                  <Loader2 size={13} className="animate-spin text-green-500" />
                ) : cryptoConversion ? (
                  <span className="font-mono text-sm font-bold text-green-800 dark:text-green-300">
                    {cryptoConversion.amount} {cryptoConversion.ticker}
                  </span>
                ) : (
                  <span className="text-xs text-green-500">—</span>
                )}
              </div>
            )}
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
