"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { PricesConfig, PriceTier } from "@/lib/prices";
import { TABLE_SIZES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

interface Props {
  initialPrices: PricesConfig;
}

type TierKey = keyof PricesConfig;

const TIER_LABELS: Record<TierKey, string> = {
  transfer: "Transferencia / Cripto",
  mp_one: "MercadoPago 1 pago",
  mp_cuotas: "MercadoPago 3 cuotas",
  mp_6: "MercadoPago 6 cuotas",
};

function TierEditor({
  label,
  tier,
  onChange,
}: {
  label: string;
  tier: PriceTier;
  onChange: (next: PriceTier) => void;
}) {
  function updateStructure(value: string) {
    const num = Number(value);
    if (!isNaN(num)) onChange({ ...tier, structure: num });
  }

  function updateTable(size: string, value: string) {
    const num = Number(value);
    if (!isNaN(num)) onChange({ ...tier, tables: { ...tier.tables, [size]: num } });
  }

  function updateBundle(size: string, value: string) {
    const num = Number(value);
    if (!isNaN(num)) onChange({ ...tier, bundles: { ...tier.bundles, [size]: num } });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="font-display text-base font-semibold text-white">{label}</h3>

      {/* Estructura */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Estructura sola
        </p>
        <div className="flex items-center gap-3">
          <label className="w-40 text-sm text-zinc-300">Doble motor</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              $
            </span>
            <input
              type="number"
              value={tier.structure}
              onChange={(e) => updateStructure(e.target.value)}
              className="w-44 rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-7 pr-3 text-sm text-white focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <span className="text-sm text-zinc-500">{formatPrice(tier.structure)}</span>
        </div>
      </div>

      {/* Tapas */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Solo tapa (por medida)
        </p>
        <div className="space-y-2">
          {TABLE_SIZES.map((size) => (
            <div key={size.id} className="flex items-center gap-3">
              <label className="w-40 font-mono text-sm text-zinc-300">{size.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  $
                </span>
                <input
                  type="number"
                  value={tier.tables[size.id]}
                  onChange={(e) => updateTable(size.id, e.target.value)}
                  className="w-44 rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-7 pr-3 text-sm text-white focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <span className="text-sm text-zinc-500">{formatPrice(tier.tables[size.id])}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bundles */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Escritorio completo (estructura + tapa)
        </p>
        <div className="space-y-2">
          {TABLE_SIZES.map((size) => (
            <div key={size.id} className="flex items-center gap-3">
              <label className="w-40 font-mono text-sm text-zinc-300">{size.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  $
                </span>
                <input
                  type="number"
                  value={tier.bundles[size.id]}
                  onChange={(e) => updateBundle(size.id, e.target.value)}
                  className="w-44 rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-7 pr-3 text-sm text-white focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <span className="text-sm text-zinc-500">{formatPrice(tier.bundles[size.id])}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PriceEditor({ initialPrices }: Props) {
  const [prices, setPrices] = useState<PricesConfig>(initialPrices);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");

  function updateTier(key: TierKey, tier: PriceTier) {
    setPrices((p) => ({ ...p, [key]: tier }));
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prices),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-white">Editar precios</h2>
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          <Save size={15} />
          {status === "saving" ? "Guardando..." : "Guardar precios"}
        </button>
      </div>

      {status === "ok" && (
        <p className="mb-4 rounded-xl border border-green-800 bg-green-950/40 px-4 py-2 text-sm text-green-400">
          Precios actualizados correctamente.
        </p>
      )}
      {status === "error" && (
        <p className="mb-4 rounded-xl border border-red-800 bg-red-950/40 px-4 py-2 text-sm text-red-400">
          Error al guardar. Intentá de nuevo.
        </p>
      )}

      <div className="space-y-4">
        {(Object.keys(TIER_LABELS) as TierKey[]).map((key) => (
          <TierEditor
            key={key}
            label={TIER_LABELS[key]}
            tier={prices[key]}
            onChange={(next) => updateTier(key, next)}
          />
        ))}
      </div>
    </section>
  );
}
