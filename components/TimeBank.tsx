
import React, { useState } from 'react';
import { UserRole, User, TimeBankOffer } from '../types';
import { Search, HeartHandshake, Plus, ArrowRight, Star, ShieldCheck, DollarSign, X, Check } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../constants';

const mockOffers: TimeBankOffer[] = [
  { id: 'o1', userId: 'u_m1', userName: 'Hno. Pedro', talent: 'Reparación Eléctrica', description: 'Ayuda técnica para fallos eléctricos básicos en el hogar.', availability: 'Sábados pm', category: 'TECNICO' },
  { id: 'o2', userId: 'u_m2', userName: 'Marta R.', talent: 'Asesoría Contable', description: 'Revisión de facturas y declaración para pequeños negocios.', availability: 'Lunes a Viernes (8-9pm)', category: 'LEGAL' },
  { id: 'o3', userId: 'u_m4', userName: 'Claudia S.', talent: 'Diseño para Redes', description: 'Creación de post para ministerios o emprendimientos de miembros.', availability: 'Bajo pedido', category: 'EDUCACION' },
];

interface TimeBankProps {
  role: UserRole;
  user: User;
}

const TimeBank: React.FC<TimeBankProps> = ({ role, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    category: 'EDUCACION',
    talent: '',
    description: '',
    availability: ''
  });

  const isLeader = role !== UserRole.MIEMBRO;

  const handleCreateOffer = () => {
    // Demo implementation
    setShowOfferModal(false);
    alert('Tu oferta ha sido publicada en el Marketplace Ministerial');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banco de Tiempo */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-montserrat font-bold mb-4 flex items-center gap-3">
              <HeartHandshake size={32} className="text-turqui" />
              Banco de Tiempo
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Invierte tu talento en el reino. Dona tiempo para ayudar a otros y acumula créditos de honor para cuando tú necesites apoyo.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowOfferModal(true)}
                className="px-6 py-3 bg-turqui text-white font-bold rounded-2xl shadow-lg shadow-turqui/20 hover:scale-105 transition-all"
              >
                Ofrecer mi Talento
              </button>
              <button className="px-6 py-3 bg-white/10 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                Pedir un Favor
              </button>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 w-full md:w-80 shadow-inner">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Mi Billetera de Tiempo</p>
            <div className="flex items-end gap-2 mb-2">
               <span className="text-5xl font-mono font-bold text-turqui">{user.timeBankBalance}</span>
               <span className="text-sm font-bold text-white/40 pb-2">Horas</span>
            </div>
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/5">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-white/60">Estatus: Miembro de Honor</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <DollarSign size={200} />
        </div>
      </div>

      {/* Marketplace de Talentos */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-montserrat font-bold text-slate-800">Marketplace de Talentos</h3>
            <p className="text-slate-500 text-xs">Busca hermanos dispuestos a colaborar en momentos de necesidad.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="¿Qué servicio necesitas?" 
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 ring-turqui/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockOffers.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
          <button 
            onClick={() => setShowOfferModal(true)}
            className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:border-turqui hover:text-turqui transition-all bg-white/50 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-turqui/10 transition-colors">
              <Plus size={24} />
            </div>
            <p className="font-bold text-sm">Ofrecer mi tiempo</p>
          </button>
        </div>
      </section>

      {/* MODAL: Ofrecer Talento (Airtable-like structure) */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-montserrat font-bold text-slate-800">Ofrecer mi Talento</h3>
                <p className="text-slate-400 text-xs">Dona tus habilidades al Banco de Tiempo.</p>
              </div>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Categoría del Servicio</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setNewOffer({...newOffer, category: cat.id})}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${newOffer.category === cat.id ? 'bg-turqui border-turqui text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nombre del Servicio</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Clases de Matemáticas"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    value={newOffer.talent}
                    onChange={e => setNewOffer({...newOffer, talent: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Descripción Corta</label>
                  <textarea 
                    placeholder="¿Cómo puedes ayudar a los demás?"
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none"
                    value={newOffer.description}
                    onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Disponibilidad</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Sábados de 2pm a 5pm"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    value={newOffer.availability}
                    onChange={e => setNewOffer({...newOffer, availability: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={handleCreateOffer}
                className="w-full py-4 bg-turqui text-white font-bold rounded-2xl shadow-lg shadow-turqui/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Check size={20} /> Publicar en el Marketplace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OfferCard: React.FC<{ offer: TimeBankOffer }> = ({ offer }) => (
  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <div className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full uppercase tracking-widest">
        {offer.category}
      </div>
      <div className="w-10 h-10 rounded-xl bg-turqui/10 flex items-center justify-center text-turqui">
        <Star size={18} />
      </div>
    </div>
    <h4 className="text-lg font-montserrat font-bold text-slate-800 mb-2 group-hover:text-turqui transition-colors">{offer.talent}</h4>
    <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">{offer.description}</p>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
        <img src={`https://picsum.photos/seed/${offer.userId}/50/50`} alt="" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-800">{offer.userName}</p>
        <p className="text-[9px] text-slate-400 uppercase">{offer.availability}</p>
      </div>
    </div>
    <button className="w-full py-3 bg-slate-50 text-slate-500 font-bold text-xs rounded-xl group-hover:bg-turqui group-hover:text-white transition-all flex items-center justify-center gap-2">
      Contactar <ArrowRight size={14} />
    </button>
  </div>
);

export default TimeBank;
