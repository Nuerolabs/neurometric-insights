import { ArrowRight, Clock, TrendingUp, Zap, MessageCircle, Settings, BarChart3, CheckCircle } from "lucide-react";

const BENEFITS = [
  {
    icon: Clock,
    metric: "70%",
    label: "Reducción en tiempo de atención inicial",
    description: "Los agentes de IA resuelven consultas repetitivas antes de que lleguen a tu equipo humano.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: TrendingUp,
    metric: "< 60",
    metricSuffix: "días",
    label: "Para recuperar tu inversión",
    description: "Nuestros clientes ven retorno positivo en el primer o segundo mes de operación del agente.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Zap,
    metric: "24/7",
    label: "Disponibilidad garantizada",
    description: "Tus agentes trabajan de madrugada, fines de semana y festivos. Sin costos adicionales de turno.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: MessageCircle,
    metric: "3x",
    label: "Más leads atendidos simultáneamente",
    description: "Un agente maneja miles de conversaciones paralelas con la misma calidad de respuesta.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
];

const STEPS = [
  {
    number: "01",
    icon: BarChart3,
    title: "Diagnóstico",
    description: "Analizamos tu operación, identificamos los cuellos de botella y definimos el agente ideal para tu caso.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configuración",
    description: "Entrenamos el agente con tu base de conocimiento, procesos y tono de voz corporativo.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Implementación",
    description: "Integramos el agente a tus canales (WhatsApp, web, CRM) y realizamos pruebas de calidad.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Resultados",
    description: "Monitoreamos el rendimiento y optimizamos continuamente. Reportes mensuales de impacto.",
  },
];

export const AgentMarketingBenefits = () => {
  return (
    <section id="beneficios" className="py-24 bg-black text-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-500 mb-4">
            Resultados Reales · No Promesas
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
            Lo que cambia cuando{" "}
            <span className="text-gray-400 font-light">la IA trabaja por ti.</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed font-light">
            Métricas observadas en implementaciones reales con empresas colombianas que adoptaron agentes de IA en su operación.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 border ${benefit.bg} ${benefit.border} flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/80`}>
                  <Icon className={`w-5 h-5 ${benefit.color}`} strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-bold tracking-tight ${benefit.color}`}>
                      {benefit.metric}
                    </span>
                    {benefit.metricSuffix && (
                      <span className={`text-lg font-semibold ${benefit.color}`}>
                        {benefit.metricSuffix}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-bold mb-2 text-gray-800`}>{benefit.label}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Steps */}
        <div className="border-t border-gray-800 pt-20">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-500 mb-3">
              Proceso de Implementación
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              De la consulta inicial al agente activo{" "}
              <span className="text-gray-500">en semanas.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative">
                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(100%-20px)] h-px bg-gradient-to-r from-gray-700 to-gray-800 z-0" />
                  )}
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center">
                        <StepIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-600">{step.number}</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Final */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              id="cta-empezar-ahora"
              href="https://wa.me/573001234567?text=Hola%2C%20quiero%20empezar%20con%20un%20agente%20de%20IA%20para%20mi%20empresa"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Empezar Ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#agentes"
              className="text-sm text-gray-500 hover:text-white transition-colors font-medium underline underline-offset-4"
            >
              Ver catálogo de agentes
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
