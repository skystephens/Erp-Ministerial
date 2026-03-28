import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Edit2, Save, X,
  Loader, AlertCircle, Clock, Users, CalendarDays, WifiOff,
} from 'lucide-react';
import {
  getHorarioCSI, updateHorarioCSI, HorarioCSIFields,
  airtableIsActive,
} from '../services/airtableService';

// ─── Types ───────────────────────────────────────────────────────────────────

type RecordEntry = { id: string; fields: HorarioCSIFields };

// ─── Static data ─────────────────────────────────────────────────────────────

const ALL_PEOPLE = [
  'Sky', 'Guillermo', 'Joseph', 'Heidy', 'Juan Diego', 'Jordany',
  'Karen', 'Luis Carlos', 'Jimmy', 'Jefferson', 'Alex', 'Ares',
  'Andres', 'Jennifer', 'Emanuel', 'Angel', 'Jorge',
];

const ALL_ROLES = [
  'Pc 1 Pantalla', 'Pc 2 Switch y envivo', 'Sonido', 'Cámara 1', 'Cámara 2',
  'Luces', 'Soporte General', 'Fotografía/contenido', 'Creación de Predica',
  'Revisión Ortográfica', 'Tafe News', 'Montaje Easy Worship',
];

const ALL_SERVICES = [
  'Viernes 7:30pm', 'Sábado 6am', 'Domingo 7:30am',
  'Domingo 9:30am (principal)', 'Martes 6:30pm (sede)', 'Domingo 9:30am (sede)',
];

const ROLE_COLOR: Record<string, string> = {
  'Sonido': 'bg-blue-100 text-blue-700 border-blue-200',
  'Cámara 1': 'bg-purple-100 text-purple-700 border-purple-200',
  'Cámara 2': 'bg-purple-100 text-purple-700 border-purple-200',
  'Luces': 'bg-amber-100 text-amber-700 border-amber-200',
  'Pc 1 Pantalla': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Pc 2 Switch y envivo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Fotografía/contenido': 'bg-pink-100 text-pink-700 border-pink-200',
  'Tafe News': 'bg-red-100 text-red-700 border-red-200',
  'Soporte General': 'bg-slate-100 text-slate-600 border-slate-200',
  'Creación de Predica': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Revisión Ortográfica': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Montaje Easy Worship': 'bg-orange-100 text-orange-700 border-orange-200',
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ─── Offline mock data ────────────────────────────────────────────────────────

const MOCK_RECORDS: RecordEntry[] = [
  { id: 'mk1', fields: { Fecha: '2026-03-29', Servicio: 'Domingo 9:30am (principal)', 'Rol Asignado': 'Pc 1 Pantalla', 'Persona a cargo': ['Guillermo'] } },
  { id: 'mk2', fields: { Fecha: '2026-03-29', Servicio: 'Domingo 9:30am (principal)', 'Rol Asignado': 'Sonido', 'Persona a cargo': ['Sky'] } },
  { id: 'mk3', fields: { Fecha: '2026-03-29', Servicio: 'Domingo 9:30am (principal)', 'Rol Asignado': 'Luces', 'Persona a cargo': ['Joseph'] } },
  { id: 'mk4', fields: { Fecha: '2026-04-04', Servicio: 'Viernes 7:30pm', 'Rol Asignado': 'Sonido', 'Persona a cargo': ['Sky'] } },
  { id: 'mk5', fields: { Fecha: '2026-04-04', Servicio: 'Viernes 7:30pm', 'Rol Asignado': 'Pc 1 Pantalla', 'Persona a cargo': ['Juan Diego'] } },
  { id: 'mk6', fields: { Fecha: '2026-04-05', Servicio: 'Sábado 6am', 'Rol Asignado': 'Cámara 1', 'Persona a cargo': ['Heidy'] } },
  { id: 'mk7', fields: { Fecha: '2026-04-06', Servicio: 'Domingo 9:30am (principal)', 'Rol Asignado': 'Fotografía/contenido', 'Persona a cargo': ['Jennifer'] } },
  { id: 'mk8', fields: { Fecha: '2026-04-06', Servicio: 'Domingo 9:30am (principal)', 'Rol Asignado': 'Tafe News', 'Persona a cargo': ['Karen', 'Andres'] } },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const todayKey = () => new Date().toISOString().split('T')[0];

// ─── Sub-components ───────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLOR[role] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
    {role}
  </span>
);

const ServiceDot: React.FC<{ count: number }> = ({ count }) => (
  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-bold ${count > 0 ? 'bg-turqui text-white' : 'bg-transparent'}`}>
    {count > 0 ? count : ''}
  </span>
);

// ─── Edit Row Component ───────────────────────────────────────────────────────

const EditRow: React.FC<{
  record: RecordEntry;
  onSave: (id: string, fields: Partial<HorarioCSIFields>) => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ record, onSave, onCancel, saving }) => {
  const [rol, setRol] = useState(record.fields['Rol Asignado'] ?? '');
  const [personas, setPersonas] = useState<string[]>(record.fields['Persona a cargo'] ?? []);
  const [notas, setNotas] = useState(record.fields.Notas ?? '');

  const togglePerson = (p: string) =>
    setPersonas(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div className="bg-slate-50 border border-turqui/30 rounded-2xl p-4 space-y-3">
      <div>
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Rol</label>
        <select
          value={rol}
          onChange={e => setRol(e.target.value)}
          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 ring-turqui"
        >
          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Personas a cargo</label>
        <div className="flex flex-wrap gap-1">
          {ALL_PEOPLE.map(p => (
            <button
              key={p}
              onClick={() => togglePerson(p)}
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                personas.includes(p)
                  ? 'bg-turqui text-white border-turqui'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-turqui'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Notas</label>
        <input
          type="text"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Observaciones..."
          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 ring-turqui"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(record.id, { 'Rol Asignado': rol, 'Persona a cargo': personas, Notas: notas })}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-turqui text-white text-[10px] font-bold rounded-xl hover:bg-turqui/80 transition-all disabled:opacity-50"
        >
          {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />} Guardar
        </button>
        <button
          onClick={onCancel}
          className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Day Detail Panel ─────────────────────────────────────────────────────────

const DayDetail: React.FC<{
  dateKey: string;
  records: RecordEntry[];
  onClose: () => void;
  onUpdate: (id: string, fields: Partial<HorarioCSIFields>) => void;
  canEdit: boolean;
}> = ({ dateKey, records, onClose, onUpdate, canEdit }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const byService = useMemo(() => {
    const map: Record<string, RecordEntry[]> = {};
    records.forEach(r => {
      const svc = r.fields.Servicio ?? 'Sin Servicio';
      if (!map[svc]) map[svc] = [];
      map[svc].push(r);
    });
    return map;
  }, [records]);

  const handleSave = async (id: string, fields: Partial<HorarioCSIFields>) => {
    setSaving(true);
    await onUpdate(id, fields);
    setSaving(false);
    setEditingId(null);
  };

  const [, month, day] = dateKey.split('-').map(Number);

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm animate-fadeIn">
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Servicios del día</p>
          <h4 className="text-lg font-montserrat font-bold text-slate-800">
            {DAY_NAMES[new Date(dateKey + 'T12:00:00').getDay()]} {day} {MONTH_NAMES[month - 1]}
          </h4>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {records.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Sin servicios registrados este día.</p>
      ) : (
        <div className="space-y-5">
          {Object.entries(byService).map(([svc, recs]) => (
            <div key={svc}>
              <p className="text-[9px] font-bold text-navy-tafe uppercase tracking-widest flex items-center gap-2 mb-2">
                <Clock size={10} /> {svc}
              </p>
              <div className="space-y-2">
                {recs.map(r => (
                  <div key={r.id}>
                    {editingId === r.id ? (
                      <EditRow record={r} onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} />
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-turqui/30 transition-all group">
                        <div className="flex items-center gap-3 flex-wrap">
                          <RoleBadge role={r.fields['Rol Asignado']} />
                          <div className="flex items-center gap-1">
                            <Users size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-600 font-medium">
                              {(r.fields['Persona a cargo'] ?? []).join(', ') || '—'}
                            </span>
                          </div>
                          {r.fields.Notas && (
                            <span className="text-[9px] text-slate-400 italic">{r.fields.Notas}</span>
                          )}
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => setEditingId(r.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white border border-slate-200 hover:border-turqui hover:text-turqui transition-all"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface HorarioCSIProps {
  canEdit?: boolean;
}

const HorarioCSI: React.FC<HorarioCSIProps> = ({ canEdit = false }) => {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'upcoming'>('calendar');

  const isOnline = airtableIsActive();

  useEffect(() => {
    if (!isOnline) {
      setRecords(MOCK_RECORDS);
      return;
    }
    fetchMonth();
  }, [viewDate, isOnline]);

  const fetchMonth = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const start = toDateKey(year, month, 1);
      const end = toDateKey(year, month + 1, 1);
      const formula = `AND({Fecha}>='${start}',{Fecha}<'${end}')`;
      const data = await getHorarioCSI(formula);
      setRecords(data.map(r => ({ id: r.id, fields: r.fields })));
    } catch {
      setError('Error al cargar horarios de Airtable.');
    } finally {
      setLoading(false);
    }
  };

  const byDate = useMemo(() => {
    const map: Record<string, RecordEntry[]> = {};
    records.forEach(r => {
      const d = r.fields.Fecha;
      if (!map[d]) map[d] = [];
      map[d].push(r);
    });
    return map;
  }, [records]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewDate]);

  const upcomingDates = useMemo(() => {
    const today = todayKey();
    return Object.keys(byDate).filter(d => d >= today).sort().slice(0, 8);
  }, [byDate]);

  const handleUpdate = async (id: string, fields: Partial<HorarioCSIFields>) => {
    if (isOnline) {
      await updateHorarioCSI(id, fields);
    }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, fields: { ...r.fields, ...fields } } : r));
  };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = todayKey();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-turqui" size={20} />
          <h3 className="font-montserrat font-bold text-slate-800 text-lg">Horario de Servicios CSI</h3>
          {!isOnline && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <WifiOff size={9} /> Modo Local
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`text-[10px] font-bold px-4 py-1.5 rounded-xl border transition-all ${activeTab === 'calendar' ? 'bg-navy-tafe text-white border-navy-tafe' : 'bg-white text-slate-500 border-slate-200 hover:border-navy-tafe'}`}
          >
            Calendario
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`text-[10px] font-bold px-4 py-1.5 rounded-xl border transition-all ${activeTab === 'upcoming' ? 'bg-navy-tafe text-white border-navy-tafe' : 'bg-white text-slate-500 border-slate-200 hover:border-navy-tafe'}`}
          >
            Próximos
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
              <div className="flex items-center gap-2">
                <h4 className="font-montserrat font-bold text-slate-800">
                  {MONTH_NAMES[month]} {year}
                </h4>
                {loading && <Loader size={14} className="animate-spin text-turqui" />}
              </div>
              <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`blank-${idx}`} />;
                const dk = toDateKey(year, month, day);
                const dayRecords = byDate[dk] ?? [];
                const isToday = dk === today;
                const isSelected = dk === selectedDate;
                const hasServices = dayRecords.length > 0;

                return (
                  <button
                    key={dk}
                    onClick={() => setSelectedDate(isSelected ? null : dk)}
                    className={`relative flex flex-col items-center justify-start pt-1 pb-2 rounded-xl min-h-[52px] border transition-all text-[11px] font-bold
                      ${isSelected ? 'bg-navy-tafe text-white border-navy-tafe shadow-md' :
                        isToday ? 'bg-turqui/10 text-turqui border-turqui/40' :
                        hasServices ? 'bg-white text-slate-700 border-slate-200 hover:border-turqui' :
                        'bg-slate-50 text-slate-300 border-transparent'}`}
                  >
                    {day}
                    {hasServices && (
                      <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 px-0.5">
                        {dayRecords.slice(0, 3).map((_, i) => (
                          <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-turqui'}`} />
                        ))}
                        {dayRecords.length > 3 && (
                          <span className={`text-[7px] font-bold ${isSelected ? 'text-white/60' : 'text-turqui'}`}>+{dayRecords.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-turqui inline-block" /> Con servicios
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                <span className="w-3 h-3 rounded-full bg-turqui/10 border border-turqui/40 inline-block" /> Hoy
              </div>
            </div>
          </div>

          {/* Day Detail */}
          <div className="lg:col-span-2">
            {selectedDate ? (
              <DayDetail
                dateKey={selectedDate}
                records={byDate[selectedDate] ?? []}
                onClose={() => setSelectedDate(null)}
                onUpdate={handleUpdate}
                canEdit={canEdit}
              />
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-6 h-full flex flex-col items-center justify-center text-center min-h-[200px]">
                <CalendarDays size={28} className="text-slate-300 mb-3" />
                <p className="text-xs font-bold text-slate-400">Selecciona un día</p>
                <p className="text-[10px] text-slate-300 mt-1">para ver el detalle de servicios</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader size={20} className="animate-spin text-turqui" />
            </div>
          )}
          {!loading && upcomingDates.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              No hay servicios próximos registrados en este mes.
            </div>
          )}
          {upcomingDates.map(dateKey => {
            const recs = byDate[dateKey] ?? [];
            const [, mon, d] = dateKey.split('-').map(Number);
            const dayOfWeek = DAY_NAMES[new Date(dateKey + 'T12:00:00').getDay()];
            const isToday = dateKey === today;

            // Group by service type
            const byService: Record<string, RecordEntry[]> = {};
            recs.forEach(r => {
              const s = r.fields.Servicio ?? 'Sin Servicio';
              if (!byService[s]) byService[s] = [];
              byService[s].push(r);
            });

            return (
              <div key={dateKey} className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-[90px]">
                    <div className={`text-center px-3 py-2 rounded-2xl ${isToday ? 'bg-turqui text-white' : 'bg-slate-50 text-slate-700'}`}>
                      <p className="text-[9px] font-bold uppercase">{dayOfWeek}</p>
                      <p className="text-xl font-montserrat font-bold leading-none">{d}</p>
                      <p className="text-[9px] font-bold uppercase">{MONTH_NAMES[mon - 1].slice(0, 3)}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {Object.entries(byService).map(([svc, svcRecs]) => (
                      <div key={svc}>
                        <p className="text-[9px] font-bold text-navy-tafe uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                          <Clock size={9} /> {svc}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {svcRecs.map(r => (
                            <div key={r.id} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                              <RoleBadge role={r.fields['Rol Asignado']} />
                              <span className="text-[10px] text-slate-500 font-medium">
                                {(r.fields['Persona a cargo'] ?? []).join(', ') || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HorarioCSI;
