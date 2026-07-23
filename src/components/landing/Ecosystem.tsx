import { Bot, FolderOpen, ShoppingCart } from "lucide-react";

const cards = [
  {
    icon: Bot,
    title: "Agentes de IA Empresariales",
    description:
      "Implementamos agentes conversacionales y de automatización que trabajan 24/7 capturando leads, resolviendo consultas y ejecutando procesos sin intervención humana.",
    tag: "IA Generativa",
    tagColor: "bg-black text-white",
    href: "#agentes",
  },
  {
    icon: FolderOpen,
    title: "Gestión Documental para Entidades Públicas",
    description:
      "Software institucional para la radicación, trazabilidad y archivo digital de documentos con cumplimiento pleno de la normativa colombiana (Ley 594/2000, AGN).",
    tag: "Sector Público",
    tagColor: "bg-blue-600 text-white",
    href: "#software",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce & Desarrollo a Medida",
    description:
      "Plataformas de comercio electrónico con pasarelas de pago colombianas (PSE, Wompi, PayU) y desarrollo de software personalizado para cada tipo de operación.",
    tag: "Comercio Digital",
    tagColor: "bg-emerald-600 text-white",
    href: "#software",
  },
];

export const Ecosystem = () => {
  return (
    <section id="soluciones" className="py-24 bg-[#FAFAFA] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">
            Soluciones
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            Todo lo que NeuroLabs construye para ti.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <a
                key={index}
                href={card.href}
                className="group p-8 bg-white border border-gray-200 flex flex-col hover:border-black transition-colors duration-300 rounded-2xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl group-hover:border-gray-200 transition-colors">
                    <Icon className="w-6 h-6 text-black" strokeWidth={1.5} />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${card.tagColor}`}>
                    {card.tag}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-black mb-3 leading-snug">
                  {card.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                  {card.description}
                </p>
                <div className="mt-6 text-xs font-bold text-black tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Ver más →
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
