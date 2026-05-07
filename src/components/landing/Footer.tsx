export const Footer = () => {
  return (
    <footer className="bg-[#FAFAFA] pt-16 pb-8 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 bg-[#111827] rounded-md overflow-hidden">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white relative z-10">
                <path d="M5 20V4L19 20V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[#111827] font-extrabold tracking-tight leading-none mb-1">NeuroLab</span>
              <span className="text-[7px] font-bold tracking-[0.2em] text-gray-500 uppercase leading-none">Tech Solutions SAS</span>
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
          <p className="text-xs text-gray-400 text-center font-medium">
            © 2026 NeuroLab Tech Solutions SAS - Sitionuevo, Magdalena, Colombia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
