import { type NextRequest, NextResponse } from "next/server";
import { getAndreaniCredentials } from "@/lib/env";
import type { MotorType, ProductType, TableSize } from "@/types";

// ── Peso y dimensiones estimadas por tipo/tamaño de producto ─────────────────

type BultoSpec = {
  kilos: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  volumenCm: number; // largoCm * anchoCm * altoCm
  valorDeclaradoConImpuestos: number;
};

function makeBulto(
  kilos: number,
  largo: number,
  ancho: number,
  alto: number,
  valorDeclarado: number
): BultoSpec {
  return {
    kilos,
    largoCm: largo,
    anchoCm: ancho,
    altoCm: alto,
    volumenCm: largo * ancho * alto,
    valorDeclaradoConImpuestos: valorDeclarado,
  };
}

const ESTRUCTURA_SPEC_BASE = { kilos: 35, largo: 125, ancho: 65, alto: 25 };
const ESTRUCTURA_SPEC_SIMPLE = { kilos: 20, largo: 125, ancho: 65, alto: 25 };
const TABLA_DIMS: Record<TableSize, { kilos: number; largo: number; ancho: number; alto: number }> =
  {
    "120x60": { kilos: 18, largo: 125, ancho: 65, alto: 8 },
    "140x70": { kilos: 22, largo: 145, ancho: 75, alto: 8 },
    "160x80": { kilos: 30, largo: 165, ancho: 85, alto: 8 },
  };

interface CartItemInput {
  type: ProductType;
  motorType?: MotorType;
  size?: TableSize;
  quantity: number;
  unitPrice: number;
}

function buildBultos(items: CartItemInput[]): BultoSpec[] {
  return items.flatMap((item) => {
    const size = item.size ?? "140x70";
    const bultos: BultoSpec[] = [];

    for (let i = 0; i < item.quantity; i++) {
      if (item.type === "estructura" || item.type === "completo") {
        const declared =
          item.type === "completo" ? Math.round(item.unitPrice * 0.55) : item.unitPrice;
        const spec = item.motorType === "simple" ? ESTRUCTURA_SPEC_SIMPLE : ESTRUCTURA_SPEC_BASE;
        const { kilos, largo, ancho, alto } = spec;
        bultos.push(makeBulto(kilos, largo, ancho, alto, declared));
      }

      if (item.type === "tabla" || item.type === "completo") {
        const declared =
          item.type === "completo" ? Math.round(item.unitPrice * 0.45) : item.unitPrice;
        const { kilos, largo, ancho, alto } = TABLA_DIMS[size];
        bultos.push(makeBulto(kilos, largo, ancho, alto, declared));
      }
    }

    return bultos;
  });
}

// ── Andreani API ──────────────────────────────────────────────────────────────

function getAndreaniBase() {
  return process.env.ANDREANI_QA === "true"
    ? "https://apisqa.andreani.com"
    : "https://apis.andreani.com";
}

/**
 * Login: GET /login con Authorization: Basic base64(user:pass)
 * Token devuelto en header x-authorization-token.
 */
async function getAndreaniToken(usuario: string, clave: string): Promise<string> {
  const credentials = Buffer.from(`${usuario}:${clave}`).toString("base64");

  const res = await fetch(`${getAndreaniBase()}/login`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Andreani login failed: ${res.status} ${res.statusText}`);
  }

  const token =
    res.headers.get("x-authorization-token") ?? res.headers.get("X-Authorization-token");
  if (!token) {
    throw new Error("Andreani login: token no encontrado en headers de respuesta.");
  }

  return token;
}

/**
 * Serializa los bultos como query params estilo PHP:
 * bultos[0][kilos]=35&bultos[0][largoCm]=125&...
 */
function serializeBultos(bultos: BultoSpec[]): string {
  return bultos
    .flatMap((bulto, i) =>
      (Object.entries(bulto) as [string, number][]).map(
        ([key, val]) => `${encodeURIComponent(`bultos[${i}][${key}]`)}=${encodeURIComponent(val)}`
      )
    )
    .join("&");
}

interface AndreaniTarifaResponse {
  tarifa?: number;
  tarifaConImpuestos?: number;
  tarifaTotal?: number;
  total?: number;
  plazoEntrega?: number;
  [key: string]: unknown;
}

async function fetchTarifa(
  token: string,
  contrato: string,
  cliente: string,
  cpDestino: string,
  bultos: BultoSpec[]
): Promise<{ costo: number; plazo: number | null }> {
  const baseParams = new URLSearchParams({ cpDestino, contrato, cliente });
  const url = `${getAndreaniBase()}/v1/tarifas?${baseParams.toString()}&${serializeBultos(bultos)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-authorization-token": token,
    },
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Andreani tarifas error ${res.status}: ${err}`);
  }

  const data: AndreaniTarifaResponse | AndreaniTarifaResponse[] = await res.json();
  const tarifa: AndreaniTarifaResponse = Array.isArray(data) ? (data[0] ?? {}) : data;

  const costo = tarifa.tarifa ?? tarifa.tarifaConImpuestos ?? tarifa.tarifaTotal ?? tarifa.total;

  if (typeof costo !== "number") {
    throw new Error(`Andreani: respuesta inesperada: ${JSON.stringify(data)}`);
  }

  return { costo: Math.round(costo), plazo: tarifa.plazoEntrega ?? null };
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
      creds.cliente,
      codigoPostal,
      bultos
    );

    return NextResponse.json({ costo, plazo });
  } catch {
    return NextResponse.json(
      { error: "No se pudo calcular el costo de envío. Intentá nuevamente." },
      { status: 502 }
    );
  }
}
