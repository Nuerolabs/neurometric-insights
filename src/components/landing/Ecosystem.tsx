import { Code2, ShieldAlert, Cpu } from "lucide-react";

const cards = [
  {
    title: "Desarrollo IA y Automatización",
    description: "Modelos de lenguaje, automatización de flujos de trabajo y análisis de bases de datos para escalar tu negocio.",
    icon: Code2,
  },
  {
    title: "Impacto Social y Prevención",
    description: "Desarrollo de cartografía comunitaria, mapas de riesgos ambientales y proyectos como 'Sitionuevo Resiliente'.",
    icon: ShieldAlert,
  },
  {
    title: "Hardware y Transmisión",
    description: "Soporte técnico, ensamblaje de equipos y arquitectura de streaming profesional para eventos en vivo.",
    icon: Cpu,
  }
];

export const Ecosystem = () => {
  return (
    <section id="soluciones" className="py-24 bg-[#FAFAFA] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">
            Infraestructura
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Ecosistema NeuroLabs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="p-8 bg-white border border-gray-200 flex flex-col hover:border-black transition-colors duration-300"
            >
              <div className="mb-6">
                <card.icon className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-semibold text-black mb-3">
                {card.title}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
