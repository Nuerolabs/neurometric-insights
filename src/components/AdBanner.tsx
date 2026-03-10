import { useEffect } from 'react';

interface AdBannerProps {
  className?: string;
  dataAdSlot: string; // ¡Aquí está la magia!
}

const AdBanner = ({ className = "", dataAdSlot }: AdBannerProps) => {
  useEffect(() => {
    try {
      // Le decimos a Google que inyecte el anuncio en este espacio
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("Error cargando AdSense:", error);
    }
  }, []);

  return (
    <div className={`w-full flex items-center justify-center overflow-hidden bg-gray-50 rounded-lg ${className}`}>
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
