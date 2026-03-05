import type { Metadata } from "next";
import { ContactSection } from "@/components/home/ContactSection";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PriceComparison } from "@/components/home/PriceComparison";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { getPrices } from "@/lib/prices";

export const metadata: Metadata = {
  title: "rz room — Standing Desks Premium en Argentina",
  description:
    "Standing desks con doble motor silencioso y tapas MDF de 36mm. Personalizá tu escritorio: 3 medidas, 6 colores. Envío Andreani a todo el país.",
};

export default async function HomePage() {
  const prices = await getPrices();
  return (
    <>
      <Hero />
      <ProductShowcase prices={prices} />
      <Features />
      <PriceComparison prices={prices} />
      <HowItWorks />
      <ContactSection />
    </>
  );
}
