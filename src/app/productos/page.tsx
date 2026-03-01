"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import { DeskVisualizer } from "@/components/products/DeskVisualizer";
import { DESK_SPECS } from "@/lib/products";
import type { ProductType, TableColor, StructureColor, TableSize } from "@/types";

function ProductsContent() {
  const searchParams = useSearchParams();
  const tipo = (searchParams.get("tipo") ?? "completo") as ProductType;

  const [tableColor, setTableColor] = useState<TableColor>("hickory");
  const [structureColor, setStructureColor] = useState<StructureColor>("negro");
  const [tableSize, setTableSize] = useState<TableSize>("140x70");
  const [productType, setProductType] = useState<ProductType>(tipo);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-zinc-500">
        <a href="/" className="hover:text-zinc-900">Inicio</a>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">Productos</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Columna izquierda: visualizador */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-zinc-50 p-8">
            <DeskVisualizer
              tableColor={tableColor}
              structureColor={structureColor}
              tableSize={tableSize}
              showTable={productType !== "estructura"}
              showStructure={productType !== "tabla"}
            />
            <div className="mt-4 text-center text-xs text-zinc-400">
              Vista previa ilustrativa
            </div>
          </div>

          {/* Especificaciones técnicas */}
          <div className="mt-6 rounded-2xl border border-zinc-100 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">
              Especificaciones técnicas
            </h3>
            <dl className="space-y-2.5">
              {[
                {
                  label: "Rango de altura",
                  value: `${DESK_SPECS.heightRange.min} – ${DESK_SPECS.heightRange.max} cm`,
                },
                { label: "Capacidad de carga", value: `${DESK_SPECS.weightCapacity} kg` },
                { label: "Motores", value: `${DESK_SPECS.motors} motores independientes` },
                { label: "Nivel de ruido", value: `< ${DESK_SPECS.noiseLevel} dB` },
                { label: "Memorias", value: `${DESK_SPECS.memoryPresets} posiciones` },
                { label: "Anticolisión", value: "Sí, detección automática" },
                { label: "Velocidad", value: `${DESK_SPECS.speed} mm/seg` },
                {
                  label: "Espesor de tapa",
                  value: `${DESK_SPECS.tableThickness} mm MDF alta densidad`,
                },
                { label: "Garantía estructura", value: `${DESK_SPECS.warranty} meses` },
              ].map((spec) => (
                <div key={spec.label} className="flex justify-between">
                  <dt className="text-xs text-zinc-500">{spec.label}</dt>
                  <dd className="text-xs font-medium text-zinc-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Columna derecha: configurador */}
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900">
            {productType === "completo" && "Standing Desk Completo"}
            {productType === "estructura" && "Estructura Doble Motor"}
            {productType === "tabla" && "Tapa de Escritorio Premium"}
          </h1>
          <p className="mb-8 text-zinc-500">
            {productType === "completo" &&
              "Personalizá tu escritorio ideal: elegí medida, color de tapa y color de estructura."}
            {productType === "estructura" &&
              "Estructura regulable con doble motor silencioso. Compatible con tapas de 120 cm a 220 cm de ancho."}
            {productType === "tabla" &&
              "Tapa de MDF alta densidad 36mm con tapacanto profesional. Disponible en 4 medidas y 6 colores."}
          </p>

          <ProductConfigurator
            defaultType={productType}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
