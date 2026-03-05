import type { Metadata } from "next";
import { ContactSection } from "@/components/home/ContactSection";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PriceComparison } from "@/components/home/PriceComparison";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { getStock } from "@/lib/amazon-stock";
import { getPrices } from "@/lib/prices";

export const metadata: Metadata = {
  title: "rz room — Standing Desks Premium en Argentina",
  description:
    "Standing desks con doble motor silencioso y tapas MDF de 36mm. Personalizá tu escritorio: 3 medidas, 6 colores. Envío Andreani a todo el país.",
};

// Revalidate the home page every 5 minutes so stock badges stay fresh
export const revalidate = 300;

export default async function HomePage() {
  const [prices, stock] = await Promise.all([getPrices(), getStock()]);
  return (
    <>
      <Hero />
      <ProductShowcase prices={prices} stock={stock} />
      <Features />
      <PriceComparison prices={prices} />
      <HowItWorks />
      <ContactSection />
    </>
  );
}
