import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Navbar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-3 group">
              {/* Isotipo Ejecutivo */}
              <div className="relative flex items-center justify-center w-10 h-10 bg-white border border-gray-100 rounded-lg overflow-hidden group-hover:shadow-lg transition-all duration-300">
                <img src="/logo.png" alt="NeuroLab Logo" className="w-8 h-8 object-contain mix-blend-multiply" />
              </div>
              
              {/* Logotipo Tipográfico */}
              <div className="flex flex-col justify-center">
                <span className="text-xl font-extrabold tracking-tight text-[#111827] leading-none mb-1">
                  NeuroLab
                </span>
                <span className="text-[8px] font-bold tracking-[0.25em] text-gray-500 uppercase leading-none">
                  Tech Solutions SAS
                </span>
              </div>
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="/#soluciones" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              {t('navbar.solutions')}
            </a>
            <a href="/#impacto" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              {t('navbar.impact')}
            </a>
            <a href="/portfolio" className="text-sm font-medium text-black hover:text-gray-600 transition-colors border-b border-transparent hover:border-black">
              {t('navbar.portfolio')}
            </a>
            <a href="/docs" className="text-sm font-medium text-black hover:text-gray-600 transition-colors border-b border-transparent hover:border-black">
              {t('navbar.docs')}
            </a>
          </div>

          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="text-xs font-bold tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              <span className={i18n.language === 'en' ? 'text-black' : ''}>EN</span>
              <span className="text-gray-300">|</span>
              <span className={i18n.language === 'es' || i18n.language === 'es-ES' ? 'text-black' : ''}>ES</span>
            </button>
            {/* CTA Profesional Iterativo */}
            <a
              href="https://abia.neurolabs.com.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black bg-white border border-gray-200 rounded-full overflow-hidden transition-all hover:border-black hover:shadow-lg hover:shadow-black/5"
            >
              <div className="absolute inset-0 bg-gray-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                {t('navbar.terminal')}
                <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
