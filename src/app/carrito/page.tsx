"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const total = getCartTotal(items);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={64} className="text-zinc-200" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-zinc-500">
            Todavía no agregaste ningún producto.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/productos">
            <ArrowLeft size={16} />
            Ver productos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900">
        Tu carrito ({items.length}{" "}
        {items.length === 1 ? "producto" : "productos"})
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-4 rounded-xl border border-zinc-100 bg-white p-5"
              >
                {/* Ícono de producto */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <ShoppingBag size={24} className="text-zinc-400" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug text-zinc-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-lg font-bold text-zinc-900">
                    {formatPrice(item.unitPrice)}
                  </p>

                  <div className="mt-3 flex items-center gap-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="text-sm text-zinc-500">
                      Subtotal:{" "}
                      <span className="font-semibold text-zinc-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-zinc-400 transition-colors hover:text-red-500"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft size={14} />
              Seguir comprando
            </Link>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-zinc-100 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">
              Resumen del pedido
            </h2>

            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-zinc-600 line-clamp-1 flex-1 pr-2">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="font-medium text-zinc-900 shrink-0">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-zinc-100" />

            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Envío (Andreani)</span>
              <span className="text-zinc-500">A calcular</span>
            </div>

            <div className="my-4 border-t border-zinc-100" />

            <div className="flex justify-between">
              <span className="text-base font-semibold text-zinc-900">
                Total
              </span>
              <span className="text-xl font-bold text-zinc-900">
                {formatPrice(total)}
              </span>
            </div>

            <p className="mt-2 text-xs text-zinc-400">
              + costo de envío según destino
            </p>

            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href="/checkout">Finalizar compra</Link>
            </Button>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["Visa", "Mastercard", "Amex", "Naranja"].map((card) => (
                <span
                  key={card}
                  className="rounded-md border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium text-zinc-500"
                >
                  {card}
                </span>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">
              Pagá en cuotas sin interés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
