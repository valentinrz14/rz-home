import { Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPendingPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
        <Clock size={44} className="text-yellow-600 dark:text-yellow-400" />
      </div>
      <div>
        <h1 className="font-display text-4xl font-bold text-zinc-900 dark:text-white">
          Pago pendiente
        </h1>
        <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
          Tu pago está siendo procesado. Te notificamos por email cuando se confirme.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
