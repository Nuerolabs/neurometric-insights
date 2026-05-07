import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 min-h-[90vh] bg-white">
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black tracking-tighter leading-[1.1] mb-8 animate-fade-in-up">
          {t('hero.title_part1')} <br className="hidden md:block" />
          {t('hero.title_part2')}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-12 leading-relaxed animate-fade-in-up animation-delay-100 font-normal">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200 w-full sm:w-auto">
          <a
            href="https://abia.neurolabs.com.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-black rounded-md overflow-hidden transition-all hover:bg-gray-900 w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center">
              {t('hero.deploy')}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            href="#vision"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white border border-gray-200 rounded-md transition-all hover:bg-gray-50 w-full sm:w-auto"
          >
            {t('hero.framework')}
          </a>
        </div>
      </div>
    </section>
  );
};
