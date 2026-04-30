import React, { useState, useMemo } from 'react';
import { UserRole, CalendarEvent } from '../types';
import { MINISTRIES } from '../constants';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  CheckCircle2, Clock, Plus, X, Check, AlertCircle,
  FileText, Repeat, Trash2, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Recurrence = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  NONE:     'Sin repetición',
  WEEKLY:   'Cada semana',
  BIWEEKLY: 'Cada 2 semanas',
  MONTHLY:  'Cada mes (mismo día)',
};

const RECURRENCE_BADGE: Record<string, string> = {
  'Cada semana':      '↺ Semanal',
  'Cada 2 semanas':   '↺ Quincenal',
  'Cada mes':         '↺ Mensual',
};

// ─── Initial data (exported for App.tsx) ─────────────────────────────────────

export const EVENT_TYPES = ['CELEBRACION', 'AYUNO', 'CONGRESO', 'SOCIAL', 'ADMIN', 'EVANGELISMO', 'SERVICIO'];

export const initialCalendarEvents: CalendarEvent[] = [
  // Q1
  { id: 'e_01', title: 'Ayuno General Oasis',              date: '2026-01-10', status: 'CONFIRMED', ministry: 'Intercesión',        type: 'AYUNO' },
  { id: 'e_02', title: 'Vigilia por las Familias',         date: '2026-01-22', status: 'CONFIRMED', ministry: 'Intercesión',        type: 'AYUNO' },
  { id: 'e_03', title: 'Campaña Evangelismo Sector Norte', date: '2026-02-07', status: 'CONFIRMED', ministry: 'Evangelismo',        type: 'EVANGELISMO' },
  { id: 'e_04', title: 'Congreso Generación de Joel',      date: '2026-02-15', status: 'CONFIRMED', ministry: 'Generación de Joel', type: 'CONGRESO' },
  { id: 'e_05', title: 'Escuela de Líderes Q1',            date: '2026-03-14', status: 'CONFIRMED', ministry: 'Formación Bíblica',  type: 'ADMIN' },
  // Q2
  { id: 'e_06', title: 'Vigilia Semana Santa — 40 Horas',  date: '2026-04-01', status: 'CONFIRMED', ministry: 'Intercesión',        type: 'AYUNO' },
  { id: 'e_07', title: 'Congreso de Danza Profética',      date: '2026-04-18', status: 'TENTATIVE', ministry: 'Danza',              type: 'CONGRESO' },
  { id: 'e_08', title: 'Campaña Evangelismo Sector Sur',   date: '2026-05-02', status: 'PENDING',   ministry: 'Evangelismo',        type: 'EVANGELISMO' },
  { id: 'e_09', title: 'Campamento Elohim Adultos Jóvenes',date: '2026-06-20', status: 'TENTATIVE', ministry: 'Jóvenes (Elohim)',   type: 'CONGRESO' },
  // Q3
  { id: 'e_10', title: 'Feria Social — E6 Atención Social',date: '2026-07-11', status: 'PENDING',   ministry: 'Atención Social',    type: 'SOCIAL' },
  { id: 'e_11', title: 'Congreso General TAFE 2026',       date: '2026-08-01', status: 'CONFIRMED', ministry: 'CSI / Medios',       type: 'CONGRESO' },
  { id: 'e_12', title: 'Campaña Cosecha de Almas Q3',      date: '2026-09-05', status: 'PENDING',   ministry: 'Evangelismo',        type: 'EVANGELISMO' },
  // Q4
  { id: 'e_13', title: 'Escuela de Líderes Q4',            date: '2026-10-03', status: 'PENDING',   ministry: 'Formación Bíblica',  type: 'ADMIN' },
  { id: 'e_14', title: 'Celebración Aniversario TAFE',     date: '2026-11-08', status: 'CONFIRMED', ministry: 'CSI / Medios',       type: 'CELEBRACION' },
  { id: 'e_15', title: 'Congreso de Cierre 2026',          date: '2026-12-05', status: 'TENTATIVE', ministry: 'CSI / Medios',       type: 'CONGRESO' },
  { id: 'e_16', title: 'Vigilia de Año Nuevo — Paso a 2027', date: '2026-12-31', status: 'CONFIRMED', ministry: 'Intercesión',      type: 'CELEBRACION' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const toYMD = (d: Date) => d.toISOString().split('T')[0];

function generateRecurringEvents(
  base: Omit<CalendarEvent, 'id'>,
  recurrence: Recurrence,
  endDate: string
): CalendarEvent[] {
  if (recurrence === 'NONE') {
    return [{ ...base, id: `e_${Date.now()}`, status: 'PENDING' }];
  }

  const groupId = `rg_${Date.now()}`;
  const label = RECURRENCE_LABELS[recurrence];
  const result: CalendarEvent[] = [];
  let current = new Date(base.date + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  let i = 0;

  while (current <= end && i < 200) {
    result.push({
      ...base,
      id: `e_${groupId}_${i}`,
      date: toYMD(current),
      status: 'CONFIRMED',   // recurring services auto-confirm
      recurrenceGroupId: groupId,
      recurrenceLabel: label,
    });
    if (recurrence === 'WEEKLY')   current = addDays(current, 7);
    if (recurrence === 'BIWEEKLY') current = addDays(current, 14);
    if (recurrence === 'MONTHLY')  current = addMonths(current, 1);
    i++;
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CalendarViewProps {
  role: UserRole;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ role, events, setEvents }) => {
  const [activeMonthIndex, setActiveMonthIndex] = useState(new Date().getMonth());
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    date: '2026-01-05',
    ministry: MINISTRIES[0],
    type: EVENT_TYPES[0],
  });
  const [recurrence, setRecurrence] = useState<Recurrence>('NONE');
  const [recurrenceEnd, setRecurrenceEnd] = useState('2026-12-31');

  const isSuperAdminOrSupervisora = role === UserRole.SUPER_ADMIN || role === UserRole.SUPERVISORA;
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const monthEvents = useMemo(() =>
    events
      .filter(e => new Date(e.date + 'T12:00:00').getMonth() === activeMonthIndex)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [events, activeMonthIndex]
  );

  const pendingEvents = events.filter(e => e.status === 'PENDING');

  // Estimate count before submitting
  const previewCount = useMemo(() => {
    if (recurrence === 'NONE' || !form.date || !recurrenceEnd) return 1;
    return generateRecurringEvents(
      { ...form, status: 'CONFIRMED' }, recurrence, recurrenceEnd
    ).length;
  }, [recurrence, form.date, recurrenceEnd, form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvents = generateRecurringEvents(
      { ...form, status: 'PENDING' },
      recurrence,
      recurrenceEnd
    );
    setEvents(prev => [...prev, ...newEvents]);
    setShowModal(false);
    setForm({ title: '', date: '2026-01-05', ministry: MINISTRIES[0], type: EVENT_TYPES[0] });
    setRecurrence('NONE');
  };

  const handleApprove = (id: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'CONFIRMED' } : ev));
  };

  const handleApproveSeries = (groupId: string) => {
    setEvents(prev => prev.map(ev => ev.recurrenceGroupId === groupId ? { ...ev, status: 'CONFIRMED' } : ev));
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const handleDeleteSeries = (groupId: string) => {
    setEvents(prev => prev.filter(ev => ev.recurrenceGroupId !== groupId));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
            <CalendarIcon size={28} className="text-turqui" />
            Calendario Ministerial 2026
          </h2>
          <p className="text-slate-500 text-sm">
            {events.length} eventos · {events.filter(e => e.recurrenceGroupId).length} recurrentes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
        >
          <Plus size={20} /> Proponer Evento
        </button>
      </div>

      {/* Month tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {monthNames.map((month, idx) => {
          const count = events.filter(e => new Date(e.date + 'T12:00:00').getMonth() === idx).length;
          return (
            <button
              key={month}
              onClick={() => setActiveMonthIndex(idx)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all relative ${
                activeMonthIndex === idx
                  ? 'bg-turqui text-white shadow-lg shadow-turqui/20'
                  : 'bg-white text-slate-400 border border-slate-100 hover:border-turqui/30'
              }`}
            >
              {month}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeMonthIndex === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-montserrat font-bold text-slate-800">
                {monthNames[activeMonthIndex]} <span className="text-turqui">2026</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setActiveMonthIndex(Math.max(0, activeMonthIndex - 1))} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={22} /></button>
                <button onClick={() => setActiveMonthIndex(Math.min(11, activeMonthIndex + 1))} className="p-2 rounded-full hover:bg-slate-100"><ChevronRight size={22} /></button>
              </div>
            </div>

            <div className="space-y-3">
              {monthEvents.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  isReviewer={isSuperAdminOrSupervisora}
                  onApprove={() => handleApprove(event.id)}
                  onDelete={() => handleDelete(event.id)}
                  onApproveSeries={event.recurrenceGroupId ? () => handleApproveSeries(event.recurrenceGroupId!) : undefined}
                  onDeleteSeries={event.recurrenceGroupId ? () => handleDeleteSeries(event.recurrenceGroupId!) : undefined}
                />
              ))}
              {monthEvents.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <CalendarIcon size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No hay eventos para {monthNames[activeMonthIndex]}.</p>
                  <button onClick={() => setShowModal(true)} className="mt-4 text-turqui text-sm font-bold hover:underline">
                    + Proponer un evento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {isSuperAdminOrSupervisora && pendingEvents.length > 0 && (
            <div className="bg-amber-50 rounded-[2.5rem] p-6 border border-amber-200 shadow-sm">
              <h4 className="font-montserrat font-bold text-amber-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} /> {pendingEvents.length} Pendiente{pendingEvents.length !== 1 ? 's' : ''}
              </h4>
              <div className="space-y-3">
                {pendingEvents.map(ev => (
                  <div key={ev.id} className="p-3 bg-white rounded-2xl border border-amber-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ev.ministry} · {ev.date}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleApprove(ev.id)} className="flex-1 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
                        <Check size={11} /> Aprobar
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="flex-1 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white">
            <h4 className="font-montserrat font-bold mb-4 text-sm">Leyenda</h4>
            <div className="space-y-3">
              <LegendItem color="bg-turqui" label="Confirmado" desc="Fecha bloqueada oficialmente." />
              <LegendItem color="border-2 border-dashed border-turqui/50" label="Tentativo" desc="Sujeto a confirmación." />
              <LegendItem color="bg-amber-500" label="En Revisión" desc="Pendiente de aprobación." />
              <LegendItem color="bg-turqui/30" label="↺ Recurrente" desc="Evento que se repite." />
            </div>
          </div>

          {/* Recurrence summary */}
          {(() => {
            const groups: Record<string, { label: string; count: number; title: string }> = {};
            events.forEach(e => {
              if (e.recurrenceGroupId) {
                if (!groups[e.recurrenceGroupId]) {
                  groups[e.recurrenceGroupId] = { label: e.recurrenceLabel ?? '', count: 0, title: e.title };
                }
                groups[e.recurrenceGroupId].count++;
              }
            });
            const list = Object.entries(groups);
            if (list.length === 0) return null;
            return (
              <div className="bg-white rounded-[2rem] p-5 border border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Repeat size={12} /> Series recurrentes
                </h4>
                <div className="space-y-2">
                  {list.map(([gid, g]) => (
                    <div key={gid} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{g.title}</p>
                        <p className="text-[9px] text-slate-400">{g.label} · {g.count} fechas</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSeries(gid)}
                        title="Eliminar serie completa"
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp my-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-montserrat font-bold text-slate-800 flex items-center gap-2">
                <FileText size={22} className="text-turqui" /> Proponer Evento
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Título *</label>
                <input
                  required type="text"
                  placeholder="Ej: Servicio Dominical Principal"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Date + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    {recurrence === 'NONE' ? 'Fecha' : 'Primera fecha'} *
                  </label>
                  <input
                    required type="date"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Tipo</label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Ministry */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Ministerio</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={form.ministry}
                  onChange={e => setForm(f => ({ ...f, ministry: e.target.value }))}
                >
                  {MINISTRIES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Recurrence toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                  <Repeat size={11} /> ¿Se repite?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(RECURRENCE_LABELS) as [Recurrence, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRecurrence(key)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                        recurrence === key
                          ? 'bg-navy-tafe text-white border-navy-tafe'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-navy-tafe'
                      }`}
                    >
                      {key !== 'NONE' && <Repeat size={10} className="inline mr-1 opacity-70" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* End date (only if recurring) */}
              {recurrence !== 'NONE' && (
                <div className="bg-turqui/5 border border-turqui/20 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div>
                    <label className="text-[10px] font-bold text-turqui uppercase tracking-widest block mb-1.5">Repetir hasta</label>
                    <input
                      type="date"
                      className="w-full p-3 bg-white border border-turqui/30 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
                      value={recurrenceEnd}
                      onChange={e => setRecurrenceEnd(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-turqui">
                    <RefreshCw size={13} />
                    <span className="text-[11px] font-bold">
                      Se crearán <strong>{previewCount}</strong> fecha{previewCount !== 1 ? 's' : ''} · confirmadas automáticamente
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold rounded-xl hover:bg-slate-100 transition-all">
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 flex items-center justify-center gap-2"
              >
                {recurrence === 'NONE' ? (
                  <><FileText size={16} /> Enviar para revisión</>
                ) : (
                  <><Repeat size={16} /> Crear {previewCount} fechas</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const EventRow: React.FC<{
  event: CalendarEvent;
  isReviewer: boolean;
  onApprove: () => void;
  onDelete: () => void;
  onApproveSeries?: () => void;
  onDeleteSeries?: () => void;
}> = ({ event, isReviewer, onApprove, onDelete, onApproveSeries, onDeleteSeries }) => {
  const [showSeriesMenu, setShowSeriesMenu] = useState(false);
  const isTentative = event.status === 'TENTATIVE';
  const isPending = event.status === 'PENDING';
  const isRecurring = !!event.recurrenceGroupId;
  const day = new Date(event.date + 'T12:00:00').getDate();

  return (
    <div className={`p-5 rounded-3xl border transition-all group relative ${
      isPending   ? 'bg-amber-50/40 border-amber-200 border-dashed' :
      isTentative ? 'bg-white border-slate-200 border-dashed' :
      'bg-slate-50 border-transparent shadow-sm'
    }`}>
      <div className="flex items-center gap-5">
        <div className="text-center w-10 shrink-0">
          <p className="text-2xl font-montserrat font-bold text-slate-800 leading-none">{day}</p>
          <p className="text-[8px] font-bold text-turqui uppercase mt-0.5">
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][new Date(event.date + 'T12:00:00').getDay()]}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-800 truncate">{event.title}</h4>
                {isRecurring && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-turqui/10 text-turqui rounded-full border border-turqui/20 shrink-0">
                    ↺ {event.recurrenceLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[9px] font-bold px-2 py-0.5 bg-turqui/10 text-turqui rounded-lg uppercase">{event.ministry}</span>
                <span className="text-[9px] text-slate-400 font-medium">{event.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isPending && isReviewer && (
                <>
                  <button onClick={onApprove} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:scale-110 transition-transform" title="Aprobar este"><Check size={11} /></button>
                  <button onClick={onDelete} className="p-1.5 bg-slate-200 text-slate-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors" title="Rechazar"><X size={11} /></button>
                </>
              )}
              {!isPending && (
                <span className={`text-[9px] font-bold flex items-center gap-1 ${isTentative ? 'text-amber-500' : 'text-emerald-500'}`}>
                  <CheckCircle2 size={10} /> {event.status}
                </span>
              )}
              {isPending && !isReviewer && (
                <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1"><Clock size={10} /> EN REVISIÓN</span>
              )}

              {/* Series options */}
              {isRecurring && isReviewer && (
                <div className="relative">
                  <button
                    onClick={() => setShowSeriesMenu(s => !s)}
                    className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
                    title="Opciones de serie"
                  >
                    <Repeat size={12} />
                  </button>
                  {showSeriesMenu && (
                    <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 w-52 overflow-hidden animate-slideDown">
                      <p className="px-4 pt-3 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Serie recurrente</p>
                      {onApproveSeries && (
                        <button onClick={() => { onApproveSeries(); setShowSeriesMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2">
                          <Check size={12} /> Aprobar toda la serie
                        </button>
                      )}
                      <button onClick={() => { onDelete(); setShowSeriesMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <X size={12} /> Eliminar solo este
                      </button>
                      {onDeleteSeries && (
                        <button onClick={() => { onDeleteSeries(); setShowSeriesMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                          <Trash2 size={12} /> Eliminar toda la serie
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, desc }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded shrink-0 ${color}`} />
    <div>
      <p className="text-xs font-bold">{label}</p>
      <p className="text-[10px] text-white/40">{desc}</p>
    </div>
  </div>
);

export default CalendarView;
