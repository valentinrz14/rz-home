import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { BUNDLE_PRICES, BUNDLE_PRICES_SIMPLE } from "@/lib/products";
import { TABLE_SIZE } from "@/types";

// Formatted price strings for use in metadata/SEO text
function metaPrice(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const PRICE_SIMPLE_FROM = metaPrice(BUNDLE_PRICES_SIMPLE[TABLE_SIZE.S]);
const PRICE_DOBLE_FROM = metaPrice(BUNDLE_PRICES[TABLE_SIZE.S]);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rzroom.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "rz room — Standing Desks Premium en Argentina",
    template: "%s | rz room",
  },
  description: `Standing desks eléctricos con tapas MDF premium de 36mm. Dos modelos: motor simple desde ${PRICE_SIMPLE_FROM} y doble motor desde ${PRICE_DOBLE_FROM}. 3 medidas, 6 colores. Envío Andreani a todo el país.`,
  keywords: [
    "standing desk",
    "escritorio regulable en altura",
    "standing desk Argentina",
    "escritorio electrico",
    "escritorio de pie",
    "home office",
    "escritorio regulable",
    "standing desk precio argentina",
    "escritorio MDF",
    "rz room",
    "standing desk doble motor",
    "standing desk motor simple",
    "escritorio electrico barato argentina",
  ],
  authors: [{ name: "rz room" }],
  creator: "rz room",
  publisher: "rz room",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/logo.svg", type: "image/svg+xml" },
    shortcut: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "rz room",
    title: "rz room — Standing Desks Premium en Argentina",
    description: `Standing desks eléctricos con tapas MDF premium de 36mm. Motor simple desde ${PRICE_SIMPLE_FROM} o doble motor desde ${PRICE_DOBLE_FROM}. Personalizá el tuyo y recibilo en todo el país.`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "rz room — Standing Desks Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "rz room — Standing Desks Premium en Argentina",
    description: `Standing desks eléctricos desde ${PRICE_SIMPLE_FROM}. Motor simple o doble motor, 3 medidas, 6 colores. Envío a todo el país.`,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "ecommerce",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c10" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "rz room",
              description:
                "Tienda de standing desks eléctricos con tapas MDF premium en Argentina. Motor simple y doble motor.",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              address: { "@type": "PostalAddress", addressCountry: "AR" },
              sameAs: ["https://instagram.com/rzroom.ar"],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Standing Desks rz room",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Standing Desk Completo — Doble Motor + Tapa MDF",
                    priceCurrency: "ARS",
                    price: String(BUNDLE_PRICES[TABLE_SIZE.S]),
                    availability: "https://schema.org/InStock",
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen antialiased`}
      >
        <SpeedInsights />
        <Analytics />
        <ThemeProvider>
          <Header />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
