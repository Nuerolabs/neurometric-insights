import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowRight, BookOpen, BarChart3, CheckCircle2, Brain, LineChart } from "lucide-react";
import { useTranslation } from "react-i18next";

const Portfolio = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black">
      <Navbar />
      
      <main className="pt-32 pb-24">
        
        {/* Header Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6 leading-tight">
              {t('portfolio.title')} <span className="text-gray-400">{t('portfolio.title_highlight')}</span>
            </h1>
            <p className="text-xl text-gray-500 font-light leading-relaxed">
              {t('portfolio.subtitle')}
            </p>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Proyecto 1: Software Educativo (Light) */}
            <div className="bg-[#FAFAFA] border border-gray-200 rounded-[2rem] p-10 md:p-14 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 group">
              <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:-translate-y-1 transition-transform">
                <BookOpen className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">{t('portfolio.edu_title')}</h3>
              <p className="text-gray-500 font-light mb-8 leading-relaxed">
                {t('portfolio.edu_desc')}
              </p>
              
              <ul className="space-y-4 mb-10">
                {[t('portfolio.edu_list1'), t('portfolio.edu_list2'), t('portfolio.edu_list3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proyecto 2: Soberanía Cognitiva ABIA (Dark) */}
            <div className="bg-black text-white rounded-[2rem] p-10 md:p-14 shadow-2xl hover:-translate-y-1 transition-transform duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                  <Brain className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('portfolio.abia_title')}</h3>
                <p className="text-gray-400 font-light mb-8 leading-relaxed">
                  {t('portfolio.abia_desc')}
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[t('portfolio.abia_list1'), t('portfolio.abia_list2'), t('portfolio.abia_list3')].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                      <span className="text-gray-300 font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Proyecto 3: Inteligencia Analítica (Light) */}
            <div className="bg-[#FAFAFA] border border-gray-200 rounded-[2rem] p-10 md:p-14 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 group">
              <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:-translate-y-1 transition-transform">
                <BarChart3 className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">{t('portfolio.data_title')}</h3>
              <p className="text-gray-500 font-light mb-8 leading-relaxed">
                {t('portfolio.data_desc')}
              </p>
              
              <ul className="space-y-4 mb-10">
                {[t('portfolio.data_list1'), t('portfolio.data_list2'), t('portfolio.data_list3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proyecto 4: CerebroQuant Hub (Dark) */}
            <div className="bg-black text-white rounded-[2rem] p-10 md:p-14 shadow-2xl hover:-translate-y-1 transition-transform duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                  <LineChart className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('portfolio.quant_title')}</h3>
                <p className="text-gray-400 font-light mb-8 leading-relaxed">
                  {t('portfolio.quant_desc')}
                </p>
                
                <ul className="space-y-4 mb-10">
                  {[t('portfolio.quant_list1'), t('portfolio.quant_list2'), t('portfolio.quant_list3')].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                      <span className="text-gray-300 font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* Massive B2B Call to Action */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-[#111827] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-full border border-gray-700 bg-gray-800/50 text-xs font-bold tracking-widest text-gray-300 uppercase mb-6">
                {t('portfolio.header_badge')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                {t('portfolio.cta_title')}
              </h2>
              <p className="text-lg text-gray-400 font-light mb-0">
                {t('portfolio.cta_desc')}
              </p>
            </div>

            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <a
                href="mailto:contacto@neurolabs.com?subject=Solicitud%20de%20Demostración%20-%20NeuroLabs"
                className="group relative flex items-center justify-center gap-3 px-8 py-5 w-full bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                {t('portfolio.cta_button')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Portfolio;
