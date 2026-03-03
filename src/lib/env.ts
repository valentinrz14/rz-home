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
      `Variable de entorno faltante: ${name}\n Revisá tu .env Instrucciones en .env.example.`
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

/** Credenciales de Andreani para cotización de envío */
export function getAndreaniCredentials() {
  return {
    usuario: requireServer("ANDREANI_USUARIO"),
    clave: requireServer("ANDREANI_CLAVE"),
    contrato: requireServer("ANDREANI_CONTRATO"),
    cliente: requireServer("ANDREANI_CLIENTE"),
  };
}

/** Usar entorno QA de Andreani (apisqa.andreani.com) */
export const ANDREANI_QA = optional("ANDREANI_QA", "false");

/** API key de SendGrid para envío de emails transaccionales */
export function getSendGridApiKey() {
  return requireServer("SENDGRID_API_KEY");
}

/** Dirección remitente de emails (ej: "pedidos@rzroom.com.ar") */
export const EMAIL_FROM = optional("EMAIL_FROM", "pedidos@rzroom.com.ar");

/** Email del vendedor para notificaciones de nuevos pedidos */
export const EMAIL_NOTIFY = optional("EMAIL_NOTIFY", "");
