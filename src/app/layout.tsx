import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

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
  description:
    "Standing desks con doble motor silencioso y tapas MDF premium de 36mm. Personalizá tu escritorio: 4 medidas, 6 colores. Envío Andreani a todo el país. Pagá en cuotas sin interés.",
  keywords: [
    "standing desk",
    "escritorio regulable en altura",
    "standing desk Argentina",
    "escritorio electrico doble motor",
    "escritorio de pie",
    "home office",
    "escritorio regulable",
    "standing desk precio argentina",
    "escritorio MDF",
    "rz room",
    "standing desk doble motor",
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
    description:
      "Standing desks con doble motor silencioso y tapas MDF premium de 36mm. Personalizá tu escritorio ideal. Envío a todo el país.",
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
    description:
      "Personalizá tu standing desk: 4 medidas, 6 colores, doble motor. Envío a todo el país.",
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
                "Tienda de standing desks premium con doble motor y tapas MDF en Argentina",
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
                    price: "799000",
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
