"use client";

import { AlertTriangle, Check, Loader2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrices } from "@/hooks/usePrices";
import { useStock } from "@/hooks/useStock";
import { STRUCTURE_COLORS, TABLE_COLORS, TABLE_SIZES } from "@/lib/products";
import { isConfigOOS } from "@/lib/stock-utils";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { MotorType, ProductType, StructureColor, TableColor, TableSize } from "@/types";
import { TABLE_SIZE } from "@/types";

interface Props {
  defaultType?: ProductType;
  defaultMotor?: MotorType;
  onTypeChange?: (t: ProductType) => void;
  onMotorChange?: (m: MotorType) => void;
  onStructureColorChange?: (c: StructureColor) => void;
  onTableColorChange?: (c: TableColor) => void;
}

export function ProductConfigurator({
  defaultType = "completo",
  defaultMotor = "doble",
  onTypeChange,
  onMotorChange,
  onStructureColorChange,
  onTableColorChange,
}: Props) {
  const [productType, setProductType] = useState<ProductType>(defaultType);
  const [motorType, setMotorType] = useState<MotorType>(defaultMotor);
  const [tableSize, setTableSize] = useState<TableSize>(TABLE_SIZE.M);
  const [tableColor, setTableColor] = useState<TableColor>("hickory");
  const [structureColor, setStructureColor] = useState<StructureColor>("negro");
  const [added, setAdded] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [shipping, setShipping] = useState<{ costo: number; plazo: number | null } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Reset L size when switching to simple motor (only S and M available)
  useEffect(() => {
    if (motorType === "simple" && tableSize === TABLE_SIZE.L) {
      setTableSize(TABLE_SIZE.M);
    }
  }, [motorType, tableSize]);

  // Simple motor only comes in negro — reset if switching from doble blanco
  useEffect(() => {
    if (motorType === "simple" && structureColor === "blanco") {
      setStructureColor("negro");
      onStructureColorChange?.("negro");
    }
  }, [motorType, structureColor, onStructureColorChange]);

  const { addItem } = useCartStore();
  const prices = usePrices();
  const { stock } = useStock();

  const availableSizes =
    motorType === "simple" ? TABLE_SIZES.filter((s) => s.id !== TABLE_SIZE.L) : TABLE_SIZES;

  // Simple motor has no white structure option
  const availableStructureColors =
    motorType === "simple" ? STRUCTURE_COLORS.filter((c) => c.id !== "blanco") : STRUCTURE_COLORS;

  // Stock check for current config
  const currentConfigOOS = isConfigOOS(stock, motorType, structureColor, productType);

  const config = {
    type: productType,
    motorType,
    structureColor: productType !== "tabla" ? structureColor : undefined,
    tableSize: productType !== "estructura" ? tableSize : undefined,
    tableColor: productType !== "estructura" ? tableColor : undefined,
  };

  const price = getProductPrice(config, prices.transfer);

  // Reset shipping estimate when product config changes
  useEffect(() => {
    setShipping(null);
    setShippingError(null);
  }, [productType, motorType, tableSize]);

  function handleAdd() {
    addItem(config, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function handleCalculateShipping() {
    if (!/^\d{4}$/.test(postalCode)) {
      setShippingError("El código postal debe tener 4 dígitos.");
      return;
    }
    setShippingLoading(true);
    setShippingError(null);
    try {
      const res = await fetch("/api/andreani/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoPostal: postalCode,
          items: [
            {
              type: productType,
              motorType,
              size: productType !== "estructura" ? tableSize : undefined,
              quantity: 1,
              unitPrice: price,
            },
          ],
        }),
      });
      const data = (await res.json()) as { costo?: number; plazo?: number | null; error?: string };
      if (!res.ok) {
        setShippingError(data.error ?? "No se pudo calcular el costo de envío.");
      } else {
        setShipping({ costo: data.costo!, plazo: data.plazo ?? null });
      }
    } catch {
      setShippingError("No se pudo calcular el costo de envío.");
    } finally {
      setShippingLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Motor type */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Tipo de motor
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "doble", label: "Doble motor", sub: "120 kg · <50 dB" },
              { id: "simple", label: "Motor simple", sub: "80 kg · ≤55 dB" },
            ] as { id: MotorType; label: string; sub: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setMotorType(opt.id);
                onMotorChange?.(opt.id);
              }}
              className={`flex flex-col items-center rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                motorType === opt.id
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <span className="font-semibold">{opt.label}</span>
              <span
                className={`mt-0.5 text-xs ${motorType === opt.id ? "opacity-60" : "text-zinc-400 dark:text-zinc-500"}`}
              >
                {opt.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de producto */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          ¿Qué querés comprar?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "completo", label: "Escritorio completo" },
              { id: "estructura", label: "Solo estructura" },
              { id: "tabla", label: "Solo tapa" },
            ] as { id: ProductType; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setProductType(opt.id);
                onTypeChange?.(opt.id);
              }}
              className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                productType === opt.id
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color de estructura */}
      {productType !== "tabla" && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Color de estructura
          </label>
          <div className="flex gap-3">
            {availableStructureColors.map((color) => {
              const colorOOS =
                motorType === "doble" && stock?.doble[color.id as "negro" | "blanco"] === false;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => {
                    if (colorOOS) return;
                    setStructureColor(color.id);
                    onStructureColorChange?.(color.id);
                  }}
                  title={colorOOS ? `${color.name} — Sin stock` : color.name}
                  disabled={colorOOS}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                    colorOOS
                      ? "cursor-not-allowed opacity-40"
                      : structureColor === color.id
                        ? "border-brand-500 scale-110"
                        : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {structureColor === color.id && !colorOOS && (
                    <Check
                      size={16}
                      className={color.id === "blanco" ? "text-zinc-900" : "text-white"}
                    />
                  )}
                  {colorOOS && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-red-500">✕</span>
                    </span>
                  )}
                </button>
              );
            })}
            <span className="ml-2 flex items-center text-base font-medium text-zinc-700 dark:text-zinc-300">
              {availableStructureColors.find((c) => c.id === structureColor)?.name}
            </span>
          </div>
        </div>
      )}

      {/* Medida de tapa */}
      {productType !== "estructura" && (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Medida de la tapa
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setTableSize(size.id)}
                className={`flex flex-col items-center rounded-lg border px-3 py-3 text-sm transition-all ${
                  tableSize === size.id
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                <span className="font-semibold">{size.label}</span>
                {productType === "tabla" && (
                  <span
                    className={`mt-0.5 text-xs ${tableSize === size.id ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`}
                  >
                    {formatPrice(prices.transfer.tables[size.id])}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color de tapa */}
      {productType !== "estructura" && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Color de la tapa
          </label>
          <div className="flex flex-wrap gap-3">
            {TABLE_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => {
                  setTableColor(color.id);
                  onTableColorChange?.(color.id);
                }}
                title={color.name}
                className={`relative h-10 w-10 rounded-full border-2 transition-all ${
                  tableColor === color.id
                    ? "border-brand-500 scale-110"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {tableColor === color.id && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      size={14}
                      className={
                        ["blanco", "roble-claro", "gris-cemento"].includes(color.id)
                          ? "text-zinc-900"
                          : "text-white"
                      }
                    />
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-base font-medium text-zinc-700 dark:text-zinc-300">
            {TABLE_COLORS.find((c) => c.id === tableColor)?.name}
          </p>
        </div>
      )}

      {/* Precio y CTA */}
      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Transferencia bancaria</p>
        <p className="font-display text-4xl font-bold text-zinc-900 dark:text-white">
          {formatPrice(price)}
        </p>

        {/* Shipping estimator */}
        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Envío Andreani
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={postalCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPostalCode(val);
                if (shipping ?? shippingError) {
                  setShipping(null);
                  setShippingError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCalculateShipping();
              }}
              placeholder="Código postal"
              maxLength={4}
              className="h-9 w-36 rounded-lg border border-zinc-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-400"
            />
            <button
              type="button"
              onClick={() => void handleCalculateShipping()}
              disabled={shippingLoading || postalCode.length !== 4}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {shippingLoading ? <Loader2 size={14} className="animate-spin" /> : "Calcular"}
            </button>
          </div>
          {shipping && (
            <p className="mt-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              + {formatPrice(shipping.costo)}
              {shipping.plazo !== null && (
                <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                  · {shipping.plazo} días hábiles
                </span>
              )}
            </p>
          )}
          {shippingError && (
            <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{shippingError}</p>
          )}
        </div>

        {currentConfigOOS && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/40 dark:bg-red-950/30">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Este color está <strong>sin stock</strong> en este momento. Elegí otro color o
              escribinos por WhatsApp para anotarte en lista de espera.
            </p>
          </div>
        )}

        <Button
          size="lg"
          className="mt-4 w-full gap-2 text-lg"
          onClick={handleAdd}
          disabled={currentConfigOOS}
        >
          {added ? (
            <>
              <Check size={20} /> ¡Agregado al carrito!
            </>
          ) : (
            <>
              <ShoppingCart size={20} /> Agregar al carrito
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
