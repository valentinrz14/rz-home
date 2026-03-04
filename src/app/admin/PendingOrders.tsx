"use client";

import { Check, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PaymentMethod, PendingOrder } from "@/types/orders";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function methodLabel(m: PaymentMethod) {
  switch (m) {
    case "transfer":
      return "Transferencia";
    case "crypto_usdt_trc20":
      return "USDT TRC-20";
    case "crypto_usdt_polygon":
      return "USDT Polygon";
    case "crypto_ltc":
      return "Litecoin (LTC)";
  }
}

function formatARS(amount: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
}

export function PendingOrders({ whatsapp }: { whatsapp: string }) {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/pending");
      if (!res.ok) throw new Error("No se pudieron cargar las órdenes.");
      setOrders(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function confirmOrder(id: string) {
    setConfirming(id);
    try {
      const res = await fetch(`/api/orders/${id}/confirm`, { method: "POST" });
      if (!res.ok) throw new Error("Error al confirmar.");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "confirmed" as const } : o))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al confirmar.");
    } finally {
      setConfirming(null);
    }
  }

  function buildWaLink(order: PendingOrder) {
    if (!whatsapp) return null;
    const text = encodeURIComponent(
      `Hola ${order.buyerName}! Te escribimos de rz room sobre tu pedido ${order.id}. Ya confirmamos tu pago, pronto te enviamos la información de envío.`
    );
    return `https://wa.me/${order.buyerPhone?.replace(/\D/g, "")}?text=${text}`;
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold text-white">Órdenes</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <RefreshCw size={13} />
          Actualizar
        </button>
      </div>

      {/* Estados */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 size={14} className="animate-spin" /> Cargando órdenes...
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {!loading && !error && orders.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-500">
          No hay órdenes registradas.
        </div>
      )}

      {/* Cards */}
      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const isPending = order.status === "pending";
            const waLink = buildWaLink(order);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border p-4 transition ${
                  isPending ? "border-zinc-800 bg-zinc-900" : "border-zinc-800/50 bg-zinc-900/40"
                }`}
              >
                {/* Fila superior: ref + estado */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500">{order.id}</span>
                  {isPending ? (
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                      Pendiente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                      <Check size={12} /> Confirmado
                    </span>
                  )}
                </div>

                {/* Grilla de datos */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-600">Comprador</p>
                    <p className="text-sm font-medium text-zinc-200">
                      {order.buyerName} {order.buyerLastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Email</p>
                    <p className="truncate text-sm text-zinc-400">{order.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Método</p>
                    <p className="text-sm text-zinc-400">{methodLabel(order.paymentMethod)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">Monto</p>
                    <p className="text-sm font-bold text-zinc-200">
                      {formatARS(order.finalAmount)}
                    </p>
                    {order.cryptoAmount && order.cryptoTicker && (
                      <p className="mt-0.5 text-xs font-medium text-amber-400">
                        ≈ {order.cryptoAmount} {order.cryptoTicker}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fila inferior: fecha + acciones */}
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
                  <span className="text-xs text-zinc-600">{formatDate(order.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Contactar por WhatsApp"
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-green-700 hover:text-green-400"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    )}
                    {isPending && (
                      <button
                        onClick={() => confirmOrder(order.id)}
                        disabled={confirming === order.id}
                        className="flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
                      >
                        {confirming === order.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        Confirmar pago
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
