export const Footer = () => {
  return (
    <footer className="bg-[#FAFAFA] pt-16 pb-8 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 bg-white border border-gray-100 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="NeuroLabs Logo" className="w-10 h-10 object-contain mix-blend-multiply" />
            </div>
            <div className="flex flex-col notranslate" translate="no">
              <span className="text-[#111827] font-extrabold tracking-tight leading-none mb-1 text-lg">NeuroLabs Tech</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase leading-none">Solutions SAS</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#soluciones" className="text-sm text-gray-500 hover:text-[#111827] transition-colors">
              Soluciones
            </a>
            <a href="#impacto" className="text-sm text-gray-500 hover:text-[#111827] transition-colors">
              Impacto
            </a>
            <a href="#infraestructura" className="text-sm text-gray-500 hover:text-[#111827] transition-colors">
              Infraestructura
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-[#111827] transition-colors">
              Privacidad
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200/60 flex flex-col items-center">
          <p className="text-xs text-gray-400 text-center font-medium notranslate" translate="no">
            © 2026 NeuroLabs Tech Solutions SAS - Sitionuevo, Magdalena, Colombia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
