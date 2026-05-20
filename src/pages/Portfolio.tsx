import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Stethoscope,
  Store,
  Landmark,
  Truck,
  Radio,
  CheckCircle2,
  Activity,
  Database,
  Target,
  ExternalLink,
} from "lucide-react";

/* ── Category Filters ── */
const categories = [
  { id: "all", label: "Todos" },
  { id: "ia", label: "Inteligencia Artificial" },
  { id: "edu", label: "Educación" },
  { id: "gov", label: "Gobierno & Público" },
  { id: "health", label: "Salud" },
  { id: "commerce", label: "Comercio" },
  { id: "logistics", label: "Logística" },
  { id: "media", label: "Media & Streaming" },
];

/* ── Project Data ── */
const projects = [
  {
    id: "abia",
    category: "ia",
    title: "ABIA — Soberanía Cognitiva",
    desc: "Motor de inteligencia artificial soberana con arquitectura Dual-Hemisphere. Integra razonamiento jurídico, tutoría cognitiva y auditoría autónoma libre de alucinaciones.",
    metrics: [
      { label: "Recuerdos ChromaDB", value: "46,658" },
      { label: "Rigor Socrático", value: "98%" },
      { label: "Anti-Alucinación", value: "96%" },
      { label: "Latencia", value: "2.5s" },
    ],
    tags: ["RAG", "ChromaDB", "GPU Remota", "LLM", "Python", "FastAPI"],
    icon: Brain,
    accent: "blue",
    featured: true,
  },
  {
    id: "lms",
    category: "edu",
    title: "Ecosistema LMS Propietario",
    desc: "Plataforma de Gestión del Aprendizaje con aulas virtuales interactivas, módulos de evaluación en tiempo real y administración académica escalable a miles de usuarios concurrentes.",
    tags: ["React", "Node.js", "PostgreSQL", "WebSockets", "Cloud"],
    icon: BookOpen,
    accent: "emerald",
  },
  {
    id: "bi-dashboards",
    category: "ia",
    title: "Dashboards de Business Intelligence",
    desc: "Construcción de pipelines de datos y dashboards ejecutivos en tiempo real. Transformamos datos brutos en insights accionables para optimizar la toma de decisiones empresariales.",
    tags: ["Python", "Recharts", "SQL", "ETL", "Power BI"],
    icon: BarChart3,
    accent: "violet",
  },
  {
    id: "gov-audit",
    category: "gov",
    title: "Auditoría de Gestión Pública",
    desc: "Sistema de auditoría automatizada de presupuestos y contratación pública. Análisis de cumplimiento normativo con trazabilidad completa y generación de informes ejecutivos.",
    tags: ["Python", "SQL", "CTE", "Automatización", "PDF Export"],
    icon: Landmark,
    accent: "amber",
  },
  {
    id: "health-platform",
    category: "health",
    title: "Plataforma de Gestión Clínica",
    desc: "Software de administración hospitalaria con historiales clínicos electrónicos, gestión de citas, módulos de facturación y reportes estadísticos de salud pública.",
    tags: ["React", "Node.js", "MongoDB", "HIPAA", "REST API"],
    icon: Stethoscope,
    accent: "rose",
  },
  {
    id: "ecommerce",
    category: "commerce",
    title: "Motor de Comercio Electrónico",
    desc: "Plataforma e-commerce con catálogo inteligente, pasarela de pagos integrada, gestión de inventario en tiempo real y analítica de conversión avanzada.",
    tags: ["Next.js", "Stripe", "PostgreSQL", "Redis", "Vercel"],
    icon: Store,
    accent: "orange",
  },
  {
    id: "logistics",
    category: "logistics",
    title: "Sistema de Logística & Rastreo",
    desc: "Plataforma de gestión de flotas y rastreo de envíos en tiempo real con optimización de rutas, notificaciones automáticas y dashboards operativos.",
    tags: ["React Native", "GPS API", "Firebase", "Maps", "WebSockets"],
    icon: Truck,
    accent: "cyan",
  },
  {
    id: "streaming",
    category: "media",
    title: "Infraestructura de Streaming",
    desc: "Despliegue de ecosistemas de transmisión en vivo con protocolos HLS/RTMP, CDN optimizado, baja latencia y soporte para eventos masivos concurrentes.",
    tags: ["HLS", "RTMP", "OBS", "CDN", "Node.js", "FFmpeg"],
    icon: Radio,
    accent: "pink",
  },
  {
    id: "saber11",
    category: "edu",
    title: "Análisis Predictivo Saber 11",
    desc: "Motor de análisis de datos educativos sobre los resultados de las pruebas Saber 11. Modelos predictivos de deserción escolar y rendimiento académico regional.",
    tags: ["Python", "Pandas", "Kaggle", "ML", "Jupyter", "ChromaDB"],
    icon: Target,
    accent: "teal",
  },
  {
    id: "cerebroquant",
    category: "ia",
    title: "CerebroQuant Intelligence Hub",
    desc: "Portal de inteligencia científica y de mercados financieros. Sintetiza modelos macroeconómicos complejos y señales de mercado en tiempo real para inversores institucionales.",
    tags: ["React", "TypeScript", "Recharts", "Vite", "Vercel", "SEO"],
    icon: Activity,
    accent: "indigo",
  },
  {
    id: "data-sovereignty",
    category: "gov",
    title: "Bóveda de Datos Soberana",
    desc: "Infraestructura de almacenamiento y procesamiento de datos con enrutamiento privado mediante túneles encriptados. Cero dependencia de corporaciones externas.",
    tags: ["Ngrok", "ChromaDB", "Encryption", "Python", "FastAPI"],
    icon: ShieldCheck,
    accent: "slate",
  },
  {
    id: "knowledge-ingestion",
    category: "ia",
    title: "Pipeline de Ingestión Cognitiva",
    desc: "Sistema 'Bisturí Semántico' de fragmentación y vectorización masiva de documentos jurídicos, académicos y corporativos para alimentar motores RAG con memoria persistente.",
    tags: ["LangChain", "ChromaDB", "PDF", "DOCX", "Embeddings"],
    icon: Database,
    accent: "fuchsia",
  },
];

/* ── Accent color mapping ── */
const accentMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  badge: "bg-violet-100 text-violet-700" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   badge: "bg-amber-100 text-amber-700" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",     badge: "bg-rose-100 text-rose-700" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",   badge: "bg-orange-100 text-orange-700" },
  cyan:    { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",     badge: "bg-cyan-100 text-cyan-700" },
  pink:    { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",     badge: "bg-pink-100 text-pink-700" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",     badge: "bg-teal-100 text-teal-700" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",   badge: "bg-indigo-100 text-indigo-700" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",    badge: "bg-slate-200 text-slate-700" },
  fuchsia: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200",  badge: "bg-fuchsia-100 text-fuchsia-700" },
};

const Portfolio = () => {
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);
  const abiaProject = projects.find((p) => p.id === "abia")!;
  const abiaColors = accentMap[abiaProject.accent];

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black">
      <Navbar />
      
      <main className="pt-32 pb-24">
        
        {/* ─── Header ─── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              Portafolio de Proyectos
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6 leading-tight">
              Ingeniería adaptada a tu <span className="text-gray-400">operación.</span>
            </h1>
            <p className="text-xl text-gray-500 font-light leading-relaxed">
              Soluciones de software desplegadas en producción real para clientes de todos los sectores. Desde inteligencia artificial soberana hasta plataformas educativas y de salud.
            </p>
          </div>
        </section>

        {/* ─── ABIA Hero Project ─── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="bg-black text-white rounded-[2rem] p-10 md:p-16 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/15 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl opacity-40 pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Proyecto Insignia
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                  ABIA<span className="text-blue-400">.</span>
                </h2>
                <p className="text-gray-400 font-light text-lg leading-relaxed mb-8">
                  {abiaProject.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {abiaProject.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="https://abia.neurolabs.com.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  Acceder al Terminal
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Right — Live KPIs */}
              <div className="grid grid-cols-2 gap-4">
                {abiaProject.metrics!.map((m, i) => (
                  <div
                    key={i}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">{m.label}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Category Filter Tabs ─── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === cat.id
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Project Grid ─── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered
              .filter((p) => !p.featured)
              .map((project) => {
                const colors = accentMap[project.accent] || accentMap.slate;
                const Icon = project.icon;
                return (
                  <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-500 group flex flex-col"
                  >
                    {/* Icon + Category */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} strokeWidth={1.5} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
                        {categories.find((c) => c.id === project.category)?.label}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-black mb-3 leading-snug">{project.title}</h3>
                    <p className="text-gray-500 font-light text-sm leading-relaxed mb-6 flex-1">{project.desc}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#111827] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-full border border-gray-700 bg-gray-800/50 text-xs font-bold tracking-widest text-gray-300 uppercase mb-6">
                Acceso Corporativo
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                ¿Tienes un proyecto en mente?
              </h2>
              <p className="text-lg text-gray-400 font-light">
                Agenda una demostración técnica con nuestros ingenieros para evaluar cómo nuestras soluciones se adaptan a tu ecosistema.
              </p>
            </div>

            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <a
                href="mailto:contacto@neurolabs.com.co?subject=Solicitud%20de%20Proyecto%20-%20NeuroLabs"
                className="group relative flex items-center justify-center gap-3 px-8 py-5 w-full bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Solicitar Cotización
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Portfolio;
