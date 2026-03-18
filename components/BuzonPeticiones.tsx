
import React, { useState } from 'react';
import { User, PrayerRequest, UserRole } from '../types';
import { 
  Inbox, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  ChevronRight,
  User as UserIcon
} from 'lucide-react';

interface BuzonPeticionesProps {
  user: User;
  initialRequests: PrayerRequest[];
  onUpdateRequests: (reqs: PrayerRequest[]) => void;
}

const BuzonPeticiones: React.FC<BuzonPeticionesProps> = ({ user, initialRequests, onUpdateRequests }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    category: 'ESPIRITUAL' as PrayerRequest['category'],
    urgency: 'MEDIA' as PrayerRequest['urgency'],
    content: '',
  });

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const displayRequests = isSuperAdmin 
    ? initialRequests 
    : initialRequests.filter(r => r.authorId === user.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: PrayerRequest = {
      id: `pr_${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      category: newRequest.category,
      urgency: newRequest.urgency,
      content: newRequest.content,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
    onUpdateRequests([req, ...initialRequests]);
    setShowSubmitModal(false);
    setNewRequest({ category: 'ESPIRITUAL', urgency: 'MEDIA', content: '' });
  };

  const updateStatus = (id: string, status: PrayerRequest['status']) => {
    onUpdateRequests(initialRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
           <div className={`p-4 rounded-[1.8rem] shadow-xl ${isSuperAdmin ? 'bg-slate-900 text-turqui' : 'bg-turqui text-white'}`}>
              <Inbox size={34} />
           </div>
           <div>
              <h2 className="text-2xl font-montserrat font-bold text-slate-800">
                {isSuperAdmin ? 'Buzón Pastoral (Local)' : 'Mi Buzón'}
              </h2>
           </div>
        </div>
        {!isSuperAdmin && (
          <button onClick={() => setShowSubmitModal(true)} className="flex items-center gap-2 px-8 py-4 bg-turqui text-white font-bold rounded-2xl">
            <PlusCircle size={20} /> Nueva Solicitud
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">Resumen Local</h4>
             <div className="space-y-4">
                <div className="flex justify-between font-bold text-xs"><span>Total</span><span>{displayRequests.length}</span></div>
             </div>
           </div>
        </aside>

        <div className="lg:col-span-3 space-y-5">
          {displayRequests.map((req) => (
            <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:shadow-xl transition-all">
               <div className="flex justify-between mb-4">
                  <h4 className="font-bold text-slate-800">{isSuperAdmin ? req.authorName : 'Mi Solicitud'}</h4>
                  <span className="text-[8px] font-bold px-2 py-1 bg-slate-100 rounded uppercase">{req.status}</span>
               </div>
               <p className="text-sm text-slate-600 italic">"{req.content}"</p>
               {isSuperAdmin && req.status !== 'RESOLVED' && (
                  <div className="mt-6 pt-4 border-t flex gap-2">
                     <button onClick={() => updateStatus(req.id, 'RESOLVED')} className="text-[9px] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded">Resolver</button>
                  </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10">
              <h3 className="text-xl font-montserrat font-bold mb-6">Nueva Petición</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <textarea required className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newRequest.content} onChange={e => setNewRequest({...newRequest, content: e.target.value})} />
                 <button type="submit" className="w-full py-5 bg-turqui text-white font-bold rounded-2xl">Enviar a la Base de Datos Local</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BuzonPeticiones;
