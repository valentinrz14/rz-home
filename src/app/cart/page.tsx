"use client";

import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const total = getCartTotal(items);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4">
        <ShoppingBag size={72} className="text-zinc-200 dark:text-zinc-700" />
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-white">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            Todavía no agregaste ningún producto.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/products">
            <ArrowLeft size={18} /> Ver productos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Tu carrito ({items.length} {items.length === 1 ? "producto" : "productos"})
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-4 rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <ShoppingBag size={26} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-zinc-900 dark:text-white">{item.name}</p>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
                    {formatPrice(item.unitPrice)}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-base font-medium dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-base text-zinc-500 dark:text-zinc-400">
                      Subtotal:{" "}
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-zinc-400 transition-colors hover:text-red-500"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-base text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} /> Seguir comprando
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Resumen</h2>
            <div className="space-y-2 text-base">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-zinc-600 line-clamp-1 flex-1 pr-2 dark:text-zinc-400">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-zinc-900 shrink-0 dark:text-white">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />
            <div className="flex justify-between text-base">
              <span className="text-zinc-600 dark:text-zinc-400">Envío (Andreani)</span>
              <span className="text-zinc-500 dark:text-zinc-400">A calcular</span>
            </div>
            <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">Total</span>
              <span className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(total)}
              </span>
            </div>
            <Button size="lg" className="mt-5 w-full text-base" asChild>
              <Link href="/checkout">Finalizar compra</Link>
            </Button>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {["Visa", "Mastercard", "Amex", "Naranja"].map((card) => (
                <span
                  key={card}
                  className="rounded-md border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {card}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
