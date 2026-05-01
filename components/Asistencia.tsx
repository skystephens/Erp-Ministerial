import React, { useState, useMemo } from 'react';
import { UserRole, User, AttendanceSession, AttendanceRecord } from '../types';
import {
  ClipboardList, Plus, Check, X, Users, Calendar,
  Save, Eye, Trash2, Search, UserPlus, BarChart2,
} from 'lucide-react';
import { airtableIsActive, createAsistenciaRecord } from '../services/airtableService';

// ─── Datos del formulario real de Google Forms / Airtable ────────────────────

const CSI_MEMBERS = [
  'Heidy', 'Shungu', 'Jordany', 'Guillermo', 'Jimmy',
  'Jefferson', 'Jhony', 'Jorge', 'Juan Diego', 'Emmanuel',
  'Karen', 'Ares', 'Luis Carlos', 'Sky',
];

const ALABANZA_MEMBERS = [
  'Liseth', 'Martha', 'Jessica', 'Andrea', 'Alvaro',
  'Joshua', 'Andres', 'Jorge', 'Felicia', 'Claudia',
  'Lizeth R.', 'Damaris', 'Jordy',
];

// Mapa de listas fijas por ministerio (ministerios con datos reales hardcoded)
const MINISTRY_MEMBERS: Record<string, string[]> = {
  'CSI / Medios': CSI_MEMBERS,
  'Alabanza': ALABANZA_MEMBERS,
};

// Tipos de servicio del formulario Google Forms
const SERVICE_OPTIONS = [
  { value: 'VIERNES_8PM',    label: 'Viernes 8 pm',   day: 'Vie', time: '20:00' },
  { value: 'DOMINGO_8AM',    label: 'Domingo 8 am',   day: 'Dom', time: '08:00' },
  { value: 'DOMINGO_10AM',   label: 'Domingo 10 am',  day: 'Dom', time: '10:00' },
  { value: 'SEPELIO',        label: 'Sepelio',         day: '—',   time: '—'     },
  { value: 'EVENTO',         label: 'Evento',          day: '—',   time: '—'     },
  { value: 'AYUNO',          label: 'Ayuno',           day: '—',   time: '—'     },
  { value: 'EVANGELISMO',    label: 'Evangelismo',     day: '—',   time: '—'     },
  { value: 'BAUTISMO',       label: 'Bautismo',        day: '—',   time: '—'     },
];

const MINISTERIOS = [
  'CSI / Medios',
  'Alabanza',
  'Consolidación',
  'Anfitriones',
  'Guardianes',
  'Evangelismo',
  'Células',
  'Intercesión',
  'Formación Bíblica',
  'Danza',
  'Escuela Infantil AMO',
  'Atención Social',
  'Cuidado Pastoral',
  'Adolescentes Oasis',
  'Generación de Joel',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AsistenciaProps {
  role: UserRole;
  users: User[];
  sessions: AttendanceSession[];
  setSessions: React.Dispatch<React.SetStateAction<AttendanceSession[]>>;
  currentUserName?: string;
}

type ViewMode = 'historial' | 'nueva' | 'detalle';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (present: number, total: number) =>
  total === 0 ? 0 : Math.round((present / total) * 100);

const todayStr = () => new Date().toISOString().split('T')[0];

// ─── Componente principal ─────────────────────────────────────────────────────

const Asistencia: React.FC<AsistenciaProps> = ({
  role, users, sessions, setSessions, currentUserName,
}) => {
  const [view, setView] = useState<ViewMode>('historial');
  const [detailSession, setDetailSession] = useState<AttendanceSession | null>(null);
  const [saving, setSaving] = useState(false);

  // Estado del formulario
  const [formMinistry, setFormMinistry] = useState('CSI / Medios');
  const [formService, setFormService] = useState(SERVICE_OPTIONS[2].value); // Domingo 10 am por defecto
  const [formDate, setFormDate] = useState(todayStr());
  const [formHora, setFormHora] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [extraName, setExtraName] = useState('');

  // Construir lista de miembros según ministerio seleccionado
  const buildMemberList = (ministry: string): AttendanceRecord[] => {
    const fixedList = MINISTRY_MEMBERS[ministry];
    if (fixedList) {
      return fixedList.map(name => ({ memberName: name, isPresent: false }));
    }
    const ministryUsers = users.filter(
      u => u.status === 'APPROVED' && u.ministry === ministry
    );
    if (ministryUsers.length > 0) {
      return ministryUsers.map(u => ({
        memberId: u.id,
        memberName: u.name,
        isPresent: false,
      }));
    }
    return [];
  };

  const handleStartNew = () => {
    setRecords(buildMemberList(formMinistry));
    setFormNotes('');
    setExtraName('');
    setSearchQuery('');
    setView('nueva');
  };

  const handleMinistryChange = (m: string) => {
    setFormMinistry(m);
    setRecords(buildMemberList(m));
  };

  const filteredRecords = useMemo(() =>
    records.filter(r =>
      searchQuery === '' ||
      r.memberName.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [records, searchQuery]
  );

  const togglePresent = (memberName: string) => {
    setRecords(prev =>
      prev.map(r => r.memberName === memberName ? { ...r, isPresent: !r.isPresent } : r)
    );
  };

  const addExtraMember = () => {
    const name = extraName.trim();
    if (!name || records.some(r => r.memberName.toLowerCase() === name.toLowerCase())) return;
    setRecords(prev => [...prev, { memberName: name, isPresent: true }]);
    setExtraName('');
  };

  const removeRecord = (memberName: string) => {
    setRecords(prev => prev.filter(r => r.memberName !== memberName));
  };

  const markAll = (present: boolean) =>
    setRecords(prev => prev.map(r => ({ ...r, isPresent: present })));

  const totalPresent = records.filter(r => r.isPresent).length;
  const totalAbsent = records.filter(r => !r.isPresent).length;

  const handleSave = async () => {
    if (records.length === 0) return;
    setSaving(true);
    try {
      const serviceOption = SERVICE_OPTIONS.find(s => s.value === formService)!;
      const presentMembers = records.filter(r => r.isPresent);

      const session: AttendanceSession = {
        id: `att_${Date.now()}`,
        date: formDate,
        serviceType: formService as any,
        serviceLabel: serviceOption.label,
        ministry: formMinistry,
        records,
        totalPresent,
        totalAbsent,
        notes: formNotes,
        createdBy: currentUserName,
        createdDate: new Date().toISOString(),
      };

      setSessions(prev => [session, ...prev]);

      // Sync a Airtable: un registro por miembro presente (igual al formulario de Google)
      if (airtableIsActive() && presentMembers.length > 0) {
        await Promise.all(
          presentMembers.map(r =>
            createAsistenciaRecord({
              Name: r.memberName,
              Ministerio: formMinistry,
              Tipo_Servicio: serviceOption.label,
              Fecha: formDate,
              Hora: formHora || undefined,
              Registrado_Por: currentUserName,
              Fuente: 'APP',
              Miembros_Presentes: r.memberName,
              Notas: formNotes || undefined,
            }).catch(() => null)
          )
        );
      }

      setView('historial');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (detailSession?.id === id) { setDetailSession(null); setView('historial'); }
  };

  // ── Vistas ─────────────────────────────────────────────────────────────────

  if (view === 'nueva') {
    return (
      <NuevaLista
        formMinistry={formMinistry} onMinistryChange={handleMinistryChange}
        formService={formService} setFormService={setFormService}
        formDate={formDate} setFormDate={setFormDate}
        formHora={formHora} setFormHora={setFormHora}
        formNotes={formNotes} setFormNotes={setFormNotes}
        filteredRecords={filteredRecords} records={records}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        extraName={extraName} setExtraName={setExtraName}
        totalPresent={totalPresent} totalAbsent={totalAbsent}
        onToggle={togglePresent}
        onAddExtra={addExtraMember}
        onRemove={removeRecord}
        onMarkAll={markAll}
        onSave={handleSave}
        onCancel={() => setView('historial')}
        saving={saving}
      />
    );
  }

  if (view === 'detalle' && detailSession) {
    return (
      <DetalleSesion
        session={detailSession}
        onBack={() => setView('historial')}
        onDelete={() => handleDeleteSession(detailSession.id)}
      />
    );
  }

  // ── Historial ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
            <ClipboardList size={28} className="text-turqui" />
            Registro de Asistencia
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {sessions.length} sesiones · Equipo CSI Medios & Alabanza
          </p>
        </div>
        <button
          onClick={handleStartNew}
          className="flex items-center gap-2 px-6 py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
        >
          <Plus size={20} /> Nueva Lista
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sesiones', value: sessions.length, color: 'text-turqui' },
            { label: 'Total presentes (histórico)', value: sessions.reduce((a, s) => a + s.totalPresent, 0), color: 'text-emerald-500' },
            { label: 'Última sesión', value: sessions[0]?.date ?? '—', color: 'text-slate-700' },
            { label: 'Promedio asistencia', value: `${Math.round(sessions.reduce((a, s) => a + pct(s.totalPresent, s.records.length), 0) / sessions.length)}%`, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col gap-1">
              <p className={`text-xl font-bold font-montserrat ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200">
          <ClipboardList size={40} className="mx-auto mb-4 text-slate-200" />
          <p className="text-slate-400 font-bold">No hay sesiones registradas</p>
          <p className="text-slate-400 text-sm mb-6">Toma la primera lista de asistencia del equipo</p>
          <button onClick={handleStartNew} className="px-6 py-3 bg-turqui text-white font-bold rounded-xl">
            + Nueva Lista
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <SessionRow
              key={session.id}
              session={session}
              onView={() => { setDetailSession(session); setView('detalle'); }}
              onDelete={() => handleDeleteSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Vista: Nueva Lista ───────────────────────────────────────────────────────

interface NuevaListaProps {
  formMinistry: string; onMinistryChange: (v: string) => void;
  formService: string; setFormService: (v: string) => void;
  formDate: string; setFormDate: (v: string) => void;
  formHora: string; setFormHora: (v: string) => void;
  formNotes: string; setFormNotes: (v: string) => void;
  filteredRecords: AttendanceRecord[]; records: AttendanceRecord[];
  searchQuery: string; setSearchQuery: (v: string) => void;
  extraName: string; setExtraName: (v: string) => void;
  totalPresent: number; totalAbsent: number;
  onToggle: (name: string) => void;
  onAddExtra: () => void;
  onRemove: (name: string) => void;
  onMarkAll: (present: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

const NuevaLista: React.FC<NuevaListaProps> = ({
  formMinistry, onMinistryChange, formService, setFormService,
  formDate, setFormDate, formHora, setFormHora, formNotes, setFormNotes,
  filteredRecords, records, searchQuery, setSearchQuery,
  extraName, setExtraName, totalPresent, totalAbsent,
  onToggle, onAddExtra, onRemove, onMarkAll, onSave, onCancel, saving,
}) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
        <ClipboardList size={28} className="text-turqui" /> Nueva Lista de Asistencia
      </h2>
      <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
        <X size={16} /> Cancelar
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Config */}
      <div className="space-y-4">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 space-y-4">
          <h3 className="font-montserrat font-bold text-slate-700 text-sm uppercase tracking-widest">Configuración</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Fecha</label>
              <input
                type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Hora</label>
              <input
                type="time" value={formHora} onChange={e => setFormHora(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tipo de Servicio</label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormService(opt.value)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col ${
                    formService === opt.value
                      ? 'bg-navy-tafe text-white border-navy-tafe'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-navy-tafe/30'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.time !== '—' && (
                    <span className={`text-[9px] ${formService === opt.value ? 'text-white/60' : 'text-slate-400'}`}>
                      {opt.day} {opt.time}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Ministerio</label>
            <select
              value={formMinistry}
              onChange={e => onMinistryChange(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            >
              {MINISTERIOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Notas</label>
            <textarea
              value={formNotes} onChange={e => setFormNotes(e.target.value)}
              rows={3} placeholder="Observaciones del servicio..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-1 ring-turqui"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-navy-tafe text-white rounded-[2rem] p-6">
          <h4 className="font-montserrat font-bold text-sm mb-4 flex items-center gap-2">
            <BarChart2 size={16} /> Resumen
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Total en lista</span>
              <span className="font-bold">{records.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Presentes</span>
              <span className="font-bold text-emerald-400">{totalPresent}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-400 flex items-center gap-1"><X size={12} /> Ausentes</span>
              <span className="font-bold text-red-400">{totalAbsent}</span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between mb-1.5">
                <span className="text-white/60 text-sm">Asistencia</span>
                <span className="font-bold text-turqui">{pct(totalPresent, records.length)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-turqui h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pct(totalPresent, records.length)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de miembros */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat font-bold text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2">
              <Users size={14} /> Equipo ({records.length} miembros)
            </h3>
            <div className="flex gap-2">
              <button onClick={() => onMarkAll(true)} className="text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                ✓ Todos
              </button>
              <button onClick={() => onMarkAll(false)} className="text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                ✗ Ninguno
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Buscar miembro..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredRecords.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Users size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sin miembros en la lista.</p>
                <p className="text-xs mt-1">Agrega nombres manualmente abajo.</p>
              </div>
            )}
            {filteredRecords.map((record) => (
              <div
                key={record.memberName}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  record.isPresent ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => onToggle(record.memberName)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    record.isPresent ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                  }`}>
                    {record.isPresent && <Check size={13} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{record.memberName}</p>
                    {!record.memberId && (
                      <p className="text-[9px] text-slate-400">Invitado / Extra</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    record.isPresent ? 'text-emerald-600 bg-emerald-100' : 'text-slate-400 bg-slate-100'
                  }`}>
                    {record.isPresent ? 'PRESENTE' : 'AUSENTE'}
                  </span>
                  {!record.memberId && (
                    <button
                      onClick={e => { e.stopPropagation(); onRemove(record.memberName); }}
                      className="text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Agregar extra */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
            <input
              type="text" placeholder="Agregar visitante o invitado..."
              value={extraName} onChange={e => setExtraName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddExtra()}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
            />
            <button
              onClick={onAddExtra}
              className="px-4 py-2.5 bg-slate-100 hover:bg-turqui hover:text-white text-slate-600 rounded-xl font-bold text-sm transition-all flex items-center gap-1"
            >
              <UserPlus size={14} /> +
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 text-slate-400 font-bold rounded-xl border border-slate-200 hover:bg-slate-50">
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving || records.length === 0}
            className="flex-[2] py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-all"
          >
            <Save size={18} />
            {saving ? 'Guardando en Airtable...' : `Guardar (${totalPresent} presentes de ${records.length})`}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Vista: Detalle de sesión ─────────────────────────────────────────────────

const DetalleSesion: React.FC<{
  session: AttendanceSession;
  onBack: () => void;
  onDelete: () => void;
}> = ({ session, onBack, onDelete }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between items-center">
      <button onClick={onBack} className="text-slate-500 hover:text-navy-tafe font-bold text-sm flex items-center gap-1.5">
        ← Volver
      </button>
      <button
        onClick={() => { if (window.confirm('¿Eliminar esta sesión?')) onDelete(); }}
        className="text-red-400 hover:text-red-600 text-sm font-bold flex items-center gap-1"
      >
        <Trash2 size={14} /> Eliminar
      </button>
    </div>

    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-montserrat font-bold text-slate-800">{session.serviceLabel}</h3>
          <p className="text-slate-500 text-sm mt-1">{session.ministry} · {session.date}</p>
          {session.notes && <p className="text-slate-400 text-xs mt-1 italic">"{session.notes}"</p>}
          {session.createdBy && <p className="text-[10px] text-slate-400 mt-1">Registrado por: {session.createdBy}</p>}
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-500">{session.totalPresent}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Presentes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{session.totalAbsent}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Ausentes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-turqui">{pct(session.totalPresent, session.records.length)}%</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Asistencia</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-8">
        <div
          className="bg-turqui h-3 rounded-full transition-all"
          style={{ width: `${pct(session.totalPresent, session.records.length)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[...session.records]
          .sort((a, b) => (b.isPresent ? 1 : 0) - (a.isPresent ? 1 : 0))
          .map((r, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${
              r.isPresent ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                r.isPresent ? 'bg-emerald-500' : 'bg-slate-300'
              }`}>
                {r.isPresent
                  ? <Check size={11} className="text-white" />
                  : <X size={11} className="text-white" />
                }
              </div>
              <span className="text-sm font-bold text-slate-700 truncate">{r.memberName}</span>
            </div>
          ))
        }
      </div>
    </div>
  </div>
);

// ─── SessionRow ───────────────────────────────────────────────────────────────

const SessionRow: React.FC<{
  session: AttendanceSession;
  onView: () => void;
  onDelete: () => void;
}> = ({ session, onView, onDelete }) => {
  const percent = pct(session.totalPresent, session.records.length);
  const colorClass = percent >= 75 ? 'text-emerald-500' : percent >= 50 ? 'text-amber-500' : 'text-red-400';

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-turqui/30 hover:shadow-sm transition-all cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-center gap-4">
        <div className="text-center w-14 shrink-0">
          <p className={`text-xl font-bold font-montserrat ${colorClass}`}>{percent}%</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">asistencia</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800">{session.serviceLabel}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-turqui/10 text-turqui rounded-lg">{session.ministry}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span>{session.date}</span>
            <span className="text-emerald-500 font-bold">{session.totalPresent} presentes</span>
            <span>{session.records.length} total</span>
            {session.createdBy && <span>por {session.createdBy}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onView(); }}
            className="p-2 text-slate-400 hover:text-turqui hover:bg-turqui/10 rounded-lg transition-all" title="Ver detalle">
            <Eye size={16} />
          </button>
          <button onClick={e => { e.stopPropagation(); if (window.confirm('¿Eliminar?')) onDelete(); }}
            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asistencia;
