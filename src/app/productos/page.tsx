"use client";

import {
  Cable,
  CheckCircle2,
  ChevronDown,
  Gauge,
  Headphones,
  Package,
  Plug,
  Ruler,
  Settings,
  Shield,
  Volume2,
  Weight,
  Wrench,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { DersiteIllustration } from "@/components/products/DersiteIllustration";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import { STRUCTURE_COLORS, TABLE_COLORS } from "@/lib/products";
import type { ProductType, StructureColor, TableColor } from "@/types";

const DERSITE_SPECS = [
  { icon: Zap, label: "Motor", value: "Doble motor eléctrico independiente" },
  { icon: Ruler, label: "Rango de altura", value: "71 – 119 cm (ajustable)" },
  { icon: Weight, label: "Capacidad de carga", value: "120 kg (265 lbs)" },
  { icon: Gauge, label: "Velocidad", value: "38 mm/seg" },
  { icon: Volume2, label: "Nivel de ruido", value: "< 50 dB (ultra silencioso)" },
  { icon: Settings, label: "Memorias", value: "3 posiciones programables" },
  { icon: Shield, label: "Anticolisión", value: "Sí, sensibilidad configurable" },
  { icon: Plug, label: "Voltaje", value: "100V – 240V universal" },
  { icon: Ruler, label: "Ancho compatible de tapa", value: "110 – 183 cm" },
  { icon: Ruler, label: "Dimensiones estructura", value: "45 × 183 × 119 cm (max)" },
  { icon: Wrench, label: "Tiempo de armado", value: "~20 minutos" },
  { icon: Package, label: "Garantía", value: "12 meses estructura eléctrica" },
];

const DERSITE_FEATURES = [
  "Sistema de elevación doble motor eléctrico: ajuste suave, uniforme y rápido",
  "Operación ultra silenciosa — no interrumpe videollamadas ni reuniones",
  "Controlador con display digital: 3 memorias, switch cm/pulgadas",
  "Altura mín/máx configurable según preferencia personal",
  "Configurable según espesor de tu tapa para lectura de altura precisa",
  "Sensor anticolisión con niveles de sensibilidad ajustables",
  "Cambio de altura completo en segundos sin movimientos bruscos",
  "Doble motor = mayor capacidad de carga y mayor vida útil",
  "Compatible con tapas de 110 cm a 183 cm de ancho",
  "Incluye bandeja pasacables para organización del cableado",
  "Incluye gancho para auriculares",
  "Agujeros pre-perforados — armado fácil con herramientas incluidas",
  "Tornillería completa + llave Allen incluidas",
  "Instrucciones claras con piezas etiquetadas",
];

const TABLE_FEATURES = [
  "MDF alta densidad con 36mm de espesor total (doble capa)",
  "Terminación melamina premium resistente a rayones y humedad",
  "Tapacanto profesional de 0.45mm en los 4 bordes",
  "6 colores: Hickory, Roble Claro, Blanco, Gris Cemento, Nogal, Negro",
  "4 medidas: 120×60 · 140×70 · 150×70 · 160×80 cm",
  "Cortes a medida precisos con acabado de fábrica",
  "Lista para instalar sobre la estructura",
];

// ─── Acordeón para mobile ────────────────────────────────────────────────────
function FeatureAccordion({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Header: botón en mobile, estático en desktop */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between lg:pointer-events-none"
      >
        <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-zinc-900 dark:text-white">
          <Icon size={24} className="text-brand-600 dark:text-brand-400" />
          {title}
        </h3>
        <ChevronDown
          size={22}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 lg:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenido: colapsado en mobile, siempre visible en desktop */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out lg:!grid-rows-[1fr] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

// ─── Vista interactiva del producto ───────────────────────────────────────────
function ProductViewer({
  tipo,
  structureColor,
  tableColor,
}: {
  tipo: ProductType;
  structureColor: StructureColor;
  tableColor: TableColor;
}) {
  const [view, setView] = useState<"estructura" | "completo">(
    tipo === "tabla" ? "completo" : tipo === "estructura" ? "estructura" : "completo"
  );

  const tableColorHex = TABLE_COLORS.find((c) => c.id === tableColor)?.hex ?? "#9C6B3C";

  const tabs =
    tipo === "completo"
      ? [
          { id: "completo" as const, label: "Con tapa" },
          { id: "estructura" as const, label: "Sin tapa" },
        ]
      : tipo === "estructura"
        ? [{ id: "estructura" as const, label: "Vista frontal" }]
        : [{ id: "completo" as const, label: "Con tapa" }];

  return (
    <div className="rounded-2xl border border-zinc-100 bg-gradient-to-b from-zinc-50 to-white p-6 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
      {/* Tabs de vista */}
      {tabs.length > 1 && (
        <div className="mb-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                view === tab.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Ilustración SVG de la estructura */}
      <DersiteIllustration
        structureColor={structureColor}
        withTabletop={view === "completo"}
        tableColorHex={tableColorHex}
        className="w-full"
      />

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-zinc-400 dark:text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          Estructura: {STRUCTURE_COLORS.find((c) => c.id === structureColor)?.name}
        </span>
        {view === "completo" && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full border border-zinc-200 dark:border-zinc-700"
              style={{ backgroundColor: tableColorHex }}
            />
            Tapa: {TABLE_COLORS.find((c) => c.id === tableColor)?.name}
          </span>
        )}
        <span>Ilustración rz room</span>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const tipo = (searchParams.get("tipo") ?? "completo") as ProductType;

  // Estado compartido entre el viewer y el configurador
  const [structureColor, setStructureColor] = useState<StructureColor>("negro");
  const [tableColor, setTableColor] = useState<TableColor>("hickory");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-base text-zinc-500 dark:text-zinc-400">
        <a href="/" className="hover:text-zinc-900 dark:hover:text-white">
          Inicio
        </a>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-white">Productos</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Columna izquierda: visualizador interactivo */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ProductViewer tipo={tipo} structureColor={structureColor} tableColor={tableColor} />
        </div>

        {/* Columna derecha: título + configurador */}
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {tipo === "completo" && "Standing Desk Completo"}
            {tipo === "estructura" && "Estructura Doble Motor rz room"}
            {tipo === "tabla" && "Tapa de Escritorio Premium"}
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            {tipo === "completo" &&
              "Personalizá tu escritorio ideal: estructura doble motor rz room + tapa MDF 36mm. Elegí medida, colores y listo."}
            {tipo === "estructura" &&
              "Estructura regulable con doble motor silencioso. Controlador con 3 memorias, sensor anticolisión y bandeja pasacables."}
            {tipo === "tabla" &&
              "Tapa MDF alta densidad 36mm con melamina y tapacanto profesional en los 4 bordes."}
          </p>

          <div className="mt-6">
            <ProductConfigurator
              defaultType={tipo}
              onStructureColorChange={setStructureColor}
              onTableColorChange={setTableColor}
            />
          </div>
        </div>
      </div>

      {/* ─── Especificaciones técnicas ───────────────────────────────── */}
      <section className="mt-14 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <h2 className="font-display text-3xl font-bold text-zinc-900 dark:text-white">
          Especificaciones técnicas
        </h2>
        <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">
          Estructura eléctrica doble motor rz room — Especificaciones completas
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DERSITE_SPECS.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.label}
                className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <Icon size={22} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {spec.label}
                  </p>
                  <p className="text-base font-semibold text-zinc-900 dark:text-white">
                    {spec.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Características ─────────────────────────────────────────── */}
      <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <FeatureAccordion icon={Cable} title="Nuestra estructura">
          <ul className="mt-4 space-y-2">
            {DERSITE_FEATURES.map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2.5 text-base text-zinc-600 dark:text-zinc-400"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
                {feat}
              </li>
            ))}
          </ul>
        </FeatureAccordion>

        <FeatureAccordion icon={Package} title="Tapa MDF Premium">
          <ul className="mt-4 space-y-2">
            {TABLE_FEATURES.map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2.5 text-base text-zinc-600 dark:text-zinc-400"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
                {feat}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl bg-zinc-50 p-5 dark:bg-zinc-900">
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">
              ¿Qué incluye el paquete?
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { icon: Zap, text: "Estructura doble motor" },
                { icon: Settings, text: "Controlador con display" },
                { icon: Cable, text: "Bandeja pasacables" },
                { icon: Headphones, text: "Gancho para auriculares" },
                { icon: Wrench, text: "Tornillería + llave Allen" },
                { icon: Package, text: "Manual de instalación" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 text-base text-zinc-700 dark:text-zinc-300"
                  >
                    <Icon size={18} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>
        </FeatureAccordion>
      </section>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-96 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
