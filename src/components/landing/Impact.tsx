import { ArrowUpRight, MapPin, Building2, ShoppingBag } from "lucide-react";

const impactStats = [
  {
    value: "5+",
    label: "Proyectos activos",
    description: "Agentes y sistemas en producción con empresas e instituciones colombianas.",
  },
  {
    value: "70%",
    label: "Reducción promedio en costos operativos de atención",
    description: "Medido en los primeros 90 días post-implementación en clientes piloto.",
  },
  {
    value: "100%",
    label: "Código propietario",
    description: "Sin dependencia de plataformas externas. Soberanía tecnológica total para cada cliente.",
  },
];

const sectors = [
  { icon: Building2, label: "Entidades Públicas", desc: "Alcaldías, gobernaciones, entidades descentralizadas" },
  { icon: ShoppingBag, label: "Comercio & Retail", desc: "Distribuidoras, tiendas, emprendimientos digitales" },
  { icon: MapPin, label: "Sitionuevo → Colombia", desc: "Desarrollamos localmente con impacto nacional" },
];

export const Impact = () => {
  return (
    <section id="impacto" className="py-32 bg-[#F8F9FA] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-gray-200 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="max-w-3xl mb-20">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-4">
            Impacto & Resultados
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-black tracking-tight leading-[1.1] mb-5">
            Tecnología que genera{" "}
            <span className="text-gray-400 font-light">impacto real.</span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed font-light">
            Cada solución que construimos tiene un objetivo claro: mejorar la eficiencia, reducir costos y escalar tu capacidad operativa.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {impactStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-5xl font-bold text-black tracking-tight mb-2">{stat.value}</p>
              <p className="text-sm font-bold text-gray-700 mb-2 leading-snug">{stat.label}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Sectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {sectors.map((sector, idx) => {
            const Icon = sector.icon;
            return (
              <div key={idx} className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black mb-0.5">{sector.label}</h4>
                  <p className="text-xs text-gray-500">{sector.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bottom Banner */}
        <div className="relative bg-black rounded-3xl p-10 md:p-14 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-3">
                ¿Listo para comenzar?
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                Inicia la transformación digital de tu organización.
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Agenda una consulta gratuita. Analizamos tu operación y te presentamos la solución más adecuada, sin compromiso.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                id="impact-cta-whatsapp"
                href="https://wa.me/573001234567?text=Hola%20NeuroLabs%2C%20quiero%20una%20consulta%20gratuita"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
              >
                WhatsApp · Consulta Gratis
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <p className="text-[10px] text-gray-600 text-center">
                Respuesta garantizada en menos de 24 horas
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
