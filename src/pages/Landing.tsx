import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { MissionVision } from "@/components/landing/MissionVision";
import { Ecosystem } from "@/components/landing/Ecosystem";
import { AgentCatalog } from "@/components/landing/AgentCatalog";
import { AgentMarketingBenefits } from "@/components/landing/AgentMarketingBenefits";
import { SoftwareCatalog } from "@/components/landing/SoftwareCatalog";
import { Impact } from "@/components/landing/Impact";
import { Footer } from "@/components/landing/Footer";
import { AgentDemoWidget } from "@/components/landing/AgentDemoWidget";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black">
      <Navbar />
      <main>
        {/* 1. Hero — Headline impactante con propuesta de valor principal */}
        <Hero />

        {/* 2. Soluciones — Vista general de las 3 líneas de negocio */}
        <Ecosystem />

        {/* 3. Misión & Visión — Centro de investigación en IA */}
        <MissionVision />

        {/* 4. Catálogo de Agentes de IA — 3 productos con dolor/solución/ROI */}
        <AgentCatalog />

        {/* 5. Beneficios & ROI — Métricas de impacto + proceso de 4 pasos */}
        <AgentMarketingBenefits />

        {/* 6. Catálogo de Software Empresarial — Gestión documental + E-Commerce */}
        <SoftwareCatalog />

        {/* 7. Impacto — Stats, sectores y CTA final */}
        <Impact />
      </main>
      <Footer />
      {/* Floating AI Chat Widget — visible en toda la landing */}
      <AgentDemoWidget />
    </div>
  );
};

export default Landing;
