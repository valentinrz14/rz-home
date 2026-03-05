"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrices } from "@/hooks/usePrices";
import { STRUCTURE_COLORS, TABLE_COLORS, TABLE_SIZES } from "@/lib/products";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { MotorType, ProductType, StructureColor, TableColor, TableSize } from "@/types";

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
  const [tableSize, setTableSize] = useState<TableSize>("140x70");
  const [tableColor, setTableColor] = useState<TableColor>("hickory");
  const [structureColor, setStructureColor] = useState<StructureColor>("negro");
  const [added, setAdded] = useState(false);

  // Reset 160x80 when switching to simple motor (only 120x60 and 140x70 available)
  useEffect(() => {
    if (motorType === "simple" && tableSize === "160x80") {
      setTableSize("140x70");
    }
  }, [motorType, tableSize]);

  const { addItem } = useCartStore();
  const prices = usePrices();

  const availableSizes =
    motorType === "simple" ? TABLE_SIZES.filter((s) => s.id !== "160x80") : TABLE_SIZES;

  const config = {
    type: productType,
    motorType,
    structureColor: productType !== "tabla" ? structureColor : undefined,
    tableSize: productType !== "estructura" ? tableSize : undefined,
    tableColor: productType !== "estructura" ? tableColor : undefined,
  };

  const price = getProductPrice(config, prices.transfer);

  function handleAdd() {
    addItem(config, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
            {STRUCTURE_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  setStructureColor(color.id);
                  onStructureColorChange?.(color.id);
                }}
                title={color.name}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                  structureColor === color.id
                    ? "border-brand-500 scale-110"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {structureColor === color.id && (
                  <Check
                    size={16}
                    className={color.id === "blanco" ? "text-zinc-900" : "text-white"}
                  />
                )}
              </button>
            ))}
            <span className="ml-2 flex items-center text-base font-medium text-zinc-700 dark:text-zinc-300">
              {STRUCTURE_COLORS.find((c) => c.id === structureColor)?.name}
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
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Transferencia bancaria</p>
            <p className="font-display text-4xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(price)}
            </p>
          </div>
          <div className="text-right text-sm text-zinc-400">
            <p>+ envío Andreani</p>
            <p>a calcular</p>
          </div>
        </div>

        <Button size="lg" className="mt-4 w-full gap-2 text-lg" onClick={handleAdd}>
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
