import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/kv";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const orders = await getAllOrders();
    // Más recientes primero
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(orders);
  } catch (_err) {
    return NextResponse.json({ error: "Error al obtener órdenes." }, { status: 500 });
  }
}
