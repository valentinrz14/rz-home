"use client";

import { STRUCTURE_COLORS, TABLE_COLORS } from "@/lib/products";
import type { StructureColor, TableColor, TableSize } from "@/types";

interface Props {
  tableColor: TableColor;
  structureColor: StructureColor;
  tableSize: TableSize;
  showTable: boolean;
  showStructure: boolean;
}

export function DeskVisualizer({
  tableColor,
  structureColor,
  tableSize,
  showTable,
  showStructure,
}: Props) {
  const tColorHex = TABLE_COLORS.find((c) => c.id === tableColor)?.hex ?? "#9C6B3C";
  const sColorHex = STRUCTURE_COLORS.find((c) => c.id === structureColor)?.hex ?? "#1A1A1A";

  // Ancho proporcional al tamaño elegido
  const sizeWidths: Record<TableSize, number> = {
    "120x60": 240,
    "140x70": 280,
    "160x80": 320,
  };
  const tableWidth = sizeWidths[tableSize];
  const tableDepth = tableSize.includes("80") ? 80 : tableSize.includes("70") ? 70 : 60;
  // Representación 3/4 view: profundidad visual
  const tableVisualDepth = Math.round(tableDepth * 0.35);

  return (
    <div className="flex h-72 items-end justify-center">
      <svg
        viewBox={`0 0 ${tableWidth + 80} 280`}
        width="100%"
        height="100%"
        className="overflow-visible"
        aria-label={`Visualización del escritorio ${tableSize} cm`}
      >
        {/* Sombra en el suelo */}
        <ellipse
          cx={(tableWidth + 80) / 2}
          cy={265}
          rx={tableWidth / 2 + 10}
          ry={8}
          fill="rgba(0,0,0,0.06)"
        />

        {/* Patas (columnas) */}
        {showStructure && (
          <>
            {/* Pie izquierdo */}
            <rect x={40} y={180} width={20} height={80} rx={3} fill={sColorHex} opacity={0.9} />
            {/* Pie derecho */}
            <rect
              x={tableWidth + 20}
              y={180}
              width={20}
              height={80}
              rx={3}
              fill={sColorHex}
              opacity={0.9}
            />
            {/* Travesaño inferior */}
            <rect
              x={52}
              y={245}
              width={tableWidth - 4}
              height={10}
              rx={3}
              fill={sColorHex}
              opacity={0.8}
            />
            {/* Columnas verticales */}
            <rect x={47} y={145} width={12} height={40} rx={2} fill={sColorHex} opacity={0.75} />
            <rect
              x={tableWidth + 21}
              y={145}
              width={12}
              height={40}
              rx={2}
              fill={sColorHex}
              opacity={0.75}
            />
          </>
        )}

        {/* Tapa — vista 3/4 */}
        {showTable && (
          <>
            {/* Lado frontal (cara inferior visible) */}
            <rect
              x={30}
              y={140 + tableVisualDepth}
              width={tableWidth + 20}
              height={16}
              rx={2}
              fill={tColorHex}
              style={{ filter: "brightness(0.7)" }}
            />
            {/* Cara superior */}
            <rect
              x={30}
              y={140}
              width={tableWidth + 20}
              height={tableVisualDepth + 4}
              rx={2}
              fill={tColorHex}
            />
            {/* Lado derecho (perspectiva) */}
            <polygon
              points={`
                ${30 + tableWidth + 20},${140}
                ${30 + tableWidth + 20 + 14},${140 - 10}
                ${30 + tableWidth + 20 + 14},${140 + tableVisualDepth + 4 - 10}
                ${30 + tableWidth + 20},${140 + tableVisualDepth + 4}
              `}
              fill={tColorHex}
              style={{ filter: "brightness(0.85)" }}
            />
          </>
        )}

        {/* Panel de control (solo si hay estructura) */}
        {showStructure && (
          <rect
            x={tableWidth - 10}
            y={150}
            width={36}
            height={14}
            rx={4}
            fill={sColorHex === "#F0F0F0" ? "#CCCCCC" : "#333333"}
          />
        )}
      </svg>
    </div>
  );
}
