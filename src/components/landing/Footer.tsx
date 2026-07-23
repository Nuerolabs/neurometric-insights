export const Footer = () => {
  return (
    <footer className="bg-[#FAFAFA] pt-16 pb-8 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          {/* Brand */}
          <div className="flex items-start gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 bg-white border border-gray-100 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="NeuroLabs Logo" className="w-10 h-10 object-contain mix-blend-multiply" />
            </div>
            <div className="flex flex-col notranslate" translate="no">
              <span className="text-[#111827] font-extrabold tracking-tight leading-none mb-1 text-lg">NeuroLabs Tech</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase leading-none">Solutions SAS</span>
              <span className="mt-2 text-xs text-gray-400 max-w-[220px] leading-relaxed">
                Centro de Investigación en Inteligencia Artificial. Sitionuevo, Magdalena, Colombia.
              </span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h5 className="font-bold text-black mb-3 text-xs uppercase tracking-widest">Soluciones</h5>
              <ul className="space-y-2">
                <li><a href="#agentes" className="text-gray-500 hover:text-black transition-colors">Agentes de IA</a></li>
                <li><a href="#software" className="text-gray-500 hover:text-black transition-colors">Gestión Documental</a></li>
                <li><a href="#software" className="text-gray-500 hover:text-black transition-colors">E-Commerce</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-black mb-3 text-xs uppercase tracking-widest">Empresa</h5>
              <ul className="space-y-2">
                <li><a href="#mision" className="text-gray-500 hover:text-black transition-colors">Misión & Visión</a></li>
                <li><a href="/portfolio" className="text-gray-500 hover:text-black transition-colors">Portafolio</a></li>
                <li><a href="#impacto" className="text-gray-500 hover:text-black transition-colors">Impacto</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-black mb-3 text-xs uppercase tracking-widest">Contacto</h5>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://wa.me/573001234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:contacto@neurolabs.com.co" className="text-gray-500 hover:text-black transition-colors">
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center font-medium notranslate" translate="no">
            © 2026 NeuroLabs Tech Solutions SAS — Sitionuevo, Magdalena, Colombia. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-black transition-colors">Política de Privacidad</a>
            <span>·</span>
            <a href="#" className="hover:text-black transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
