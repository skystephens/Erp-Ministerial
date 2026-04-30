import React, { useState, useMemo } from 'react';
import { UserRole, User, CRMFollowUp, AttentionLevel } from '../types';
import {
  UserCheck, Plus, X, ChevronRight, Phone, Calendar,
  MessageSquare, Users, Target, Clock, TrendingUp,
  ArrowRight, Check, Search, Filter, Trash2, Edit3,
} from 'lucide-react';
import { airtableIsActive, createCRMSeguimiento, updateCRMSeguimiento } from '../services/airtableService';

// ─── Config niveles ───────────────────────────────────────────────────────────

export const ATTENTION_LEVELS: {
  value: AttentionLevel;
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}[] = [
  { value: 'PROSPECTO',       label: 'Prospecto',       shortLabel: 'P0', color: 'text-slate-500',   bg: 'bg-slate-100',   border: 'border-slate-200', description: 'Contacto nuevo, sin seguimiento iniciado' },
  { value: 'PRIMER_CONTACTO', label: 'Primer Contacto', shortLabel: 'P1', color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-200', description: 'Primer contacto realizado (llamada o visita)' },
  { value: 'BIENVENIDA',      label: 'Bienvenida',      shortLabel: 'P2', color: 'text-orange-500',  bg: 'bg-orange-50',   border: 'border-orange-200', description: 'Asistió al culto y fue recibido formalmente' },
  { value: 'INTEGRADO',       label: 'Integrado',       shortLabel: 'P3', color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-200', description: 'Integrado a célula o ministerio' },
  { value: 'DISCIPULO',       label: 'Discípulo',       shortLabel: 'P4', color: 'text-purple-600',  bg: 'bg-purple-50',   border: 'border-purple-200', description: 'En proceso de formación bíblica activa' },
  { value: 'LIDER',           label: 'Líder',           shortLabel: 'P5', color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', description: 'Líder activo en un ministerio' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface CRMProps {
  role: UserRole;
  followUps: CRMFollowUp[];
  setFollowUps: React.Dispatch<React.SetStateAction<CRMFollowUp[]>>;
  users: User[];
}

type ViewMode = 'kanban' | 'lista' | 'detalle';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

const daysAgo = (dateStr?: string): number => {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
};

const urgencyColor = (days: number) => {
  if (days > 14) return 'text-red-500';
  if (days > 7) return 'text-amber-500';
  return 'text-slate-400';
};

// ─── Componente principal ─────────────────────────────────────────────────────

const CRMSeguimiento: React.FC<CRMProps> = ({ role, followUps, setFollowUps, users }) => {
  const [view, setView] = useState<ViewMode>('kanban');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterMinistry, setFilterMinistry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const canEdit = role !== UserRole.MIEMBRO;

  const filtered = useMemo(() => {
    let list = [...followUps];
    if (filterMinistry) list = list.filter(f => f.ministry === filterMinistry);
    if (searchQuery) list = list.filter(f =>
      f.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone?.includes(searchQuery)
    );
    return list;
  }, [followUps, filterMinistry, searchQuery]);

  const byLevel = (level: AttentionLevel) => filtered.filter(f => f.attentionLevel === level);

  const totalsByLevel = ATTENTION_LEVELS.map(l => ({
    ...l,
    count: followUps.filter(f => f.attentionLevel === l.value).length,
  }));

  const handleCreate = (data: Partial<CRMFollowUp>) => {
    const newEntry: CRMFollowUp = {
      id: `crm_${Date.now()}`,
      memberName: data.memberName || 'Sin nombre',
      phone: data.phone,
      email: data.email,
      age: data.age,
      attentionLevel: data.attentionLevel || 'PROSPECTO',
      responsibleName: data.responsibleName,
      lastContactDate: today(),
      nextActionDate: data.nextActionDate,
      notes: data.notes || '',
      ministry: data.ministry,
      originGroup: data.originGroup,
      createdDate: new Date().toISOString(),
      history: [{ date: today(), action: 'Registro creado', level: data.attentionLevel || 'PROSPECTO' }],
    };
    setFollowUps(prev => [newEntry, ...prev]);

    if (airtableIsActive()) {
      createCRMSeguimiento({
        Nombre_Miembro: newEntry.memberName,
        Telefono: newEntry.phone,
        Nivel_Atencion: newEntry.attentionLevel,
        Responsable: newEntry.responsibleName,
        Ultimo_Contacto: newEntry.lastContactDate,
        Notas: newEntry.notes,
        Ministerio: newEntry.ministry,
        Grupo_Origen: newEntry.originGroup,
      }).catch(() => null);
    }

    setShowModal(false);
  };

  const handleAdvanceLevel = (id: string) => {
    setFollowUps(prev => prev.map(f => {
      if (f.id !== id) return f;
      const idx = ATTENTION_LEVELS.findIndex(l => l.value === f.attentionLevel);
      if (idx >= ATTENTION_LEVELS.length - 1) return f;
      const nextLevel = ATTENTION_LEVELS[idx + 1].value;
      return {
        ...f,
        attentionLevel: nextLevel,
        lastContactDate: today(),
        history: [...f.history, { date: today(), action: `Avanzó a ${ATTENTION_LEVELS[idx + 1].label}`, level: nextLevel }],
      };
    }));
  };

  const handleLogContact = (id: string, note: string) => {
    setFollowUps(prev => prev.map(f => {
      if (f.id !== id) return f;
      return {
        ...f,
        lastContactDate: today(),
        notes: note || f.notes,
        history: [...f.history, { date: today(), action: note || 'Contacto registrado' }],
      };
    }));
  };

  const handleDelete = (id: string) => {
    setFollowUps(prev => prev.filter(f => f.id !== id));
    if (detailId === id) { setDetailId(null); setView('kanban'); }
  };

  const detailEntry = followUps.find(f => f.id === detailId);

  if (view === 'detalle' && detailEntry) {
    return (
      <DetailView
        entry={detailEntry}
        onBack={() => { setDetailId(null); setView('kanban'); }}
        onAdvance={() => handleAdvanceLevel(detailEntry.id)}
        onLogContact={(note) => handleLogContact(detailEntry.id, note)}
        onDelete={() => handleDelete(detailEntry.id)}
        canEdit={canEdit}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-montserrat font-bold text-slate-800 flex items-center gap-3">
            <UserCheck size={28} className="text-turqui" />
            CRM Seguimiento
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {followUps.length} personas en seguimiento
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white text-navy-tafe shadow' : 'text-slate-400'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('lista')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'lista' ? 'bg-white text-navy-tafe shadow' : 'text-slate-400'}`}
            >
              Lista
            </button>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 hover:scale-[1.02] transition-all text-sm"
            >
              <Plus size={16} /> Nuevo Prospecto
            </button>
          )}
        </div>
      </div>

      {/* Funnel summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {totalsByLevel.map(l => (
          <div key={l.value} className={`rounded-2xl p-4 border ${l.bg} ${l.border} text-center`}>
            <p className={`text-2xl font-bold font-montserrat ${l.color}`}>{l.count}</p>
            <p className={`text-[9px] font-bold uppercase tracking-wide mt-1 ${l.color}`}>{l.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
          />
        </div>
        <select
          value={filterMinistry}
          onChange={e => setFilterMinistry(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none min-w-[180px]"
        >
          <option value="">Todos los ministerios</option>
          {[...new Set(followUps.map(f => f.ministry).filter(Boolean))].map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {followUps.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} canEdit={canEdit} />
      ) : view === 'kanban' ? (
        <KanbanView
          levels={ATTENTION_LEVELS}
          byLevel={byLevel}
          onSelect={(id) => { setDetailId(id); setView('detalle'); }}
          onAdvance={handleAdvanceLevel}
          canEdit={canEdit}
        />
      ) : (
        <ListView
          entries={filtered}
          levels={ATTENTION_LEVELS}
          onSelect={(id) => { setDetailId(id); setView('detalle'); }}
          onAdvance={handleAdvanceLevel}
          onDelete={handleDelete}
          canEdit={canEdit}
        />
      )}

      {/* Modal nuevo */}
      {showModal && <NewProspectModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
    </div>
  );
};

// ─── Kanban View ──────────────────────────────────────────────────────────────

const KanbanView: React.FC<{
  levels: typeof ATTENTION_LEVELS;
  byLevel: (l: AttentionLevel) => CRMFollowUp[];
  onSelect: (id: string) => void;
  onAdvance: (id: string) => void;
  canEdit: boolean;
}> = ({ levels, byLevel, onSelect, onAdvance, canEdit }) => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {levels.map(level => {
      const items = byLevel(level.value);
      return (
        <div key={level.value} className="flex-shrink-0 w-64">
          <div className={`rounded-2xl border ${level.border} p-4 space-y-3`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={`text-xs font-bold ${level.color}`}>{level.label}</span>
                <p className="text-[9px] text-slate-400 mt-0.5">{level.description}</p>
              </div>
              <span className={`text-sm font-bold font-montserrat px-2 py-0.5 rounded-lg ${level.bg} ${level.color}`}>
                {items.length}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-300">
                <Users size={20} className="mx-auto mb-1" />
                <p className="text-[10px]">Sin personas</p>
              </div>
            ) : (
              items.map(entry => (
                <KanbanCard
                  key={entry.id}
                  entry={entry}
                  level={level}
                  onSelect={() => onSelect(entry.id)}
                  onAdvance={() => onAdvance(entry.id)}
                  canEdit={canEdit}
                  isLast={level.value === 'LIDER'}
                />
              ))
            )}
          </div>
        </div>
      );
    })}
  </div>
);

const KanbanCard: React.FC<{
  entry: CRMFollowUp;
  level: typeof ATTENTION_LEVELS[0];
  onSelect: () => void;
  onAdvance: () => void;
  canEdit: boolean;
  isLast: boolean;
}> = ({ entry, level, onSelect, onAdvance, canEdit, isLast }) => {
  const days = daysAgo(entry.lastContactDate);

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={onSelect}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="text-xs font-bold text-slate-800 leading-tight">{entry.memberName}</p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${level.bg} ${level.color} shrink-0`}>{level.shortLabel}</span>
      </div>

      {entry.phone && (
        <div className="flex items-center gap-1 mb-1.5">
          <Phone size={10} className="text-slate-400" />
          <span className="text-[10px] text-slate-500">{entry.phone}</span>
        </div>
      )}

      <div className={`flex items-center gap-1 mb-3 ${urgencyColor(days)}`}>
        <Clock size={10} />
        <span className="text-[10px] font-medium">
          {days === 999 ? 'Sin contacto' : days === 0 ? 'Hoy' : `Hace ${days}d`}
        </span>
      </div>

      {canEdit && !isLast && (
        <button
          onClick={e => { e.stopPropagation(); onAdvance(); }}
          className="w-full py-1.5 bg-slate-50 hover:bg-turqui hover:text-white text-slate-500 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
        >
          Avanzar <ArrowRight size={10} />
        </button>
      )}
    </div>
  );
};

// ─── List View ────────────────────────────────────────────────────────────────

const ListView: React.FC<{
  entries: CRMFollowUp[];
  levels: typeof ATTENTION_LEVELS;
  onSelect: (id: string) => void;
  onAdvance: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}> = ({ entries, levels, onSelect, onAdvance, onDelete, canEdit }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
    <div className="p-4 border-b border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entries.length} registros</p>
    </div>
    <div className="divide-y divide-slate-100">
      {entries.map(entry => {
        const level = levels.find(l => l.value === entry.attentionLevel)!;
        const days = daysAgo(entry.lastContactDate);
        return (
          <div
            key={entry.id}
            className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => onSelect(entry.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${level.bg}`}>
              <span className={`text-xs font-bold ${level.color}`}>{level.shortLabel}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800 truncate">{entry.memberName}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${level.bg} ${level.color}`}>{level.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {entry.phone && <span className="text-[11px] text-slate-400">{entry.phone}</span>}
                {entry.ministry && <span className="text-[11px] text-slate-400">{entry.ministry}</span>}
                <span className={`text-[11px] font-medium ${urgencyColor(days)}`}>
                  {days === 999 ? 'Sin contacto' : `Hace ${days}d`}
                </span>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                {entry.attentionLevel !== 'LIDER' && (
                  <button
                    onClick={() => onAdvance(entry.id)}
                    className="p-2 text-turqui hover:bg-turqui/10 rounded-lg transition-colors"
                    title="Avanzar nivel"
                  >
                    <ArrowRight size={15} />
                  </button>
                )}
                <button
                  onClick={() => { if (confirm('¿Eliminar?')) onDelete(entry.id); }}
                  className="p-2 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Detail View ──────────────────────────────────────────────────────────────

const DetailView: React.FC<{
  entry: CRMFollowUp;
  onBack: () => void;
  onAdvance: () => void;
  onLogContact: (note: string) => void;
  onDelete: () => void;
  canEdit: boolean;
}> = ({ entry, onBack, onAdvance, onLogContact, onDelete, canEdit }) => {
  const [contactNote, setContactNote] = useState('');
  const level = ATTENTION_LEVELS.find(l => l.value === entry.attentionLevel)!;
  const nextLevel = ATTENTION_LEVELS.find((_, i, arr) => arr[i - 1]?.value === entry.attentionLevel);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-navy-tafe font-bold text-sm">
          ← Volver
        </button>
        {canEdit && (
          <button
            onClick={() => { if (confirm('¿Eliminar este registro?')) onDelete(); }}
            className="text-red-400 hover:text-red-600 text-sm font-bold flex items-center gap-1"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${level.bg} mb-4`}>
              <span className={`text-xl font-bold ${level.color}`}>{level.shortLabel}</span>
            </div>
            <h3 className="text-xl font-bold font-montserrat text-slate-800">{entry.memberName}</h3>
            <p className={`text-sm font-bold mt-1 ${level.color}`}>{level.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{level.description}</p>

            <div className="mt-5 space-y-3">
              {entry.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{entry.phone}</span>
                </div>
              )}
              {entry.ministry && (
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{entry.ministry}</span>
                </div>
              )}
              {entry.responsibleName && (
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">Resp: {entry.responsibleName}</span>
                </div>
              )}
              {entry.originGroup && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{entry.originGroup}</span>
                </div>
              )}
              {entry.lastContactDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">Último contacto: {entry.lastContactDate}</span>
                </div>
              )}
            </div>

            {/* Funnel position */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Posición en el embudo</p>
              <div className="flex gap-1">
                {ATTENTION_LEVELS.map(l => (
                  <div
                    key={l.value}
                    className={`flex-1 h-2 rounded-full ${l.value === entry.attentionLevel ? l.bg.replace('50', '400').replace('100', '500') : 'bg-slate-100'}`}
                    title={l.label}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-400">Prospecto</span>
                <span className="text-[9px] text-slate-400">Líder</span>
              </div>
            </div>
          </div>

          {/* Advance level */}
          {canEdit && nextLevel && (
            <button
              onClick={onAdvance}
              className="w-full py-3 bg-turqui text-white font-bold rounded-2xl shadow-lg shadow-turqui/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <TrendingUp size={16} /> Avanzar a {nextLevel.label}
            </button>
          )}
        </div>

        {/* Right: Notes + History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Log contact */}
          {canEdit && (
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200">
              <h4 className="font-montserrat font-bold text-slate-700 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Registrar Contacto
              </h4>
              <textarea
                value={contactNote}
                onChange={e => setContactNote(e.target.value)}
                rows={3}
                placeholder="Describe qué pasó: llamada, visita, llegó al culto, invitado a célula..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-1 ring-turqui"
              />
              <button
                onClick={() => { onLogContact(contactNote); setContactNote(''); }}
                disabled={!contactNote.trim()}
                className="mt-3 px-5 py-2.5 bg-navy-tafe text-white font-bold rounded-xl text-sm hover:bg-turqui transition-colors disabled:opacity-40"
              >
                <Check size={14} className="inline mr-1" /> Guardar Contacto
              </button>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Notas</p>
              <p className="text-sm text-slate-700">{entry.notes}</p>
            </div>
          )}

          {/* History */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200">
            <h4 className="font-montserrat font-bold text-slate-700 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} /> Historial ({entry.history.length})
            </h4>
            {entry.history.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Sin historial</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
                <div className="space-y-4 pl-8">
                  {[...entry.history].reverse().map((h, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-turqui/40" />
                      <p className="text-[10px] font-bold text-slate-400">{h.date}</p>
                      <p className="text-sm text-slate-700 mt-0.5">{h.action}</p>
                      {h.level && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ATTENTION_LEVELS.find(l => l.value === h.level)?.bg
                        } ${ATTENTION_LEVELS.find(l => l.value === h.level)?.color}`}>
                          {ATTENTION_LEVELS.find(l => l.value === h.level)?.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Nuevo Prospecto ────────────────────────────────────────────────────

const NewProspectModal: React.FC<{
  onSave: (data: Partial<CRMFollowUp>) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [form, setForm] = useState<Partial<CRMFollowUp>>({ attentionLevel: 'PROSPECTO' });

  const set = (key: keyof CRMFollowUp, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-montserrat font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={20} className="text-turqui" /> Nuevo Prospecto
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Nombre completo *">
            <input
              required
              type="text"
              placeholder="Nombre y apellido"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui"
              value={form.memberName || ''}
              onChange={e => set('memberName', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input type="tel" placeholder="+57..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
            </Field>
            <Field label="Edad">
              <input type="number" placeholder="25" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={form.age || ''} onChange={e => set('age', parseInt(e.target.value))} />
            </Field>
          </div>
          <Field label="Nivel inicial">
            <div className="grid grid-cols-2 gap-2">
              {ATTENTION_LEVELS.slice(0, 4).map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => set('attentionLevel', l.value)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left ${
                    form.attentionLevel === l.value
                      ? `${l.bg} ${l.color} ${l.border} border-2`
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Responsable de seguimiento">
            <input type="text" placeholder="Nombre del líder o pastor" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={form.responsibleName || ''} onChange={e => set('responsibleName', e.target.value)} />
          </Field>
          <Field label="Grupo / Célula de origen">
            <input type="text" placeholder="Ej: Célula Sector Norte" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={form.originGroup || ''} onChange={e => set('originGroup', e.target.value)} />
          </Field>
          <Field label="Ministerio relacionado">
            <input type="text" placeholder="Ej: Consolidación" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui" value={form.ministry || ''} onChange={e => set('ministry', e.target.value)} />
          </Field>
          <Field label="Notas iniciales">
            <textarea
              rows={3}
              placeholder="Cómo llegó, necesidades, datos relevantes..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-1 ring-turqui resize-none"
              value={form.notes || ''}
              onChange={e => set('notes', e.target.value)}
            />
          </Field>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 font-bold rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button
            onClick={() => { if (form.memberName?.trim()) onSave(form); }}
            disabled={!form.memberName?.trim()}
            className="flex-[2] py-3 bg-turqui text-white font-bold rounded-xl shadow-lg shadow-turqui/20 disabled:opacity-50 hover:scale-[1.02] transition-all"
          >
            Crear Registro
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onNew: () => void; canEdit: boolean }> = ({ onNew, canEdit }) => (
  <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200">
    <UserCheck size={40} className="mx-auto mb-4 text-slate-200" />
    <p className="text-slate-400 font-bold">No hay prospectos en seguimiento</p>
    <p className="text-slate-400 text-sm mb-6">Los nuevos visitantes y prospectos aparecerán aquí</p>
    {canEdit && (
      <button onClick={onNew} className="px-6 py-3 bg-turqui text-white font-bold rounded-xl">
        + Agregar Primer Prospecto
      </button>
    )}
  </div>
);

// ─── Field helper ─────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{label}</label>
    {children}
  </div>
);

export default CRMSeguimiento;
