import React, { useEffect } from 'react';
import { Facebook } from 'lucide-react';

declare global {
  interface Window { FB?: { XFBML: { parse: () => void } } }
}

const FB_PAGE_URL = 'https://www.facebook.com/Tabernaculoapostolicodefe';

const FacebookSection: React.FC = () => {
  useEffect(() => {
    // Re-parsea el plugin si el SDK ya cargó antes que este componente montara
    if (window.FB) window.FB.XFBML.parse();
  }, []);

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center">
          <Facebook size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Redes Sociales</p>
          <h3 className="font-montserrat font-bold text-slate-800 text-sm">Facebook — TAFE</h3>
        </div>
        <a
          href={FB_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] font-bold text-[#1877F2] hover:underline"
        >
          Ver página →
        </a>
      </div>

      {/* Facebook Page Plugin */}
      <div className="flex justify-center px-4 py-6 bg-slate-50">
        <div
          className="fb-page"
          data-href={FB_PAGE_URL}
          data-tabs="timeline"
          data-width="500"
          data-height="600"
          data-small-header="true"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        />
      </div>
    </section>
  );
};

export default FacebookSection;
