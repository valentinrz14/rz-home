import type { Metadata } from "next";
import { ContactSection } from "@/components/home/ContactSection";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PriceComparison } from "@/components/home/PriceComparison";
import { ProductShowcase } from "@/components/home/ProductShowcase";

export const metadata: Metadata = {
  title: "rz room — Standing Desks Premium en Argentina",
  description:
    "Standing desks con doble motor silencioso y tapas MDF de 36mm. Personalizá tu escritorio: 4 medidas, 6 colores. Envío Andreani a todo el país. Pagá en cuotas sin interés.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductShowcase />
      <Features />
      <PriceComparison />
      <HowItWorks />
      <ContactSection />
    </>
  );
}
