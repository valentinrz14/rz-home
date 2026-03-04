/**
 * Paleta de colores centralizada de rz room.
 *
 * Fuente única de verdad para todos los colores del proyecto:
 *   - `brand`  → escala de color principal (marrón/tan), sincronizada con tailwind.config.ts
 *   - `email`  → colores inline de los templates HTML de email
 *
 * Los colores de UI de Tailwind (zinc, green, amber, etc.) son colores del
 * framework y no se centralizan aquí; se usan directamente como clases.
 *
 * Para cambiar el color principal del sitio, modificá `brand` y actualizá
 * los mismos valores en tailwind.config.ts (ver comentario al pie).
 */

// ── Paleta brand ───────────────────────────────────────────────────────────────
// Escala de marrón/tan — usada en componentes y emails.
// ⚠️  Si cambiás estos valores, actualizá también tailwind.config.ts → theme.extend.colors.brand

export const brand = {
  50: "#faf8f5",
  100: "#f0ebe1",
  200: "#ddd3c0",
  300: "#c9b898",
  400: "#b59d73",
  500: "#9c7f53", // color principal
  600: "#8b6f45",
  700: "#745b3a",
  800: "#5e4930",
  900: "#4a3926",
} as const;

// ── Colores de email ───────────────────────────────────────────────────────────
// Hex inline para templates HTML. No pueden usar clases Tailwind.

export const emailColors = {
  // Estructura
  pageBg: "#f4f4f5", // fondo de la página del email
  cardBg: "#ffffff", // fondo de la tarjeta central
  headerBg: "#18181b", // fondo del header (zinc-900)

  // Tipografía
  headerTitle: "#ffffff",
  headerSub: "#a1a1aa", // zinc-400
  heading: "#18181b", // zinc-900
  body: "#52525b", // zinc-600
  label: "#18181b", // zinc-900
  value: "#27272a", // zinc-800
  sectionTitle: "#71717a", // zinc-500
  footerText: "#a1a1aa", // zinc-400
  footerLink: "#18181b", // zinc-900

  // Badges y estados
  successBg: "#f0fdf4", // green-50
  successText: "#16a34a", // green-600
  successBorder: "#bbf7d0", // green-200

  // Contenedores
  itemCardBg: "#f9f9f9",
  infoBg: "#f4f4f5", // zinc-100
  divider: "#e4e4e7", // zinc-200
  footerBg: "#fafafa", // zinc-50
  footerBorder: "#f4f4f5", // zinc-100
} as const;

// ── Tipos de utilidad ──────────────────────────────────────────────────────────

export type BrandShade = keyof typeof brand;
export type EmailColor = keyof typeof emailColors;
