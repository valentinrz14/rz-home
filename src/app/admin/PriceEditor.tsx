"use client";

import { ChevronDown, Save } from "lucide-react";
import { useState } from "react";
import type { PricesConfig, PriceTier, SimplePriceTier } from "@/lib/prices";
import { TABLE_SIZES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { TABLE_SIZE } from "@/types";

interface Props {
  initialPrices: PricesConfig;
}

const SIMPLE_SIZES = TABLE_SIZES.filter((s) => s.id === TABLE_SIZE.S || s.id === TABLE_SIZE.M);

// ─── Inputs ────────────────────────────────────────────────────────────────────

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-40 text-sm text-zinc-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
          className="w-44 rounded-lg border border-zinc-700 bg-zinc-800 py-2 pl-7 pr-3 text-sm text-white focus:border-zinc-500 focus:outline-none"
        />
      </div>
      <span className="text-sm text-zinc-500">{formatPrice(value)}</span>
    </div>
  );
}

// ─── Doble motor tier ──────────────────────────────────────────────────────────

function DoubleTierColumns({
  transfer,
  mpOne,
  onChangeTransfer,
  onChangeMpOne,
}: {
  transfer: PriceTier;
  mpOne: PriceTier;
  onChangeTransfer: (t: PriceTier) => void;
  onChangeMpOne: (t: PriceTier) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {(
        [
          { label: "Transferencia / Cripto", tier: transfer, onChange: onChangeTransfer },
          { label: "MercadoPago 1 pago", tier: mpOne, onChange: onChangeMpOne },
        ] as const
      ).map(({ label, tier, onChange }) => (
        <div key={label} className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>

          <div>
            <p className="mb-2 text-xs text-zinc-500">Estructura sola</p>
            <PriceInput
              label="Doble motor"
              value={tier.structure}
              onChange={(v) => onChange({ ...tier, structure: v })}
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-zinc-500">Solo tapa</p>
            <div className="space-y-2">
              {TABLE_SIZES.map((size) => (
                <PriceInput
                  key={size.id}
                  label={size.label}
                  value={tier.tables[size.id]}
                  onChange={(v) => onChange({ ...tier, tables: { ...tier.tables, [size.id]: v } })}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-zinc-500">Escritorio completo</p>
            <div className="space-y-2">
              {TABLE_SIZES.map((size) => (
                <PriceInput
                  key={size.id}
                  label={size.label}
                  value={tier.bundles[size.id]}
                  onChange={(v) =>
                    onChange({ ...tier, bundles: { ...tier.bundles, [size.id]: v } })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Motor simple tier ─────────────────────────────────────────────────────────

function SimpleTierColumns({
  transfer,
  mpOne,
  onChangeTransfer,
  onChangeMpOne,
}: {
  transfer: SimplePriceTier;
  mpOne: SimplePriceTier;
  onChangeTransfer: (t: SimplePriceTier) => void;
  onChangeMpOne: (t: SimplePriceTier) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {(
        [
          { label: "Transferencia / Cripto", tier: transfer, onChange: onChangeTransfer },
          { label: "MercadoPago 1 pago", tier: mpOne, onChange: onChangeMpOne },
        ] as const
      ).map(({ label, tier, onChange }) => (
        <div key={label} className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>

          <div>
            <p className="mb-2 text-xs text-zinc-500">Estructura sola</p>
            <PriceInput
              label="Motor simple"
              value={tier.structure}
              onChange={(v) => onChange({ ...tier, structure: v })}
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-zinc-500">
              Escritorio completo{" "}
              <span className="text-zinc-600">(tapas compartidas con doble)</span>
            </p>
            <div className="space-y-2">
              {SIMPLE_SIZES.map((size) => (
                <PriceInput
                  key={size.id}
                  label={size.label}
                  value={tier.bundles[size.id as typeof TABLE_SIZE.S | typeof TABLE_SIZE.M]}
                  onChange={(v) =>
                    onChange({ ...tier, bundles: { ...tier.bundles, [size.id]: v } })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Acordeón ──────────────────────────────────────────────────────────────────

function AccordionSection({
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-semibold text-white">{title}</span>
          {badge && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-zinc-800 px-6 py-5">{children}</div>}
    </div>
  );
}

// ─── Editor principal ──────────────────────────────────────────────────────────

export function PriceEditor({ initialPrices }: Props) {
  const [prices, setPrices] = useState<PricesConfig>(initialPrices);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [openSection, setOpenSection] = useState<"doble" | "simple" | null>("doble");

  function toggle(section: "doble" | "simple") {
    setOpenSection((prev) => (prev === section ? null : section));
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
        <h2 className="font-display text-xl font-semibold text-white">Precios</h2>
        <button
          type="button"
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

      <div className="space-y-3">
        <AccordionSection
          title="Doble motor"
          badge="3 medidas"
          open={openSection === "doble"}
          onToggle={() => toggle("doble")}
        >
          <DoubleTierColumns
            transfer={prices.transfer}
            mpOne={prices.mp_one}
            onChangeTransfer={(t) => setPrices((p) => ({ ...p, transfer: t }))}
            onChangeMpOne={(t) => setPrices((p) => ({ ...p, mp_one: t }))}
          />
        </AccordionSection>

        <AccordionSection
          title="Motor simple"
          badge="2 medidas"
          open={openSection === "simple"}
          onToggle={() => toggle("simple")}
        >
          <SimpleTierColumns
            transfer={prices.simple_transfer}
            mpOne={prices.simple_mp}
            onChangeTransfer={(t) => setPrices((p) => ({ ...p, simple_transfer: t }))}
            onChangeMpOne={(t) => setPrices((p) => ({ ...p, simple_mp: t }))}
          />
        </AccordionSection>
      </div>
    </section>
  );
}
