import { type NextRequest, NextResponse } from "next/server";
import { getAndreaniCredentials, ANDREANI_CP_ORIGEN } from "@/lib/env";
import type { ProductType, TableSize } from "@/types";

// ── Peso y dimensiones estimadas por tipo/tamaño de producto ─────────────────

type BultoSpec = { kilos: number; largoCm: number; anchoCm: number; altoCm: number };

const ESTRUCTURA_SPEC: BultoSpec = { kilos: 35, largoCm: 125, anchoCm: 65, altoCm: 25 };

const TABLA_SPECS: Record<TableSize, BultoSpec> = {
  "120x60": { kilos: 18, largoCm: 125, anchoCm: 65, altoCm: 8 },
  "140x70": { kilos: 22, largoCm: 145, anchoCm: 75, altoCm: 8 },
  "150x70": { kilos: 25, largoCm: 155, anchoCm: 75, altoCm: 8 },
  "160x80": { kilos: 30, largoCm: 165, anchoCm: 85, altoCm: 8 },
};

interface CartItemInput {
  type: ProductType;
  size?: TableSize;
  quantity: number;
  unitPrice: number;
}

function buildBultos(items: CartItemInput[]) {
  return items.flatMap((item) => {
    const size = item.size ?? "140x70";
    const bultos: Array<BultoSpec & { valorDeclarado: number }> = [];

    for (let i = 0; i < item.quantity; i++) {
      if (item.type === "estructura" || item.type === "completo") {
        const declared =
          item.type === "completo" ? Math.round(item.unitPrice * 0.55) : item.unitPrice;
        bultos.push({ ...ESTRUCTURA_SPEC, valorDeclarado: declared });
      }

      if (item.type === "tabla" || item.type === "completo") {
        const declared =
          item.type === "completo" ? Math.round(item.unitPrice * 0.45) : item.unitPrice;
        bultos.push({ ...TABLA_SPECS[size], valorDeclarado: declared });
      }
    }

    return bultos;
  });
}

// ── Andreani API ──────────────────────────────────────────────────────────────

const ANDREANI_BASE = "https://apis.andreani.com";

async function getAndreaniToken(usuario: string, clave: string): Promise<string> {
  const res = await fetch(`${ANDREANI_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, clave }),
  });

  if (!res.ok) {
    throw new Error(`Andreani login failed: ${res.status}`);
  }

  const token = res.headers.get("x-authorization-token");
  if (!token) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Andreani login: token no encontrado en respuesta. ${JSON.stringify(data)}`);
  }

  return token;
}

interface AndreaniTarifaResponse {
  tarifaTotal?: number;
  total?: number;
  plazoEntrega?: number;
  [key: string]: unknown;
}

async function fetchTarifa(
  token: string,
  contrato: string,
  cpDestino: string,
  cpOrigen: string,
  bultos: Array<BultoSpec & { valorDeclarado: number }>
): Promise<{ costo: number; plazo: number | null }> {
  const res = await fetch(`${ANDREANI_BASE}/v2/tarifas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-contrato": contrato,
    },
    body: JSON.stringify({ cpDestino, cpOrigen, bultos }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Andreani tarifas error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data: AndreaniTarifaResponse | AndreaniTarifaResponse[] = await res.json();

  // La API puede devolver un objeto o un array con la primera tarifa
  const tarifa: AndreaniTarifaResponse = Array.isArray(data)
    ? (data[0] ?? {})
    : data;
  const costo = tarifa.tarifaTotal ?? tarifa.total;

  if (typeof costo !== "number") {
    throw new Error(`Andreani: estructura de respuesta inesperada: ${JSON.stringify(data)}`);
  }

  return { costo, plazo: tarifa.plazoEntrega ?? null };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let creds: ReturnType<typeof getAndreaniCredentials> | null = null;

  try {
    creds = getAndreaniCredentials();
  } catch {
    return NextResponse.json(
      { error: "El servicio de cotización de envío no está configurado." },
      { status: 501 }
    );
  }

  try {
    const body = await req.json();
    const { codigoPostal, items } = body as {
      codigoPostal: string;
      items: CartItemInput[];
    };

    if (!codigoPostal || !/^\d{4}$/.test(codigoPostal)) {
      return NextResponse.json(
        { error: "Código postal inválido. Debe tener 4 dígitos." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay productos en el carrito." }, { status: 400 });
    }

    const bultos = buildBultos(items);
    const token = await getAndreaniToken(creds.usuario, creds.clave);
    const { costo, plazo } = await fetchTarifa(
      token,
      creds.contrato,
      codigoPostal,
      ANDREANI_CP_ORIGEN,
      bultos
    );

    return NextResponse.json({ costo, plazo });
  } catch (err) {
    console.error("Andreani cotizar error:", err);
    return NextResponse.json(
      { error: "No se pudo calcular el costo de envío. Intentá nuevamente." },
      { status: 502 }
    );
  }
}
