import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FAQ } from "@/components/home/FAQ";
import { ContactSection } from "@/components/home/ContactSection";

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
      <HowItWorks />
      <FAQ />
      <ContactSection />
    </>
  );
}
