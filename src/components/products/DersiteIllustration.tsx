import { TABLE_COLORS } from "@/lib/products";

const DEFAULT_TABLE_COLOR_HEX = TABLE_COLORS.find((c) => c.id === "hickory")!.hex;

interface Props {
  structureColor?: "blanco" | "negro";
  /** Mostrar la tapa sobre la estructura */
  withTabletop?: boolean;
  /** Mostrar la estructura (columnas, bases, panel). false = solo tapa */
  withStructure?: boolean;
  tableColorHex?: string;
  className?: string;
}

/**
 * Ilustración vectorial de la estructura doble motor rz room.
 * Reproduce: base en T, columnas duales 3 etapas,
 * travesaño central, panel de control, bandeja pasacables y gancho.
 */
export function DersiteIllustration({
  structureColor = "negro",
  withTabletop = false,
  withStructure = true,
  tableColorHex = DEFAULT_TABLE_COLOR_HEX,
  className = "",
}: Props) {
  const isWhite = structureColor === "blanco";

  // Paleta
  const frameMain = isWhite ? "#E8E8E8" : "#2A2A2A";
  const frameDark = isWhite ? "#C8C8C8" : "#1A1A1A";
  const frameLight = isWhite ? "#F5F5F5" : "#3D3D3D";
  const frameMid = isWhite ? "#DADADA" : "#232323";
  const panelBg = isWhite ? "#D0D0D0" : "#111111";
  const displayBg = isWhite ? "#B8DDD0" : "#0A2520";
  const displayText = isWhite ? "#1A6050" : "#00FF9D";
  const screw = isWhite ? "#BBBBBB" : "#444444";
  const shadow = "rgba(0,0,0,0.18)";

  // Cuando se muestra solo la tapa, recortamos el viewBox a esa área
  const viewBox = withStructure ? "0 0 520 560" : "30 8 470 75";

  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Estructura Doble Motor rz room"
    >
      {withStructure && (
        <>
          {/* ── Sombra suelo ────────────────────────────────────── */}
          <ellipse cx="260" cy="548" rx="180" ry="12" fill={shadow} />

          {/* ════════════════════════════════════════════════════════
              BASE IZQUIERDA (pie en T)
          ════════════════════════════════════════════════════════ */}
          {/* Pie horizontal */}
          <rect x="30" y="520" width="140" height="18" rx="4" fill={frameDark} />
          {/* Alzado vertical del pie */}
          <rect x="86" y="480" width="28" height="44" rx="3" fill={frameMain} />
          {/* Tapas metálicas */}
          <rect x="80" y="519" width="40" height="5" rx="2" fill={frameMid} />
          <rect x="80" y="480" width="40" height="6" rx="2" fill={frameLight} />
          {/* Tornillos */}
          <circle cx="45" cy="529" r="4" fill={screw} />
          <circle cx="155" cy="529" r="4" fill={screw} />

          {/* ════════════════════════════════════════════════════════
              BASE DERECHA (pie en T)
          ════════════════════════════════════════════════════════ */}
          <rect x="350" y="520" width="140" height="18" rx="4" fill={frameDark} />
          <rect x="406" y="480" width="28" height="44" rx="3" fill={frameMain} />
          <rect x="400" y="519" width="40" height="5" rx="2" fill={frameMid} />
          <rect x="400" y="480" width="40" height="6" rx="2" fill={frameLight} />
          <circle cx="365" cy="529" r="4" fill={screw} />
          <circle cx="475" cy="529" r="4" fill={screw} />

          {/* ════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA — 3 etapas telescópicas
          ════════════════════════════════════════════════════════ */}
          {/* Etapa 1 — base, más gruesa */}
          <rect x="74" y="310" width="52" height="175" rx="5" fill={frameMain} />
          <rect x="74" y="310" width="52" height="8" rx="3" fill={frameLight} />
          <rect x="74" y="479" width="52" height="8" rx="3" fill={frameMid} />
          {/* Ranuras laterales etapa 1 */}
          <rect x="76" y="330" width="3" height="140" rx="1.5" fill={frameDark} opacity="0.5" />
          <rect x="121" y="330" width="3" height="140" rx="1.5" fill={frameLight} opacity="0.5" />

          {/* Etapa 2 — intermedia */}
          <rect x="80" y="160" width="40" height="160" rx="4" fill={frameMid} />
          <rect x="80" y="160" width="40" height="6" rx="3" fill={frameLight} />
          <rect x="80" y="313" width="40" height="6" rx="3" fill={frameDark} />
          <rect x="82" y="180" width="2" height="120" rx="1" fill={frameDark} opacity="0.4" />
          <rect x="116" y="180" width="2" height="120" rx="1" fill={frameLight} opacity="0.4" />

          {/* Etapa 3 — superior, más delgada */}
          <rect x="85" y="50" width="30" height="120" rx="3" fill={frameLight} />
          <rect x="85" y="50" width="30" height="5" rx="2" fill={frameMain} />
          <rect x="85" y="163" width="30" height="5" rx="2" fill={frameMid} />

          {/* Motor icon izq — pequeño símbolo */}
          <rect x="88" y="260" width="24" height="14" rx="3" fill={panelBg} />
          <text
            x="100"
            y="271"
            textAnchor="middle"
            fontSize="7"
            fill={displayText}
            fontFamily="monospace"
          >
            M1
          </text>

          {/* ════════════════════════════════════════════════════════
              COLUMNA DERECHA — 3 etapas telescópicas
          ════════════════════════════════════════════════════════ */}
          <rect x="394" y="310" width="52" height="175" rx="5" fill={frameMain} />
          <rect x="394" y="310" width="52" height="8" rx="3" fill={frameLight} />
          <rect x="394" y="479" width="52" height="8" rx="3" fill={frameMid} />
          <rect x="396" y="330" width="3" height="140" rx="1.5" fill={frameDark} opacity="0.5" />
          <rect x="441" y="330" width="3" height="140" rx="1.5" fill={frameLight} opacity="0.5" />

          <rect x="400" y="160" width="40" height="160" rx="4" fill={frameMid} />
          <rect x="400" y="160" width="40" height="6" rx="3" fill={frameLight} />
          <rect x="400" y="313" width="40" height="6" rx="3" fill={frameDark} />
          <rect x="402" y="180" width="2" height="120" rx="1" fill={frameDark} opacity="0.4" />
          <rect x="436" y="180" width="2" height="120" rx="1" fill={frameLight} opacity="0.4" />

          <rect x="405" y="50" width="30" height="120" rx="3" fill={frameLight} />
          <rect x="405" y="50" width="30" height="5" rx="2" fill={frameMain} />
          <rect x="405" y="163" width="30" height="5" rx="2" fill={frameMid} />

          {/* Motor icon der */}
          <rect x="408" y="260" width="24" height="14" rx="3" fill={panelBg} />
          <text
            x="420"
            y="271"
            textAnchor="middle"
            fontSize="7"
            fill={displayText}
            fontFamily="monospace"
          >
            M2
          </text>

          {/* ════════════════════════════════════════════════════════
              TRAVESAÑO CENTRAL (crossbeam)
          ════════════════════════════════════════════════════════ */}
          <rect x="100" y="56" width="320" height="22" rx="5" fill={frameMain} />
          <rect x="100" y="56" width="320" height="5" rx="3" fill={frameLight} />
          <rect x="100" y="73" width="320" height="5" rx="3" fill={frameDark} />
          {/* Tornillos travesaño */}
          {[130, 180, 260, 340, 390].map((x) => (
            <circle key={x} cx={x} cy="67" r="3.5" fill={screw} />
          ))}

          {/* ════════════════════════════════════════════════════════
              PANEL DE CONTROL (montado en travesaño)
          ════════════════════════════════════════════════════════ */}
          <rect x="190" y="82" width="140" height="44" rx="6" fill={panelBg} />
          <rect x="190" y="82" width="140" height="4" rx="3" fill={frameLight} opacity="0.3" />
          {/* Display digital */}
          <rect x="197" y="88" width="70" height="28" rx="4" fill={displayBg} />
          <text
            x="232"
            y="108"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill={displayText}
            fontFamily="monospace"
          >
            71.0
          </text>
          {/* Botones de memoria */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={276 + i * 16} y="90" width="12" height="10" rx="2" fill={frameMain} />
              <text
                x={282 + i * 16}
                y="99"
                textAnchor="middle"
                fontSize="6"
                fill={panelBg}
                fontFamily="monospace"
              >
                {i + 1}
              </text>
            </g>
          ))}
          {/* Botones up/down */}
          <rect x="276" y="104" width="12" height="10" rx="2" fill={isWhite ? "#555" : "#888"} />
          <text x="282" y="113" textAnchor="middle" fontSize="8" fill="white">
            ▲
          </text>
          <rect x="292" y="104" width="12" height="10" rx="2" fill={isWhite ? "#555" : "#888"} />
          <text x="298" y="113" textAnchor="middle" fontSize="8" fill="white">
            ▼
          </text>

          {/* ════════════════════════════════════════════════════════
              BANDEJA PASACABLES (cable management tray)
          ════════════════════════════════════════════════════════ */}
          <rect x="130" y="132" width="260" height="12" rx="4" fill={frameDark} opacity="0.8" />
          {/* Agujeros de la bandeja */}
          {[150, 175, 200, 225, 250, 275, 300, 325, 350].map((x) => (
            <ellipse key={x} cx={x} cy="138" rx="7" ry="3" fill={frameMain} opacity="0.5" />
          ))}

          {/* ════════════════════════════════════════════════════════
              CABLE que baja por la columna izq
          ════════════════════════════════════════════════════════ */}
          <path
            d="M130,144 Q120,200 115,310"
            stroke={frameDark}
            strokeWidth="2.5"
            fill="none"
            opacity="0.6"
            strokeDasharray="4 3"
          />

          {/* ════════════════════════════════════════════════════════
              GANCHO AURICULARES (derecha del travesaño)
          ════════════════════════════════════════════════════════ */}
          <rect x="376" y="78" width="8" height="18" rx="2" fill={frameMid} />
          <path
            d="M380,96 Q390,96 390,106 Q390,116 382,116"
            stroke={frameMid}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          TAPA OPCIONAL (si withTabletop = true)
      ════════════════════════════════════════════════════════ */}
      {withTabletop && (
        <>
          {/* Cara superior */}
          <rect x="55" y="26" width="410" height="38" rx="6" fill={tableColorHex} />
          {/* Cara frontal (espesor) */}
          <rect
            x="55"
            y="58"
            width="410"
            height="10"
            rx="3"
            fill={tableColorHex}
            style={{ filter: "brightness(0.7)" }}
          />
          {/* Cara lateral derecha */}
          <polygon
            points="465,26 480,18 480,48 465,58"
            fill={tableColorHex}
            style={{ filter: "brightness(0.85)" }}
          />
          {/* Borde tapacanto */}
          <rect x="55" y="26" width="410" height="3" rx="2" fill="white" opacity="0.15" />
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          ETIQUETA MARCA
      ════════════════════════════════════════════════════════ */}
      {withStructure && (
        <>
          <rect x="104" y="380" width="52" height="14" rx="3" fill={panelBg} opacity="0.7" />
          <text
            x="130"
            y="391"
            textAnchor="middle"
            fontSize="6.5"
            fontWeight="bold"
            fill={displayText}
            fontFamily="monospace"
            opacity="0.9"
          >
            rz room
          </text>
        </>
      )}
    </svg>
  );
}
