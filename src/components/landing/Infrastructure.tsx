import { Brain, Zap, Database, ShieldCheck, Target } from "lucide-react";

export const Infrastructure = () => {
  return (
    <section id="infraestructura" className="py-24 bg-white relative border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Fase Beta Soberana Finalizada
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight leading-tight mb-4">
              Infraestructura Algorítmica ABIA.
            </h2>
            <p className="text-lg text-gray-500 font-normal">
              Motor RAG cognitivo operativo capaz de realizar auditorías jurídicas y de gestión pública con precisión milimétrica. Ecosistema de inferencia híbrido de alta disponibilidad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
          
          <div className="md:col-span-2 relative bg-black border border-black rounded-xl p-8 flex flex-col justify-between overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity" />
            <div className="relative z-10 text-white">
              <Brain className="w-8 h-8 mb-4 text-blue-400" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold mb-3">Arquitectura Dual-Hemisphere</h3>
              <p className="text-gray-400 font-normal max-w-lg leading-relaxed">
                Integración sinérgica de un <strong className="text-white">Cerebro GPU remoto</strong> acoplado a un <strong className="text-white">Hipocampo Vectorial Local en ChromaDB</strong>. Diseñado para ofrecer un rigor jurisprudencial y socrático del <strong>98%</strong>.
              </p>
            </div>
          </div>

          <div className="relative bg-white border border-gray-200 rounded-xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="relative z-10 text-black">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Latencia Media</span>
              </div>
              <h3 className="text-6xl font-bold mb-2 tracking-tighter">2.5<span className="text-2xl text-gray-400">s</span></h3>
              <p className="text-gray-500 font-normal text-sm">Tiempo de respuesta sostenido por cada inferencia compleja ejecutada.</p>
            </div>
          </div>

          <div className="relative bg-[#FAFAFA] border border-gray-200 rounded-xl p-8 flex flex-col justify-between hover:bg-white transition-colors">
            <Database className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Memoria de Ingestión</h3>
              <p className="text-gray-500 font-normal text-sm">
                Más de <strong className="text-black">24,000 fragmentos</strong> de conocimiento jurídico asimilados a través de nuestro pipeline de "Bisturí Semántico".
              </p>
            </div>
          </div>

          <div className="relative bg-[#FAFAFA] border border-gray-200 rounded-xl p-8 flex flex-col justify-between hover:bg-white transition-colors">
            <ShieldCheck className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-bold text-black mb-2">100% Soberanía de Datos</h3>
              <p className="text-gray-500 font-normal text-sm">
                Procesamiento y enrutamiento privado a través de túneles encriptados sin fugas hacia corporaciones externas.
              </p>
            </div>
          </div>

          <div className="relative bg-[#FAFAFA] border border-gray-200 rounded-xl p-8 flex flex-col justify-between hover:bg-white transition-colors">
            <Target className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <div>
              <div className="flex items-end gap-2 mb-2">
                <h3 className="text-4xl font-bold text-black tracking-tight">96%</h3>
              </div>
              <h4 className="text-sm font-bold text-black mb-1">Inmunidad a Alucinaciones</h4>
              <p className="text-gray-500 font-normal text-xs">
                Control estricto de fuga de contexto para garantizar fiabilidad total en la auditoría.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
