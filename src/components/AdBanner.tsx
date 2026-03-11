import { useEffect, useState } from 'react';

interface AdBannerProps {
  className?: string;
  dataAdSlot: string;
}

const AdBanner = ({ className = "", dataAdSlot }: AdBannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Retraso inteligente: esperamos 1.5 segundos para que la web vuele al inicio
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true); // Activamos la visibilidad una vez llamado
      } catch (error) {
        console.error("Error cargando AdSense:", error);
      }
    }, 1500);

    return () => clearTimeout(timer); // Limpieza de seguridad
  }, []);

  return (
    <div 
      className={`w-full flex items-center justify-center overflow-hidden bg-gray-50/50 rounded-lg transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ minHeight: '100px' }} // Evita que la página "salte" cuando cargue el anuncio
    >
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-8413991291102968" 
           data-ad-slot={dataAdSlot}
           data-ad-format="auto"
           data-full-width-responsive="true">
      </ins>
    </div>
  );
};

export default AdBanner;
