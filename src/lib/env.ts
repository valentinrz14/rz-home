/**
 * Variables de entorno centralizadas.
 * Todas las rutas de API y helpers del servidor deben importar desde aquí.
 * Las variables NEXT_PUBLIC_* también están disponibles en el cliente.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function requireServer(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable de entorno faltante: ${name}\n` +
        `Revisá tu .env.local. Instrucciones en .env.example.`
    );
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

// ── Exportaciones ─────────────────────────────────────────────────────────────

/** Access token privado de MercadoPago — solo servidor */
export function getMpAccessToken() {
  return requireServer("MERCADOPAGO_ACCESS_TOKEN");
}

/** Secreto para verificar la firma de los webhooks de MP */
export function getMpWebhookSecret() {
  return optional("MERCADOPAGO_WEBHOOK_SECRET");
}

/** Clave pública de MP — disponible en cliente y servidor */
export const MP_PUBLIC_KEY = optional("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY");

/** URL base del sitio (sin barra final) */
export const SITE_URL = optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

/** Contraseña del panel admin */
export function getAdminPassword() {
  return requireServer("ADMIN_PASSWORD");
}
