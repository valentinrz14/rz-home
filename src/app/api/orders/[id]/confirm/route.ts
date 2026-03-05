import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendNewOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { getOrder, updateOrderStatus } from "@/lib/kv";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada." }, { status: 404 });
    }

    if (order.status === "confirmed") {
      return NextResponse.json({ ok: true, already: true });
    }

    await updateOrderStatus(id, "confirmed");

    const emailData = {
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
      buyerLastName: order.buyerLastName,
      buyerPhone: order.buyerPhone,
      buyerAddress: order.buyerAddress,
      postalCode: order.postalCode,
      items: order.items,
      totalAmount: order.finalAmount,
      paymentId: id,
      paymentMethod: order.paymentMethod,
    };

    await Promise.allSettled([
      sendOrderConfirmationEmail(emailData),
      sendNewOrderNotificationEmail(emailData),
    ]);

    return NextResponse.json({ ok: true });
  } catch (_err) {
    return NextResponse.json({ error: "Error al confirmar la orden." }, { status: 500 });
  }
}
