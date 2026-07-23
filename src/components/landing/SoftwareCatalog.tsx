import { ArrowRight, FolderOpen, ShoppingCart, CheckCircle2, Shield, CreditCard, Archive } from "lucide-react";

// ─── TypeScript Interface ───────────────────────────────────────────────────
export interface SoftwareProduct {
  id: string;
  icon: React.ElementType;
  category: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  integrations: string[];
  targetBadge: string;
  cta: string;
  ctaEventName: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────
const SOFTWARE_PRODUCTS: SoftwareProduct[] = [
  {
    id: "gestion-documental",
    icon: Archive,
    category: "Sector Público",
    badge: "Entidades Públicas",
    badgeColor: "bg-blue-700 text-white",
    title: "Sistema de Gestión Documental",
    subtitle: "Digitalización · Trazabilidad · Cumplimiento Normativo",
    description:
      "Plataforma institucional para la radicación, gestión y archivo digital de documentos con cumplimiento pleno de la normativa colombiana de gestión documental.",
    features: [
      "Radicación y trazabilidad completa de documentos",
      "Flujos de aprobación configurables por rol",
      "Firmas digitales y certificación electrónica",
      "Archivo central con metadatos y búsqueda semántica",
      "Auditoría de accesos y cambios en tiempo real",
      "Cumplimiento Ley 594 de 2000 y lineamientos AGN",
    ],
    integrations: ["SIGEP", "SECOP", "SGR", "SUIT", "Gobierno en Línea"],
    targetBadge: "Alcaldías · Gobernaciones · Entidades Descentralizadas",
    cta: "Solicitar Propuesta",
    ctaEventName: "cta_software_documental",
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    category: "Comercio Digital",
    badge: "Empresas & Emprendimientos",
    badgeColor: "bg-emerald-600 text-white",
    title: "Sistema de E-Commerce",
    subtitle: "Tienda Online · Pagos · Inventario · Analytics",
    description:
      "Plataforma de comercio electrónico robusta con integraciones de pago colombianas, gestión de inventario en tiempo real y panel administrativo completo.",
    features: [
      "Tienda online responsive y optimizada para SEO",
      "Gestión de inventario y catálogo de productos",
      "Carrito de compras y proceso de checkout optimizado",
      "Panel administrativo con reportes de ventas",
      "Integración con operadores logísticos nacionales",
      "Analytics de comportamiento de compradores",
    ],
    integrations: ["PSE", "Wompi", "Mercado Pago", "PayU", "Bancolombia"],
    targetBadge: "PYMEs · Retail · Distribuidoras · Artesanos",
    cta: "Ver Demo en Vivo",
    ctaEventName: "cta_software_ecommerce",
  },
];

// ─── Helper: GA4 Event Tracker ──────────────────────────────────────────────
const trackGA4Event = (eventName: string, productId: string) => {
  if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
    (window as Window & { gtag: Function }).gtag("event", eventName, {
      event_category: "software_empresarial",
      event_label: productId,
      value: 1,
    });
  }
};

// ─── Component ──────────────────────────────────────────────────────────────
export const SoftwareCatalog = () => {
  return (
    <section id="software" className="py-24 bg-white px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
            <FolderOpen className="w-3.5 h-3.5 text-gray-500" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase">
              Desarrollo de Software Empresarial
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight mb-4">
            Software a medida{" "}
            <span className="text-gray-400 font-light">
              para instituciones y empresas.
            </span>
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed font-light">
            Desarrollamos plataformas robustas, escalables y adaptadas a los requerimientos normativos y operativos de cada cliente.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SOFTWARE_PRODUCTS.map((product) => {
            const ProductIcon = product.icon;
            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 overflow-hidden"
              >
                {/* Color accent top bar */}
                <div className={`h-1 w-full ${product.id === "gestion-documental" ? "bg-blue-600" : "bg-emerald-500"}`} />

                <div className="p-8 lg:p-10 flex flex-col gap-6 flex-grow">
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:border-gray-200 transition-colors">
                      <ProductIcon
                        className={`w-7 h-7 ${product.id === "gestion-documental" ? "text-blue-600" : "text-emerald-600"}`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${product.badgeColor}`}>
                        {product.badge}
                      </span>
                      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-1.5 leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">
                      {product.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {product.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${product.id === "gestion-documental" ? "text-blue-500" : "text-emerald-500"}`}
                          strokeWidth={2}
                        />
                        <span className="text-sm text-gray-700">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Integrations */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      {product.id === "gestion-documental" ? (
                        <Shield className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                      )}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {product.id === "gestion-documental" ? "Integraciones Gobierno" : "Pasarelas de Pago"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.integrations.map((intg, i) => (
                        <span
                          key={i}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            product.id === "gestion-documental"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {intg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target */}
                  <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Ideal para
                    </p>
                    <p className="text-sm font-semibold text-gray-700">{product.targetBadge}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-8 lg:px-10 pb-8 lg:pb-10">
                  <a
                    id={`cta-${product.id}`}
                    href="https://wa.me/573001234567?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20el%20software%20de%20NeuroLabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackGA4Event(product.ctaEventName, product.id)}
                    className={`group/btn w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                      product.id === "gestion-documental"
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {product.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-6 rounded-2xl border border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm text-gray-600 font-medium">
              Todos nuestros sistemas incluyen código fuente propietario, soporte técnico y capacitación al equipo.
            </p>
          </div>
          <a
            id="cta-software-general"
            href="https://wa.me/573001234567?text=Hola%2C%20quiero%20una%20propuesta%20de%20software%20personalizado"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGA4Event("cta_software_personalizado", "footer_banner")}
            className="group flex-shrink-0 inline-flex items-center gap-2 text-sm font-bold text-black underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            ¿Necesitas algo diferente?
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};
