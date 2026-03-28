
import React, { useState } from 'react';
import { UserRole, CalendarEvent } from '../types';
import { MINISTRIES } from '../constants';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  CheckCircle2, 
  Clock, 
  Plus, 
  X, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';

const initialEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Congreso Generación de Joel', date: '2026-02-15', status: 'CONFIRMED', ministry: 'Generación de Joel', type: 'CONGRESO', axis: 'E7_JOVENES' },
  { id: 'e2', title: 'Ayuno General Oasis', date: '2026-01-10', status: 'CONFIRMED', ministry: 'Intercesión', type: 'AYUNO', axis: 'E2_INTERCESION' },
  { id: 'e3', title: 'Campamento Elohim', date: '2026-06-20', status: 'TENTATIVE', ministry: 'Jóvenes (Elohim)', type: 'CONGRESO', axis: 'E7_JOVENES' },
  { id: 'e8', title: 'Vigilia por las Familias', date: '2026-01-22', status: 'PENDING', ministry: 'Intercesión', type: 'AYUNO', axis: 'E2_INTERCESION' },
];

const EVENT_TYPES = ['CELEBRACION', 'AYUNO', 'CONGRESO', 'SOCIAL', 'ADMIN', 'EVANGELISMO'];

const CalendarView: React.FC<{ role: UserRole }> = ({ role }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());
  const [showProposeModal, setShowProposeModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-01-01',
    ministry: MINISTRIES[0],
    type: EVENT_TYPES[0],
  });

  const isSuperAdminOrSupervisora = role === UserRole.SUPER_ADMIN || role === UserRole.SUPERVISORA;
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const availableMonths = isSuperAdminOrSupervisora ? monthNames : monthNames.slice(0, 6);

  const getEventsForMonth = (monthIndex: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === monthIndex;
    });
  };

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    const event: CalendarEvent = {
      id: `e_new_${Date.now()}`,
      ...newEvent,
      status: 'PENDING'
    };
    setEvents([...events, event]);
    setShowProposeModal(false);
  };

  const handleApprove = (id: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'CONFIRMED' } : ev));
  };

  const handleReject = (id: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
            <CalendarIcon size={28} className="text-turqui" />
            Calendario Ministerial 2026
          </h2>
          <p className="text-slate-500 text-sm">Planificación Estratégica y Control de Fechas.</p>
        </div>
        <button 
          onClick={() => setShowProposeModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
        >
          <Plus size={20} /> Proponer Evento
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {availableMonths.map((month, idx) => (
          <button
            key={month}
            onClick={() => setActiveMonthIndex(idx)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
              activeMonthIndex === idx ? 'bg-turqui text-white shadow-lg shadow-turqui/20' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-montserrat font-bold text-slate-800">
                {monthNames[activeMonthIndex]} <span className="text-turqui">2026</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setActiveMonthIndex(Math.max(0, activeMonthIndex - 1))} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={24} /></button>
                <button onClick={() => setActiveMonthIndex(Math.min(11, activeMonthIndex + 1))} className="p-2 rounded-full hover:bg-slate-100"><ChevronRight size={24} /></button>
              </div>
            </div>

            <div className="space-y-4">
              {getEventsForMonth(activeMonthIndex).map(event => (
                <EventRow 
                  key={event.id} 
                  event={event} 
                  isReviewer={isSuperAdminOrSupervisora}
                  onApprove={() => handleApprove(event.id)}
                  onReject={() => handleReject(event.id)}
                />
              ))}
              {getEventsForMonth(activeMonthIndex).length === 0 && (
                <div className="py-20 text-center text-slate-400">No hay eventos para este mes.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isSuperAdminOrSupervisora && events.filter(e => e.status === 'PENDING').length > 0 && (
            <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200 shadow-sm">
               <h4 className="font-montserrat font-bold text-amber-800 mb-6 flex items-center gap-2">
                  <AlertCircle size={20} /> Solicitudes Pendientes
               </h4>
               <div className="space-y-4">
                  {events.filter(e => e.status === 'PENDING').map(pending => (
                    <div key={pending.id} className="p-4 bg-white rounded-2xl border border-amber-100 shadow-sm">
                       <p className="text-xs font-bold text-slate-800">{pending.title}</p>
                       <p className="text-[10px] text-slate-500 mt-1">{pending.ministry} - {pending.date}</p>
                       <div className="flex gap-2 mt-4">
                          <button onClick={() => handleApprove(pending.id)} className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1"><Check size={12}/> Aprobar</button>
                          <button onClick={() => handleReject(pending.id)} className="flex-1 py-2 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">Rechazar</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h4 className="font-montserrat font-bold mb-6 flex items-center gap-2">Leyenda de Estados</h4>
            <div className="space-y-4">
               <LegendItem color="bg-turqui" label="Confirmado" desc="Fecha bloqueada oficialmente." />
               <LegendItem color="border-2 border-dashed border-turqui/50" label="Tentativo" desc="Sujeto a confirmación pastoral." />
               <LegendItem color="bg-amber-500" label="En Revisión" desc="Pendiente de aprobación de Admin." />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Propuesta de Evento */}
      {showProposeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <form onSubmit={handlePropose} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-xl font-montserrat font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={24} className="text-turqui" /> Proponer Nueva Fecha
                 </h3>
                 <button type="button" onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Título de la Actividad</label>
                    <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Fecha</label>
                       <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tipo</label>
                       <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                          {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Ministerio Responsable</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={newEvent.ministry} onChange={e => setNewEvent({...newEvent, ministry: e.target.value})}>
                       {MINISTRIES.map(m => <option key={m}>{m}</option>)}
                    </select>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 flex gap-4">
                 <button type="button" onClick={() => setShowProposeModal(false)} className="flex-1 py-3 text-slate-400 font-bold">Cancelar</button>
                 <button type="submit" className="flex-[2] py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20">Enviar para Revisión</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

const EventRow: React.FC<{ 
  event: CalendarEvent, 
  isReviewer: boolean, 
  onApprove: () => void, 
  onReject: () => void 
}> = ({ event, isReviewer, onApprove, onReject }) => {
  const isTentative = event.status === 'TENTATIVE';
  const isPending = event.status === 'PENDING';
  const day = new Date(event.date).getDate() + 1;

  return (
    <div className={`p-6 rounded-3xl border transition-all ${
      isPending ? 'bg-amber-50/30 border-amber-200 border-dashed' : 
      isTentative ? 'bg-white border-slate-100 border-dashed' : 'bg-slate-50 border-transparent shadow-sm'
    }`}>
      <div className="flex items-center gap-6">
        <div className="text-center w-12 shrink-0">
          <p className="text-2xl font-montserrat font-bold text-slate-800">{day}</p>
          <p className="text-[9px] font-bold text-turqui uppercase">Día</p>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
             <div>
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[9px] font-bold px-2 py-0.5 bg-turqui/10 text-turqui rounded-lg uppercase">{event.ministry}</span>
                   <span className="text-[9px] text-slate-400 font-medium">{event.type}</span>
                </div>
             </div>
             {isPending ? (
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1"><Clock size={10} /> EN REVISIÓN</span>
                  {isReviewer && (
                    <div className="flex gap-1 ml-2">
                       <button onClick={onApprove} className="p-1 bg-emerald-500 text-white rounded hover:scale-110 transition-transform"><Check size={12}/></button>
                       <button onClick={onReject} className="p-1 bg-slate-200 text-slate-500 rounded hover:scale-110 transition-transform"><X size={12}/></button>
                    </div>
                  )}
               </div>
             ) : (
               <span className={`text-[9px] font-bold flex items-center gap-1 ${isTentative ? 'text-amber-500' : 'text-emerald-500'}`}>
                 <CheckCircle2 size={10} /> {event.status}
               </span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, desc }: any) => (
  <div className="flex items-center gap-4">
    <div className={`w-4 h-4 rounded ${color}`} />
    <div>
       <p className="text-xs font-bold">{label}</p>
       <p className="text-[10px] text-white/40">{desc}</p>
    </div>
  </div>
);

export default CalendarView;
