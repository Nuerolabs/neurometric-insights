import { Database, Network, Cpu, ShieldCheck, Activity } from "lucide-react";

export const Impact = () => {
  return (
    <section id="impacto" className="py-32 bg-[#F8F9FA] relative overflow-hidden">
      {/* Refined subtle background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-gray-200 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
          
          {/* Left Text Content (Takes up 2 columns) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Tecnología Core</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-black tracking-tight leading-[1.1] mb-6">
              Infraestructura <br/>
              <span className="text-gray-400 font-light">Algorítmica.</span>
            </h2>
            
            <p className="text-lg text-gray-500 leading-relaxed mb-12 font-light">
              Desarrollamos el motor ABIA: un ecosistema de procesamiento avanzado diseñado para escalar operaciones, optimizar flujos de datos y garantizar la autonomía técnica de tu organización.
            </p>

            <div className="space-y-8 w-full">
              {[
                { title: "Procesamiento Semántico", desc: "Análisis de datos estructurados y no estructurados en tiempo real.", icon: Database },
                { title: "Arquitectura Distribuida", desc: "Despliegue en nodos locales para latencia cero.", icon: Network },
                { title: "Inferencia Optimizada", desc: "Modelos ligeros diseñados para hardware de bajo consumo.", icon: Cpu },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-5 group cursor-default">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:text-black group-hover:border-gray-300 transition-all duration-500">
                      <item.icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Experience (Takes up 3 columns) */}
          <div className="lg:col-span-3 relative w-full h-[650px] bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col">
            
            {/* Top Bar */}
            <div className="h-14 border-b border-gray-100 bg-gray-50/50 flex items-center px-6 justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                </div>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">ABIA // Engine Overview</div>
              <ShieldCheck className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 p-8 relative bg-dot-pattern">
              {/* Subtle grid background */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />

              <div className="relative z-10 h-full flex flex-col gap-6">
                
                {/* Main Metric Card */}
                <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-end hover:shadow-md transition-shadow duration-500">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                      <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Estado de Implementación</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-light tracking-tighter text-black">Fase Beta Activa</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Motor en entrenamiento iterativo. Ya respondiendo en entornos reales.</p>
                  </div>
                  <div className="h-16 w-32 flex items-end gap-1.5 opacity-80">
                    {[30, 45, 60, 50, 70, 85, 65].map((h, i) => (
                      <div key={i} className="flex-1 bg-gray-900 rounded-t-sm animate-[pulse_3s_ease-in-out_infinite]" style={{ height: `${h}%`, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 flex-1">
                  {/* Secondary Card 1 */}
                  <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                        <Network className="w-4 h-4 text-black" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">ACTIVO</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Nodos de Datos</p>
                      <p className="text-3xl font-light text-black">1,204</p>
                    </div>
                  </div>

                  {/* Secondary Card 2 */}
                  <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                        <Activity className="w-4 h-4 text-black" strokeWidth={1.5} />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                        SYNC
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Latencia Media</p>
                      <p className="text-3xl font-light text-black">12<span className="text-lg text-gray-400 ml-1">ms</span></p>
                    </div>
                  </div>
                </div>

                {/* Bottom Status Bar */}
                <div className="bg-black rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-black/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[marquee_3s_ease-in-out_infinite]" />
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-10 h-10">
                      <div className="absolute inset-0 border-2 border-white/20 rounded-full border-t-white animate-spin" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Motor ABIA en ejecución</p>
                      <p className="text-gray-400 text-xs font-light">Procesando volúmenes de datos distribuidos...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-500 uppercase">Uptime</p>
                    <p className="text-white font-mono text-sm">99.99%</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
