import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 min-h-[90vh] bg-white">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#E5E7EB 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.4,
        }}
      />
      {/* Radial fade overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em] text-gray-600 uppercase">
            Centro de Investigación en IA · Sitionuevo, Colombia
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black tracking-tighter leading-[1.05] mb-8 animate-fade-in-up">
          Agentes de IA <br className="hidden md:block" />
          <span className="text-gray-400 font-light">para tu empresa.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mb-12 leading-relaxed animate-fade-in-up animation-delay-100 font-light">
          Diseñamos e implementamos agentes de inteligencia artificial y software empresarial que automatizan procesos, capturan leads y generan resultados medibles desde el primer mes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200 w-full sm:w-auto">
          <a
            id="hero-cta-primary"
            href="#agentes"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-black rounded-xl overflow-hidden transition-all hover:bg-gray-900 w-full sm:w-auto shadow-lg shadow-black/10"
          >
            <span className="relative z-10 flex items-center">
              Ver Nuestros Agentes
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            id="hero-cta-secondary"
            href="#mision"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-gray-200 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-400 w-full sm:w-auto"
          >
            Nuestra Misión
          </a>
        </div>

        {/* Social proof strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 animate-fade-in-up animation-delay-200">
          {[
            "Agentes 24/7",
            "ROI en < 60 días",
            "Sector Público & Privado",
            "Código 100% Propietario",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
