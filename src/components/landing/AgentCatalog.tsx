import { ArrowRight, MessageSquare, BookOpen, Network, TrendingUp, Clock, Users } from "lucide-react";

// ─── TypeScript Interface ───────────────────────────────────────────────────
export interface AIAgentProduct {
  id: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  pain: string;
  solution: string;
  roi: string;
  roiIcon: React.ElementType;
  techBadges: string[];
  cta: string;
  ctaEventName: string;
  featured?: boolean;
}

// ─── Data ───────────────────────────────────────────────────────────────────
const AI_AGENTS: AIAgentProduct[] = [
  {
    id: "comercial",
    icon: MessageSquare,
    badge: "Más Solicitado",
    badgeColor: "bg-black text-white",
    title: "Agente Comercial Automático",
    subtitle: "WhatsApp · Web · Instagram",
    pain: "Tu equipo de ventas pierde leads calificados fuera del horario laboral y no puede atender todos los canales simultáneamente.",
    solution: "Un agente de IA que captura leads, califica prospectos según tu criterio y agenda citas directamente en tu calendario, las 24 horas del día, los 7 días de la semana.",
    roi: "Aumenta hasta un 40% la tasa de conversión de leads al eliminar tiempos de respuesta lentos.",
    roiIcon: TrendingUp,
    techBadges: ["Llama 3.3", "WhatsApp Business API", "Alta Disponibilidad", "ROI < 60 días"],
    cta: "Solicitar Demo",
    ctaEventName: "cta_agent_comercial",
    featured: true,
  },
  {
    id: "rag-soporte",
    icon: BookOpen,
    badge: "Operaciones",
    badgeColor: "bg-blue-600 text-white",
    title: "Agente de Soporte & Operaciones RAG",
    subtitle: "Manuales · Inventarios · Procesos internos",
    pain: "Tu equipo pierde horas buscando información en manuales, normativas internas o inventarios para resolver consultas técnicas que podrían responderse en segundos.",
    solution: "Agente conectado directamente a tus documentos internos (PDFs, manuales, bases de datos) que responde preguntas técnicas con precisión institucional, sin necesidad de un humano.",
    roi: "Reduce hasta un 70% el tiempo de atención en soporte técnico y operativo.",
    roiIcon: Clock,
    techBadges: ["DeepSeek-R1", "RAG Cognitivo", "ChromaDB Vectorial", "Datos Privados"],
    cta: "Ver Caso de Uso",
    ctaEventName: "cta_agent_rag",
    featured: false,
  },
  {
    id: "multi-agente",
    icon: Network,
    badge: "Nivel Corporativo",
    badgeColor: "bg-purple-700 text-white",
    title: "Sistemas Multi-Agente Corporativos",
    subtitle: "Finanzas · RRHH · Reportes · Administración",
    pain: "Los procesos administrativos complejos consumen recursos humanos valiosos en tareas repetitivas: generación de informes, gestión de nómina, conciliaciones y aprobaciones.",
    solution: "Red de agentes especializados que automatizan flujos de trabajo completos: un agente genera el reporte, otro lo valida, otro lo envía al jefe aprobador. Sin intervención humana.",
    roi: "Automatiza hasta el 80% de las tareas administrativas repetitivas, liberando talento para decisiones estratégicas.",
    roiIcon: Users,
    techBadges: ["Arquitectura Multi-Agente", "Integración ERP/CRM", "Llama 3.3 + DeepSeek", "Orquestación Autónoma"],
    cta: "Consulta Corporativa",
    ctaEventName: "cta_agent_multiagente",
    featured: false,
  },
];

// ─── Helper: GA4 Event Tracker ──────────────────────────────────────────────
const trackGA4Event = (eventName: string, agentId: string) => {
  if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
    (window as Window & { gtag: Function }).gtag("event", eventName, {
      event_category: "agentes_ia",
      event_label: agentId,
      value: 1,
    });
  }
};

// ─── Component ──────────────────────────────────────────────────────────────
export const AgentCatalog = () => {
  return (
    <section id="agentes" className="py-24 bg-[#F8F9FA] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-black border border-black">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
              Agentes de IA Empresariales
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight mb-4">
            Automatización inteligente{" "}
            <span className="text-gray-400 font-light">para tu operación.</span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed font-light">
            Implementamos agentes de IA que trabajan solos, aprenden de tu negocio y generan resultados desde el primer mes.
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {AI_AGENTS.map((agent) => {
            const AgentIcon = agent.icon;
            const RoiIcon = agent.roiIcon;
            return (
              <div
                key={agent.id}
                className={`relative flex flex-col bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 overflow-hidden ${
                  agent.featured
                    ? "border-black shadow-lg shadow-black/10"
                    : "border-gray-200"
                }`}
              >
                {/* Featured ribbon */}
                {agent.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent" />
                )}

                <div className="p-8 flex flex-col gap-6 flex-grow">
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <AgentIcon className="w-6 h-6 text-black" strokeWidth={1.5} />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${agent.badgeColor}`}>
                      {agent.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-black mb-1 leading-tight">
                      {agent.title}
                    </h3>
                    <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
                      {agent.subtitle}
                    </p>
                  </div>

                  {/* Pain → Solution */}
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5">
                        ⚠ Problema actual
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{agent.pain}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1.5">
                        ✓ Solución NeuroLabs
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{agent.solution}</p>
                    </div>
                  </div>

                  {/* ROI */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <RoiIcon className="w-4 h-4 text-black mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <p className="text-sm font-semibold text-black leading-snug">{agent.roi}</p>
                  </div>

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-2">
                    {agent.techBadges.map((badge, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200 tracking-wide"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                  <a
                    id={`cta-${agent.id}`}
                    href="https://wa.me/573001234567?text=Hola%2C%20me%20interesa%20el%20agente%20de%20IA%20de%20NeuroLabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackGA4Event(agent.ctaEventName, agent.id)}
                    className={`group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      agent.featured
                        ? "bg-black text-white hover:bg-gray-900"
                        : "bg-white text-black border border-gray-200 hover:border-black hover:bg-gray-50"
                    }`}
                  >
                    {agent.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-10 p-8 rounded-2xl bg-black flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg mb-1">¿No sabes cuál agente necesitas?</p>
            <p className="text-gray-400 text-sm">Agenda una consulta gratuita y nuestros expertos analizan tu caso sin compromiso.</p>
          </div>
          <a
            id="cta-consulta-agentes"
            href="https://wa.me/573001234567?text=Hola%2C%20quiero%20una%20consulta%20gratuita%20sobre%20agentes%20de%20IA"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGA4Event("cta_consulta_gratuita_agentes", "banner")}
            className="group flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            Consulta Gratuita
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};
