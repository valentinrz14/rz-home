"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import {
  TABLE_COLORS,
  TABLE_SIZES,
  STRUCTURE_COLORS,
  STRUCTURE_PRICE,
  TABLE_PRICES,
  BUNDLE_PRICES,
} from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import type {
  ProductType,
  TableSize,
  TableColor,
  StructureColor,
} from "@/types";

interface Props {
  defaultType?: ProductType;
}

export function ProductConfigurator({ defaultType = "completo" }: Props) {
  const [productType, setProductType] = useState<ProductType>(defaultType);
  const [tableSize, setTableSize] = useState<TableSize>("140x70");
  const [tableColor, setTableColor] = useState<TableColor>("hickory");
  const [structureColor, setStructureColor] = useState<StructureColor>("negro");
  const [added, setAdded] = useState(false);

  const { addItem } = useCartStore();

  const price =
    productType === "estructura"
      ? STRUCTURE_PRICE
      : productType === "tabla"
        ? TABLE_PRICES[tableSize]
        : BUNDLE_PRICES[tableSize];

  const INSTALLMENTS = 12;
  const installmentPrice = Math.ceil(price / INSTALLMENTS);

  function handleAdd() {
    addItem({
      type: productType,
      structureColor: productType !== "tabla" ? structureColor : undefined,
      tableSize: productType !== "estructura" ? tableSize : undefined,
      tableColor: productType !== "estructura" ? tableColor : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
              onClick={() => setProductType(opt.id)}
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
                onClick={() => setStructureColor(color.id)}
                title={color.name}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                  structureColor === color.id
                    ? "border-brand-500 scale-110"
                    : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {structureColor === color.id && (
                  <Check size={16} className={color.id === "blanco" ? "text-zinc-900" : "text-white"} />
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
            {TABLE_SIZES.map((size) => (
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
                  <span className={`mt-0.5 text-xs ${tableSize === size.id ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {formatPrice(size.price)}
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
                onClick={() => setTableColor(color.id)}
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
                        ["blanco", "roble-claro", "gris-cemento"].includes(color.id) ? "text-zinc-900" : "text-white"
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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Precio total</p>
            <p className="font-display text-4xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(price)}
            </p>
            <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
              ó {INSTALLMENTS} cuotas de{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                {formatPrice(installmentPrice)}
              </span>{" "}
              sin interés
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
