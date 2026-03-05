import { Redis } from "@upstash/redis";
import type { OrderStatus, PendingOrder } from "@/types/orders";

function getKv() {
  return Redis.fromEnv();
}

export async function saveOrder(order: PendingOrder): Promise<void> {
  const kv = getKv();
  await kv.set(`order:${order.id}`, order);
  await kv.lpush("orders:all", order.id);
}

export async function getOrder(id: string): Promise<PendingOrder | null> {
  return getKv().get<PendingOrder>(`order:${id}`);
}

export async function getAllOrders(): Promise<PendingOrder[]> {
  const ids = await getKv().lrange<string>("orders:all", 0, -1);
  if (!ids || ids.length === 0) return [];
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter((o): o is PendingOrder => o !== null);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const order = await getOrder(id);
  if (!order) throw new Error(`Order ${id} not found`);
  await getKv().set(`order:${id}`, { ...order, status });
}
