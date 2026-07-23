import { ArrowRight } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-3 group">
              {/* Isotipo */}
              <div className="relative flex items-center justify-center w-14 h-14 bg-white border border-gray-100 rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-300">
                <img src="/logo.png" alt="NeuroLabs Logo" className="w-12 h-12 object-contain mix-blend-multiply" />
              </div>
              {/* Logotipo */}
              <div className="flex flex-col justify-center notranslate" translate="no">
                <span className="text-2xl font-extrabold tracking-tight text-[#111827] leading-none mb-1">
                  NeuroLabs Tech
                </span>
                <span className="text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase leading-none">
                  Solutions SAS
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="/#agentes" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              Agentes IA
            </a>
            <a href="/#software" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              Software
            </a>
            <a href="/#mision" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              Misión
            </a>
            <a href="/portfolio" className="text-sm font-medium text-black hover:text-gray-600 transition-colors border-b border-transparent hover:border-black">
              Portafolio
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <a
              id="navbar-cta-agenda"
              href="https://wa.me/573001234567?text=Hola%2C%20quiero%20agendar%20una%20consulta%20con%20NeuroLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-black rounded-full overflow-hidden transition-all hover:bg-gray-900 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="absolute inset-0 bg-gray-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Agenda Consulta
                <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
