"use client";

import { Check, Filter, Loader2, MessageCircle, RefreshCw, X } from "lucide-react";
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

/** "YYYY-MM-DD" in local time, compatible with <input type="date"> */
function toLocalDateValue(d: Date) {
  return d.toLocaleDateString("en-CA"); // en-CA always formats as YYYY-MM-DD
}

function applyFilters(
  orders: PendingOrder[],
  filterDate: string,
  filterFrom: string,
  filterTo: string
) {
  return orders.filter((order) => {
    const d = new Date(order.createdAt);

    if (filterDate && toLocalDateValue(d) !== filterDate) return false;

    if (filterFrom) {
      const parts = filterFrom.split(":").map(Number);
      const [fh, fm] = [parts[0] ?? 0, parts[1] ?? 0];
      if (d.getHours() < fh || (d.getHours() === fh && d.getMinutes() < fm)) return false;
    }

    if (filterTo) {
      const parts = filterTo.split(":").map(Number);
      const [th, tm] = [parts[0] ?? 23, parts[1] ?? 59];
      if (d.getHours() > th || (d.getHours() === th && d.getMinutes() > tm)) return false;
    }

    return true;
  });
}

export function PendingOrders({ whatsapp }: { whatsapp: string }) {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Filtros ────────────────────────────────────────────────────
  const [filterDate, setFilterDate] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const hasFilter = filterDate !== "" || filterFrom !== "" || filterTo !== "";

  function clearFilters() {
    setFilterDate("");
    setFilterFrom("");
    setFilterTo("");
  }

  function setToday() {
    setFilterDate(toLocalDateValue(new Date()));
    setFilterFrom("");
    setFilterTo("");
  }

  function setYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setFilterDate(toLocalDateValue(d));
    setFilterFrom("");
    setFilterTo("");
  }

  // ─── Fetch ──────────────────────────────────────────────────────
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

  const filteredOrders = applyFilters(orders, filterDate, filterFrom, filterTo);
  const pendingCount = filteredOrders.filter((o) => o.status === "pending").length;

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
          {hasFilter && (
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
              {filteredOrders.length} de {orders.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <RefreshCw size={13} />
          Actualizar
        </button>
      </div>

      {/* ─── Filtros ──────────────────────────────────────────────── */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <Filter size={13} className="text-zinc-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Filtrar
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Accesos rápidos */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={setToday}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                filterDate === toLocalDateValue(new Date()) && !filterFrom && !filterTo
                  ? "border-brand-600 bg-brand-600/20 text-brand-400"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={setYesterday}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                filterDate === toLocalDateValue(new Date(Date.now() - 86_400_000)) &&
                !filterFrom &&
                !filterTo
                  ? "border-brand-600 bg-brand-600/20 text-brand-400"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              Ayer
            </button>
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-600">Día</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-600 [color-scheme:dark]"
            />
          </div>

          {/* Hora desde */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-600">Desde</label>
            <input
              type="time"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-600 [color-scheme:dark]"
            />
          </div>

          {/* Hora hasta */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-600">Hasta</label>
            <input
              type="time"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-600 [color-scheme:dark]"
            />
          </div>

          {/* Limpiar */}
          {hasFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
            >
              <X size={12} />
              Limpiar
            </button>
          )}
        </div>
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
      {!loading && !error && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-500">
          Ninguna orden coincide con el filtro aplicado.
        </div>
      )}

      {/* Cards */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
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
                        type="button"
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
