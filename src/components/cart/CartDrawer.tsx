"use client";

import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, getCartTotal } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } =
    useCartStore();
  const total = getCartTotal(items);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            Tu carrito{" "}
            {items.length > 0 && (
              <span className="text-zinc-400">({items.length})</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <ShoppingBag size={48} className="text-zinc-200" />
              <p className="text-sm text-zinc-500">Tu carrito está vacío</p>
              <Button
                variant="outline"
                size="sm"
                onClick={closeCart}
                asChild
              >
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 px-6">
              {items.map((item) => (
                <li key={item.id} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-snug text-zinc-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-900">
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity */}
                  <div className="mt-3 flex items-center gap-3">
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
                    <span className="ml-auto text-sm text-zinc-500">
                      Subtotal:{" "}
                      <span className="font-medium text-zinc-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer con total y CTA */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 px-6 py-6">
            <div className="mb-4 flex justify-between">
              <span className="text-sm text-zinc-600">Total</span>
              <span className="text-lg font-bold text-zinc-900">
                {formatPrice(total)}
              </span>
            </div>
            <p className="mb-4 text-xs text-zinc-400">
              * Envío a calcular en el checkout según destino (Andreani).
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={closeCart}
              asChild
            >
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
