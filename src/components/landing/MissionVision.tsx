import { Bot, FileText, Microscope, Globe2 } from "lucide-react";

const pillars = [
  {
    icon: Bot,
    label: "Agentes de IA",
    title: "Automatización Empresarial con IA",
    desc: "Diseñamos e implementamos agentes de inteligencia artificial que automatizan procesos comerciales, operativos y administrativos, generando resultados medibles desde el día uno.",
    color: "bg-black",
    textColor: "text-white",
    iconColor: "text-blue-400",
    badgeColor: "bg-white/10 text-white",
  },
  {
    icon: FileText,
    label: "Software a Medida",
    title: "Sistemas para Sector Público y Privado",
    desc: "Desarrollamos plataformas institucionales: gestión documental con cumplimiento normativo colombiano, e-commerce con pasarelas de pago locales, y software personalizado para cada operación.",
    color: "bg-[#F8F9FA]",
    textColor: "text-black",
    iconColor: "text-gray-700",
    badgeColor: "bg-black text-white",
  },
];

export const MissionVision = () => {
  return (
    <section
      id="mision"
      className="py-24 bg-white px-4 sm:px-6 lg:px-8 border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto">

        {/* Top Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-4">
              Propósito · Misión · Visión
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight leading-[1.05]">
              Centro de Investigación{" "}
              <span className="text-gray-400 font-light">
                en Inteligencia Artificial.
              </span>
            </h2>
          </div>
          <div className="lg:pl-8 lg:border-l border-gray-200">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                  Misión
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Impulsar la transformación digital de organizaciones mediante investigación aplicada en inteligencia artificial, desarrollando soluciones tecnológicas que generan valor real, medible y sostenible desde Sitionuevo, Magdalena, hacia todo el país.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                  Visión
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Ser el referente latinoamericano en investigación e implementación de sistemas de IA aplicada, reconocidos por la calidad técnica, la responsabilidad ética y el impacto tangible en sectores público y privado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars — What We Do */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-10">
            <Microscope className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400">
              Nuestras Líneas de Negocio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-10 flex flex-col gap-6 ${pillar.color} transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${pillar.badgeColor}`}>
                      <Icon className={`w-3.5 h-3.5`} />
                      {pillar.label}
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold mb-3 leading-snug ${pillar.textColor}`}>
                      {pillar.title}
                    </h3>
                    <p className={`text-base leading-relaxed ${pillar.textColor === "text-white" ? "text-gray-400" : "text-gray-600"}`}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
          {[
            { value: "100%", label: "Código Propietario" },
            { value: "< 60", label: "Días para ROI" },
            { value: "24/7", label: "Soporte & Disponibilidad" },
            { value: "2020", label: "Fundada en Colombia" },
          ].map((stat, i) => (
            <div key={i} className="bg-white px-8 py-8 flex flex-col gap-1 hover:bg-gray-50 transition-colors">
              <span className="text-3xl font-bold text-black tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
