import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutFailurePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <XCircle size={44} className="text-red-500 dark:text-red-400" />
      </div>
      <div>
        <h1 className="font-display text-4xl font-bold text-zinc-900 dark:text-white">
          Pago no procesado
        </h1>
        <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
          Revisá los datos de tu tarjeta e intentá nuevamente.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/checkout">Reintentar</Link>
        </Button>
        <Button asChild>
          <Link href="/#contacto">Contactar soporte</Link>
        </Button>
      </div>
    </div>
  );
}
