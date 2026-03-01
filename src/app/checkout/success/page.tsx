"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, Mail } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle size={40} className="text-green-600" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-zinc-900">¡Pago exitoso!</h1>
        <p className="mt-3 text-zinc-500">
          Gracias por tu compra. Te enviamos un email de confirmación con los
          detalles de tu pedido.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-5 text-sm">
          <Mail size={24} className="text-zinc-400" />
          <p className="font-medium text-zinc-900">Email de confirmación</p>
          <p className="text-xs text-zinc-500">
            Revisá tu bandeja de entrada (y spam)
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-5 text-sm">
          <Package size={24} className="text-zinc-400" />
          <p className="font-medium text-zinc-900">Envío Andreani</p>
          <p className="text-xs text-zinc-500">
            Te avisamos cuando tu pedido sea despachado
          </p>
        </div>
      </div>

      <Button asChild size="lg">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
