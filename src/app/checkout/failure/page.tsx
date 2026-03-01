import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutFailurePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <XCircle size={40} className="text-red-500" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">
          El pago no fue procesado
        </h1>
        <p className="mt-3 text-zinc-500">
          Hubo un problema con tu pago. Por favor revisá los datos de tu tarjeta
          e intentá nuevamente.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/checkout">Reintentar pago</Link>
        </Button>
        <Button asChild>
          <Link href="/#contacto">Contactar soporte</Link>
        </Button>
      </div>
    </div>
  );
}
