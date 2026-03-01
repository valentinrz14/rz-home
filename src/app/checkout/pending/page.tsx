import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPendingPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
        <Clock size={40} className="text-yellow-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Pago pendiente</h1>
        <p className="mt-3 text-zinc-500">
          Tu pago está siendo procesado. Te notificaremos por email cuando se
          confirme.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
