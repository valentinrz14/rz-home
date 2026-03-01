# rz room — E-commerce Standing Desks

Tienda online de standing desks premium para el mercado argentino. Construida con Next.js 15, TypeScript, Tailwind CSS y MercadoPago.

## Stack tecnológico

| Tecnología | Propósito |
|---|---|
| **Next.js 15** (App Router) | Framework full-stack, SSR/SSG, SEO |
| **TypeScript** | Tipado estático |
| **Tailwind CSS v3** | Estilos utilitarios |
| **Zustand** | Estado global del carrito |
| **MercadoPago SDK** | Pasarela de pagos con cuotas |
| **Vercel** | Deploy (free tier) |

## Estructura de ramas

- `main` — Producción
- `develop` — Desarrollo / staging
- `claude/*` — Ramas de features

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Completar variables en .env.local:
#    - MERCADOPAGO_ACCESS_TOKEN
#    - NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
#    - NEXT_PUBLIC_SITE_URL

# 4. Iniciar en desarrollo
npm run dev
```

## Variables de entorno

Ver `.env.example` para la lista completa.

Obtené tus credenciales en: https://www.mercadopago.com.ar/developers

## Deploy en Vercel (gratuito)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configurar las variables de entorno en el dashboard de Vercel.

## Productos

| Producto | Precio desde |
|---|---|
| Standing Desk Completo (estructura + tapa) | $799.000 ARS |
| Solo Estructura Doble Motor | $699.000 ARS |
| Solo Tapa MDF Premium | $149.000 ARS |

### Tapas disponibles

| Medida | Solo tapa | Bundle |
|---|---|---|
| 120 × 60 cm | $149.000 | $799.000 |
| 140 × 70 cm | $179.000 | $829.000 |
| 150 × 70 cm | $199.000 | $849.000 |
| 160 × 80 cm | $249.000 | $899.000 |

**6 colores:** Hickory · Roble Claro · Blanco · Gris Cemento · Nogal · Negro
**2 colores de estructura:** Blanco · Negro

## Imágenes de productos

Las imágenes de producto deben generarse con **Pomeli** u otro generador de IA y colocarse en:

```
public/images/
  products/
    desk-complete.jpg
    desk-structure.jpg
    desk-tabletop.jpg
    desk-hero.jpg
  og-image.jpg        ← Imagen para redes sociales (1200x630px)
  logo.png            ← Logo de la marca
```

## Pasarela de pagos — MercadoPago

- Acepta tarjetas de crédito con hasta **12 cuotas sin interés**
- Integración via Preference API + redirect a checkout de MP
- Webhook configurado en `/api/mercadopago/webhook`
- Configuar URL del webhook en el dashboard de MP: `https://tudominio.com/api/mercadopago/webhook`

## Envíos

Los envíos se realizan exclusivamente a través de **Andreani**. El costo lo abona el comprador y se cotiza según el código postal al momento del checkout.
