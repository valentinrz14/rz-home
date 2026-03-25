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

/** Credenciales de Talo Pay — solo servidor */
export function getTaloCredentials() {
  return {
    clientId: requireServer("TALO_CLIENT_ID"),
    clientSecret: requireServer("TALO_CLIENT_SECRET"),
    userId: requireServer("TALO_USER_ID"),
  };
}

/** Entorno de Talo: "production" | "sandbox" */
export function getTaloEnvironment(): "production" | "sandbox" {
  return optional("TALO_ENVIRONMENT", "production") as "production" | "sandbox";
}

/** URL base del sitio (sin barra final) */
export const SITE_URL = optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

/** Contraseña del panel admin */
export function getAdminPassword() {
  return requireServer("ADMIN_PASSWORD");
}

/** API key de SendGrid para envío de emails transaccionales */
export function getSendGridApiKey() {
  return requireServer("SENDGRID_API_KEY");
}

/** Dirección remitente de emails (ej: "pedidos@rzroom.com.ar") */
export const EMAIL_FROM = optional("EMAIL_FROM", "pedidos@rzroom.com.ar");

/** Email del vendedor para notificaciones de nuevos pedidos */
export const EMAIL_NOTIFY = optional("EMAIL_NOTIFY", "");

// ── Métodos de pago alternativos ───────────────────────────────────────────────

/** Número de WhatsApp con código de país, sin + (ej: 5491122334455) */
export function getWhatsappNumber() {
  return optional("WHATSAPP_NUMBER");
}

/** Datos bancarios para transferencia */
export function getBankDetails() {
  return {
    cbu: optional("CBU"),
    alias: optional("ALIAS_BANCO"),
    titular: optional("TITULAR_BANCO"),
    number_of_account: optional("NRO_CUENTA"),
  };
}

/** Wallets de cripto para pagos alternativos */
export function getCryptoWallets() {
  return {
    usdt_trc20: optional("CRYPTO_WALLET_USDT_TRC20"),
    usdt_polygon: optional("CRYPTO_WALLET_USDT_POLYGON"),
    ltc: optional("CRYPTO_WALLET_LTC"),
  };
}

/** Dirección de retiro en local */
export function getPickupAddress() {
  return {
    zona: optional("PICKUP_ZONA", "Buenos Aires, Ituzaingó"),
    completa: optional("PICKUP_ADDRESS", "Buenos Aires, Ituzaingó, Cerrito 1696"),
  };
}

// Upstash Redis — usadas por @upstash/redis via UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
