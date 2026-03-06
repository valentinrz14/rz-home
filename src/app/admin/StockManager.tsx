"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, RefreshCw, RotateCcw, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { StockOverrides } from "@/lib/amazon-stock";
import type { StockStatus } from "@/lib/stock-utils";

interface VariantDef {
  key: keyof StockOverrides;
  label: string;
  sub: string;
}

const VARIANTS: VariantDef[] = [
  { key: "doble_negro", label: "Doble motor — Negro", sub: "amazon.com/dp/B0DL58KZWN" },
  { key: "doble_blanco", label: "Doble motor — Blanco", sub: "amazon.com/dp/..." },
  { key: "simple_negro", label: "Motor simple — Negro", sub: "amazon.com/dp/B0DL589QC3" },
];

function StatusIcon({ value }: { value: boolean | null }) {
  if (value === true) return <CheckCircle2 size={15} className="shrink-0 text-green-400" />;
  if (value === false) return <AlertTriangle size={15} className="shrink-0 text-red-400" />;
  return <HelpCircle size={15} className="shrink-0 text-zinc-500" />;
}

function statusLabel(value: boolean | null) {
  if (value === true) return "En stock";
  if (value === false) return "Sin stock";
  return "Desconocido";
}

export function StockManager() {
  const [overrides, setOverrides] = useState<StockOverrides | null>(null);
  const [saving, setSaving] = useState<keyof StockOverrides | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastScraped, setLastScraped] = useState<StockStatus | null>(null);

  const fetchOverrides = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stock");
      if (!res.ok) throw new Error();
      setOverrides(await res.json());
    } catch {
      setError("No se pudieron cargar los overrides.");
    }
  }, []);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  async function triggerRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stock", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { ok: boolean; status: StockStatus };
      setLastScraped(data.status);
    } catch {
      setError("Error al actualizar stock desde Amazon.");
    } finally {
      setRefreshing(false);
    }
  }

  async function setOverride(variant: keyof StockOverrides, value: boolean | null) {
    setSaving(variant);
    setError(null);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant, value }),
      });
      if (!res.ok) throw new Error();
      setOverrides((prev) => (prev ? { ...prev, [variant]: value } : prev));
    } catch {
      setError("Error al guardar.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-white">Stock de estructuras</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap size={13} className={refreshing ? "animate-pulse" : ""} />
            {refreshing ? "Scrapeando…" : "Actualizar ahora"}
          </button>
          <button
            onClick={fetchOverrides}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <RefreshCw size={13} />
            Recargar
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-800 bg-red-900/20 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {VARIANTS.map(({ key, label, sub }) => {
          const current = overrides?.[key] ?? null;
          const isSaving = saving === key;

          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Info */}
              <div className="flex items-start gap-2.5">
                <StatusIcon value={current} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{label}</p>
                  <p className="text-xs text-zinc-600">{sub}</p>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-1.5">
                <span className="mr-2 text-xs text-zinc-600">
                  {overrides === null ? "…" : statusLabel(current)}
                  {current !== null && <span className="ml-1 text-brand-500">(manual)</span>}
                </span>

                {/* Auto (scraper) */}
                <button
                  type="button"
                  onClick={() => setOverride(key, null)}
                  disabled={isSaving || current === null}
                  title="Usar valor del scraper"
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    current === null
                      ? "border-brand-600 bg-brand-600/20 text-brand-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <RotateCcw size={11} />
                  Auto
                </button>

                {/* En stock */}
                <button
                  type="button"
                  onClick={() => setOverride(key, true)}
                  disabled={isSaving || current === true}
                  title="Forzar en stock"
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    current === true
                      ? "border-green-600 bg-green-600/20 text-green-400"
                      : "border-zinc-700 text-zinc-400 hover:border-green-800 hover:text-green-400"
                  }`}
                >
                  <CheckCircle2 size={11} />
                  En stock
                </button>

                {/* Sin stock */}
                <button
                  type="button"
                  onClick={() => setOverride(key, false)}
                  disabled={isSaving || current === false}
                  title="Forzar sin stock"
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    current === false
                      ? "border-red-600 bg-red-600/20 text-red-400"
                      : "border-zinc-700 text-zinc-400 hover:border-red-800 hover:text-red-400"
                  }`}
                >
                  <AlertTriangle size={11} />
                  Sin stock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lastScraped && (
        <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="mb-2 text-xs font-medium text-zinc-400">
            Resultado del scraper —{" "}
            {lastScraped.lastChecked
              ? new Date(lastScraped.lastChecked).toLocaleString("es-AR")
              : "—"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Doble — Negro", val: lastScraped.doble.negro },
              { label: "Doble — Blanco", val: lastScraped.doble.blanco },
              { label: "Simple — Negro", val: lastScraped.simple.negro },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2"
              >
                <StatusIcon value={val} />
                <div>
                  <p className="text-xs text-zinc-300">{label}</p>
                  <p className="text-xs text-zinc-500">{statusLabel(val)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-zinc-600">
        <span className="text-brand-500">Auto</span> usa el valor detectado por el cron (Amazon).
        Los overrides manuales tienen prioridad y persisten hasta que los cambies.
      </p>
    </section>
  );
}
