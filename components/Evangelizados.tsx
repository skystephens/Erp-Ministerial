import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import {
  Heart, Plus, Search, X, ChevronDown, ChevronUp,
  Phone, MapPin, User, Calendar, Tag, Save, Loader2,
  Filter, Download,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EstadoPastoreo =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'EN_PROCESO'
  | 'VISITADO'
  | 'CONECTADO_CELULA'
  | 'INACTIVO';

export interface Evangelizado {
  id: string;
  nombre: string;
  telefono?: string;
  fechaEvangelismo: string;
  zona?: string;
  ejeInteres?: string;
  estado: EstadoPastoreo;
  asignadoA?: string;
  notas?: string;
  ministerioDestino?: string;
  edad?: number;
  creadoPor?: string;
  fechaCreacion: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tafe_evangelizados';

const ESTADOS: { value: EstadoPastoreo; label: string; color: string; dot: string }[] = [
  { value: 'NUEVO',            label: 'Nuevo',             color: 'bg-slate-100 text-slate-600',     dot: 'bg-slate-400' },
  { value: 'CONTACTADO',       label: 'Contactado',        color: 'bg-blue-100 text-blue-700',        dot: 'bg-blue-500' },
  { value: 'EN_PROCESO',       label: 'En Proceso',        color: 'bg-amber-100 text-amber-700',      dot: 'bg-amber-500' },
  { value: 'VISITADO',         label: 'Visitado',          color: 'bg-purple-100 text-purple-700',    dot: 'bg-purple-500' },
  { value: 'CONECTADO_CELULA', label: 'Conectado a Célula',color: 'bg-emerald-100 text-emerald-700',  dot: 'bg-emerald-500' },
  { value: 'INACTIVO',         label: 'Inactivo',          color: 'bg-red-100 text-red-600',          dot: 'bg-red-400' },
];

const EJES_OPTIONS = [
  'E1 · Evangelismo',
  'E2 · Intercesión',
  'E3 · Consolidación',
  'E4 · Niños / Danza',
  'E6 · Atención Social',
  'E7 · Jóvenes / Adolescentes',
];

const MINISTERIOS_DESTINO = [
  'Consolidación', 'Células', 'Jóvenes Elohim', 'Escuela AMO (Niños)',
  'Intercesión', 'Anfitriones',
];

const ENCARGADOS = [
  'Martha Porras', 'Guillermina Martínez', 'Dario Muñoz',
  'Yinis Rodriguez', 'Zuleima Sandoval', 'Sky Stephens',
];

const INITIAL_DATA: Evangelizado[] = [
  { id: 'ev1', nombre: 'Carlos Rodríguez', telefono: '3001234567', fechaEvangelismo: '2026-05-10', zona: 'Sector Norte', ejeInteres: 'E1 · Evangelismo', estado: 'CONTACTADO', asignadoA: 'Dario Muñoz', notas: 'Interesado en saber más sobre la iglesia. Tiene hijos.', ministerioDestino: 'Células', fechaCreacion: '2026-05-10', creadoPor: 'Sky' },
  { id: 'ev2', nombre: 'Ana Martínez', telefono: '3109876543', fechaEvangelismo: '2026-05-10', zona: 'Sector Norte', ejeInteres: 'E7 · Jóvenes / Adolescentes', estado: 'NUEVO', ministerioDestino: 'Jóvenes Elohim', fechaCreacion: '2026-05-10', creadoPor: 'Sky' },
  { id: 'ev3', nombre: 'Pedro López', fechaEvangelismo: '2026-05-04', zona: 'Centro', ejeInteres: 'E6 · Atención Social', estado: 'VISITADO', asignadoA: 'Martha Porras', notas: 'Visitado el martes. Muy receptivo. Próximo paso: invitar al domingo.', fechaCreacion: '2026-05-04', creadoPor: 'Sky' },
  { id: 'ev4', nombre: 'Lucía García', telefono: '3201112233', fechaEvangelismo: '2026-04-27', zona: 'Sector Sur', estado: 'CONECTADO_CELULA', asignadoA: 'Yinis Rodriguez', ministerioDestino: 'Consolidación', notas: 'Ya asiste a la célula del barrio cada semana.', fechaCreacion: '2026-04-27', creadoPor: 'Martha Porras' },
];

const emptyForm = (): Omit<Evangelizado, 'id' | 'fechaCreacion'> => ({
  nombre: '',
  telefono: '',
  fechaEvangelismo: new Date().toISOString().split('T')[0],
  zona: '',
  ejeInteres: '',
  estado: 'NUEVO',
  asignadoA: '',
  notas: '',
  ministerioDestino: '',
  edad: undefined,
  creadoPor: '',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const loadData = (): Evangelizado[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  } catch {
    return INITIAL_DATA;
  }
};

const saveData = (data: Evangelizado[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const estadoInfo = (estado: EstadoPastoreo) =>
  ESTADOS.find(e => e.value === estado) ?? ESTADOS[0];

// ─── Props ────────────────────────────────────────────────────────────────────

interface EvangelizadosProps {
  role: UserRole;
  currentUserName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Evangelizados: React.FC<EvangelizadosProps> = ({ role, currentUserName }) => {
  const [records, setRecords] = useState<Evangelizado[]>(loadData);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoPastoreo | 'TODOS'>('TODOS');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const canEdit = role === UserRole.SUPER_ADMIN || role === UserRole.SUPERVISORA || role === UserRole.LIDER_MINISTERIO;

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch = !search || r.nombre.toLowerCase().includes(search.toLowerCase())
        || r.telefono?.includes(search)
        || r.zona?.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filterEstado === 'TODOS' || r.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [records, search, filterEstado]);

  const stats = useMemo(() => ({
    total: records.length,
    nuevos: records.filter(r => r.estado === 'NUEVO').length,
    enProceso: records.filter(r => ['CONTACTADO', 'EN_PROCESO', 'VISITADO'].includes(r.estado)).length,
    conectados: records.filter(r => r.estado === 'CONECTADO_CELULA').length,
  }), [records]);

  const openCreate = () => {
    setForm({ ...emptyForm(), creadoPor: currentUserName ?? '' });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (ev: Evangelizado) => {
    setForm({
      nombre: ev.nombre, telefono: ev.telefono ?? '', fechaEvangelismo: ev.fechaEvangelismo,
      zona: ev.zona ?? '', ejeInteres: ev.ejeInteres ?? '', estado: ev.estado,
      asignadoA: ev.asignadoA ?? '', notas: ev.notas ?? '',
      ministerioDestino: ev.ministerioDestino ?? '', edad: ev.edad,
      creadoPor: ev.creadoPor ?? '',
    });
    setEditId(ev.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    setTimeout(() => {
      let next: Evangelizado[];
      if (editId) {
        next = records.map(r => r.id === editId ? { ...r, ...form } : r);
      } else {
        const nuevo: Evangelizado = {
          id: `ev_${Date.now()}`,
          fechaCreacion: new Date().toISOString().split('T')[0],
          ...form,
        };
        next = [nuevo, ...records];
      }
      saveData(next);
      setRecords(next);
      setShowForm(false);
      setSaving(false);
      setEditId(null);
    }, 300);
  };

  const handleDelete = (id: string) => {
    const next = records.filter(r => r.id !== id);
    saveData(next);
    setRecords(next);
    setExpandedId(null);
  };

  const updateEstado = (id: string, estado: EstadoPastoreo) => {
    const next = records.map(r => r.id === id ? { ...r, estado } : r);
    saveData(next);
    setRecords(next);
  };

  const exportCSV = () => {
    const headers = ['Nombre', 'Teléfono', 'Fecha', 'Zona', 'Eje', 'Estado', 'Asignado a', 'Ministerio Destino', 'Notas'];
    const rows = records.map(r => [
      r.nombre, r.telefono ?? '', r.fechaEvangelismo, r.zona ?? '',
      r.ejeInteres ?? '', r.estado, r.asignadoA ?? '', r.ministerioDestino ?? '', r.notas ?? '',
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'evangelizados_tafe.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="bg-navy-tafe p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #49D1C5 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-turqui" />
              <span className="px-3 py-1 bg-turqui/20 text-turqui text-[10px] font-bold rounded-lg uppercase tracking-widest border border-turqui/30">
                Base de Datos · Evangelismo
              </span>
            </div>
            <h2 className="text-4xl font-montserrat font-bold">Evangelizados</h2>
            <p className="text-white/40 text-sm mt-2 italic">
              Personas alcanzadas en campo. No consolidadas — en proceso de seguimiento pastoral.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Nuevos</p>
              <p className="text-2xl font-bold text-slate-300">{stats.nuevos}</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">En Proceso</p>
              <p className="text-2xl font-bold text-amber-400">{stats.enProceso}</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center min-w-[90px]">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Conectados</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.conectados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, zona..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20 shadow-sm"
            />
          </div>

          {/* Filter estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400 hidden md:block" />
            {[{ value: 'TODOS', label: 'Todos' }, ...ESTADOS.map(e => ({ value: e.value, label: e.label }))].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterEstado(opt.value as any)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  filterEstado === opt.value
                    ? 'bg-navy-tafe text-white border-navy-tafe'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-navy-tafe/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all shadow-sm"
            >
              <Download size={14} /> Exportar
            </button>
          )}
          {canEdit && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-turqui rounded-2xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all"
            >
              <Plus size={16} /> Nuevo Evangelizado
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-20 text-center text-slate-300 text-sm italic">
            No hay registros que coincidan con la búsqueda.
          </div>
        )}

        {filtered.map(ev => {
          const info = estadoInfo(ev.estado);
          const isExpanded = expandedId === ev.id;

          return (
            <div
              key={ev.id}
              className={`bg-white rounded-[2rem] border transition-all shadow-sm ${isExpanded ? 'border-turqui/30' : 'border-slate-100 hover:border-slate-200'}`}
            >
              {/* Row */}
              <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ev.id)}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl bg-navy-tafe/5 text-navy-tafe font-bold text-sm flex items-center justify-center shrink-0">
                  {ev.nombre.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 truncate">{ev.nombre}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${info.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
                      {info.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {ev.telefono && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Phone size={9} /> {ev.telefono}
                      </span>
                    )}
                    {ev.zona && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <MapPin size={9} /> {ev.zona}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar size={9} /> {ev.fechaEvangelismo}
                    </span>
                    {ev.asignadoA && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <User size={9} /> {ev.asignadoA}
                      </span>
                    )}
                  </div>
                </div>

                {/* Estado selector rápido */}
                {canEdit && (
                  <select
                    value={ev.estado}
                    onChange={e => { e.stopPropagation(); updateEstado(ev.id, e.target.value as EstadoPastoreo); }}
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:ring-1 ring-turqui cursor-pointer hidden md:block"
                  >
                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                )}

                <div className="text-slate-300 shrink-0">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-50 pt-4 space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {ev.ejeInteres && (
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Eje de Interés</p>
                        <p className="font-bold text-slate-700 flex items-center gap-1"><Tag size={10} className="text-turqui" /> {ev.ejeInteres}</p>
                      </div>
                    )}
                    {ev.ministerioDestino && (
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ministerio Destino</p>
                        <p className="font-bold text-slate-700">{ev.ministerioDestino}</p>
                      </div>
                    )}
                    {ev.edad && (
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Edad</p>
                        <p className="font-bold text-slate-700">{ev.edad} años</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registrado por</p>
                      <p className="font-bold text-slate-700">{ev.creadoPor || '—'}</p>
                    </div>
                  </div>

                  {ev.notas && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas de Encuentro</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{ev.notas}</p>
                    </div>
                  )}

                  {canEdit && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => openEdit(ev)}
                        className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold text-turqui bg-turqui/5 border border-turqui/20 rounded-xl hover:bg-turqui/10 transition-all"
                      >
                        Editar registro
                      </button>
                      {role === UserRole.SUPER_ADMIN && (
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Crear / Editar */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col">
            <div className="bg-navy-tafe p-8 text-white shrink-0">
              <h3 className="text-xl font-montserrat font-bold flex items-center gap-3">
                <Heart size={20} className="text-turqui" />
                {editId ? 'Editar Evangelizado' : 'Nuevo Evangelizado'}
              </h3>
              <p className="text-white/50 text-xs mt-1">Registrar persona alcanzada en el campo</p>
            </div>

            <div className="p-8 overflow-y-auto space-y-4">
              {/* Nombre */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nombre completo *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre y apellido"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Teléfono */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    placeholder="300..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20"
                  />
                </div>
                {/* Edad */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Edad</label>
                  <input
                    type="number"
                    value={form.edad ?? ''}
                    onChange={e => setForm(f => ({ ...f, edad: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Años"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Fecha Evangelismo</label>
                  <input
                    type="date"
                    value={form.fechaEvangelismo}
                    onChange={e => setForm(f => ({ ...f, fechaEvangelismo: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20"
                  />
                </div>
                {/* Zona */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Zona / Sector</label>
                  <input
                    type="text"
                    value={form.zona}
                    onChange={e => setForm(f => ({ ...f, zona: e.target.value }))}
                    placeholder="Ej: Sector Norte"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Eje */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Eje de Interés</label>
                  <select
                    value={form.ejeInteres}
                    onChange={e => setForm(f => ({ ...f, ejeInteres: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="">— Seleccionar —</option>
                    {EJES_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                {/* Estado */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Estado Pastoreo</label>
                  <select
                    value={form.estado}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoPastoreo }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Asignado a */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Asignado a</label>
                  <select
                    value={form.asignadoA}
                    onChange={e => setForm(f => ({ ...f, asignadoA: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="">— Sin asignar —</option>
                    {ENCARGADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                {/* Ministerio destino */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Ministerio Destino</label>
                  <select
                    value={form.ministerioDestino}
                    onChange={e => setForm(f => ({ ...f, ministerioDestino: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                  >
                    <option value="">— Sin definir —</option>
                    {MINISTERIOS_DESTINO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notas del Encuentro</label>
                <textarea
                  value={form.notas}
                  onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                  placeholder="¿Qué se habló? ¿Cuál fue la respuesta de la persona?..."
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 ring-turqui/20 resize-none"
                />
              </div>
            </div>

            <div className="px-8 pb-8 flex gap-3 shrink-0">
              <button
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="flex-1 py-4 text-slate-400 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.nombre.trim() || saving}
                className="flex-[2] py-4 bg-turqui text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-turqui/20 disabled:opacity-40 transition-all"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Guardando...' : editId ? 'Guardar Cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evangelizados;
