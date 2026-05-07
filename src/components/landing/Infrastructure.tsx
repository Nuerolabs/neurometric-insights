import { Server, Zap, Radio, Cpu, Network } from "lucide-react";

export const Infrastructure = () => {
  return (
    <section id="infraestructura" className="py-24 bg-white relative border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight leading-tight mb-4">
              Arquitectura de Precisión.
            </h2>
            <p className="text-lg text-gray-500 font-normal">
              Hardware ensamblado a medida y ecosistemas de transmisión diseñados para latencia mínima. Infraestructura robusta y transparente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
          
          <div className="md:col-span-2 relative bg-black border border-black p-8 flex flex-col justify-between">
            <div className="relative z-10 text-white">
              <Server className="w-8 h-8 mb-4" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold mb-2">Edge Computing Local</h3>
              <p className="text-gray-400 font-normal max-w-sm">
                Procesamiento de datos en el borde de la red para inferencia en milisegundos, garantizando soberanía de datos.
              </p>
            </div>
          </div>

          <div className="relative bg-white border border-gray-200 p-8 flex flex-col justify-between">
            <div className="relative z-10 text-black">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Latencia Promedio</span>
              </div>
              <h3 className="text-6xl font-bold mb-2 tracking-tighter">12<span className="text-2xl text-gray-400">ms</span></h3>
              <p className="text-gray-500 font-normal text-sm">Respuesta ultrarrápida en transmisión de eventos en vivo.</p>
            </div>
          </div>

          <div className="relative bg-[#FAFAFA] border border-gray-200 p-8 flex flex-col justify-between">
            <Radio className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">Arquitectura Streaming</h3>
              <p className="text-gray-500 font-normal text-sm">
                Soporte técnico y despliegue de protocolos HLS/RTMP con alta disponibilidad.
              </p>
            </div>
          </div>

          <div className="relative bg-[#FAFAFA] border border-gray-200 p-8 flex flex-col justify-between">
            <Cpu className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">Ensamblaje a Medida</h3>
              <p className="text-gray-500 font-normal text-sm">
                Diseño térmico y arquitectónico de hardware específico para requerimientos de alto rendimiento.
              </p>
            </div>
          </div>

          <div className="relative bg-[#FAFAFA] border border-gray-200 p-8 flex flex-col justify-between">
            <Network className="w-8 h-8 text-black mb-4" strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-semibold text-black mb-2">Nodos Distribuidos</h3>
              <p className="text-gray-500 font-normal text-sm">
                Interconexión resiliente asegurando continuidad operativa bajo cualquier escenario.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
