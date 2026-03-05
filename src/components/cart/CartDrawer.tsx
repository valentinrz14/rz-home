"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const total = getCartTotal(items);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeCart} />
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Tu carrito {items.length > 0 && <span className="text-zinc-400">({items.length})</span>}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <ShoppingBag size={56} className="text-zinc-200 dark:text-zinc-700" />
              <p className="text-base text-zinc-500 dark:text-zinc-400">Tu carrito está vacío</p>
              <Button variant="outline" size="sm" onClick={closeCart} asChild>
                <Link href="/products">View products</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 px-6 dark:divide-zinc-800">
              {items.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-base font-medium leading-snug text-zinc-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-base font-medium dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="ml-auto text-base text-zinc-500 dark:text-zinc-400">
                      Subtotal:{" "}
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
            <div className="mb-3 flex justify-between">
              <span className="text-base text-zinc-600 dark:text-zinc-400">Total</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(total)}
              </span>
            </div>
            <p className="mb-3 text-sm text-zinc-400">
              * Envío a calcular en el checkout (Andreani).
            </p>
            <Button className="w-full" size="lg" onClick={closeCart} asChild>
              <Link href="/checkout">Finalizar compra</Link>
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full text-zinc-500"
              size="sm"
              onClick={closeCart}
            >
              Seguir comprando
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
