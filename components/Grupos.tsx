
import React, { useState } from 'react';
import {
  Users, UserPlus, MapPin, Clock, Search, X, ChevronRight,
  Flame, BookOpen, HeartHandshake, Star, Plus, Edit2, Check,
  UsersRound, Calendar, Filter,
} from 'lucide-react';
import { Group, GroupType, User, UserRole } from '../types';

// ── helpers ────────────────────────────────────────────────────────────────

const GROUP_TYPE_META: Record<GroupType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  CELULA:      { label: 'Célula',         color: 'text-turqui',      bg: 'bg-turqui/10 border-turqui/20',      icon: <Flame size={14} /> },
  ORACION:     { label: 'Oración',        color: 'text-purple-400',  bg: 'bg-purple-400/10 border-purple-400/20', icon: <HeartHandshake size={14} /> },
  JOVENES:     { label: 'Jóvenes',        color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',  icon: <Star size={14} /> },
  ADOLESCENTES:{ label: 'Adolescentes',   color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20',icon: <Star size={14} /> },
  NUEVOS:      { label: 'Nuevos',         color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <UserPlus size={14} /> },
  ESTUDIO:     { label: 'Estudio Bíblico',color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',   icon: <BookOpen size={14} /> },
};

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export const initialGroups: Group[] = [
  {
    id: 'g_celula_norte', name: 'Célula Norte', type: 'CELULA',
    leaderId: '', leaderName: 'Roberto Pérez',
    day: 'Martes', time: '19:00', location: 'Barrio Oasis',
    description: 'Célula familiar del sector norte de la isla.',
    axis: 'E1_EVANGELISMO', isActive: true, memberIds: [], createdDate: '2025-01-10',
  },
  {
    id: 'g_celula_centro', name: 'Célula Centro', type: 'CELULA',
    leaderId: '', leaderName: 'Ana García',
    day: 'Miércoles', time: '19:30', location: 'Barrio San Luis',
    description: 'Célula en el corazón del centro histórico.',
    axis: 'E1_EVANGELISMO', isActive: true, memberIds: [], createdDate: '2025-02-01',
  },
  {
    id: 'g_celula_sur', name: 'Célula Sur', type: 'CELULA',
    leaderId: '', leaderName: 'Carlos Herrera',
    day: 'Jueves', time: '19:00', location: 'Sector El Cove',
    axis: 'E1_EVANGELISMO', isActive: true, memberIds: [], createdDate: '2025-03-15',
  },
  {
    id: 'g_oracion_mujeres', name: 'Oración Mujeres', type: 'ORACION',
    leaderId: '', leaderName: 'Liseth Lever',
    day: 'Viernes', time: '06:00', location: 'Iglesia TAFE (Salón B)',
    description: 'Reunión de intercesión femenina.',
    axis: 'E2_INTERCESION', isActive: true, memberIds: [], createdDate: '2025-01-05',
  },
  {
    id: 'g_vigilia', name: 'Vigilia de Intercesión', type: 'ORACION',
    leaderId: '', leaderName: 'Guillermina Martinez',
    day: 'Miércoles', time: '05:00', location: 'Iglesia TAFE',
    axis: 'E2_INTERCESION', isActive: true, memberIds: [], createdDate: '2025-01-01',
  },
  {
    id: 'g_jovenes', name: 'Jóvenes Elohim', type: 'JOVENES',
    leaderId: '', leaderName: 'Pastor Jóvenes',
    day: 'Sábado', time: '16:00', location: 'Iglesia TAFE (Auditorio)',
    description: 'Reunión semanal de jóvenes TAFE.',
    axis: 'E7_JOVENES', isActive: true, memberIds: [], createdDate: '2025-01-08',
  },
  {
    id: 'g_adolescentes', name: 'Adolescentes', type: 'ADOLESCENTES',
    leaderId: '', leaderName: 'Coordinadora Adolescentes',
    day: 'Sábado', time: '14:00', location: 'Iglesia TAFE (Salón A)',
    axis: 'E7_JOVENES', isActive: true, memberIds: [], createdDate: '2025-02-14',
  },
  {
    id: 'g_nuevos', name: 'Clase de Nuevos', type: 'NUEVOS',
    leaderId: '', leaderName: 'Dario Muñoz',
    day: 'Domingo', time: '12:00', location: 'Iglesia TAFE (Salón C)',
    description: 'Integración y bienvenida a nuevos creyentes.',
    axis: 'E3_CONSOLIDACION', isActive: true, memberIds: [], createdDate: '2025-01-01',
  },
  {
    id: 'g_nvc', name: 'Nueva Vida en Cristo', type: 'ESTUDIO',
    leaderId: '', leaderName: 'Líder Académico',
    day: 'Miércoles', time: '19:00', location: 'Iglesia TAFE (Salón B)',
    description: 'Estudio "Afirmando los Pasos" — libro Nueva Vida en Cristo.',
    axis: 'E3_CONSOLIDACION', isActive: true, memberIds: [], createdDate: '2026-01-15',
  },
  {
    id: 'g_liderazgo', name: 'Escuela de Liderazgo', type: 'ESTUDIO',
    leaderId: '', leaderName: 'Pr. David Lever',
    day: 'Miércoles', time: '20:00', location: 'Iglesia TAFE (Auditorio)',
    description: 'Formación de líderes ministeriales.',
    axis: 'E5_ALABANZA_AV', isActive: true, memberIds: [], createdDate: '2026-01-15',
  },
];

// ── subcomponents ───────────────────────────────────────────────────────────

const TypeBadge: React.FC<{ type: GroupType }> = ({ type }) => {
  const m = GROUP_TYPE_META[type];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.color} ${m.bg}`}>
      {m.icon} {m.label}
    </span>
  );
};

interface GroupFormProps {
  initial?: Partial<Group>;
  users: User[];
  onSave: (g: Group) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ initial, users, onSave, onCancel }) => {
  const [form, setForm] = useState<Partial<Group>>({
    name: '', type: 'CELULA', leaderName: '', leaderId: '',
    day: 'Martes', time: '19:00', location: '', description: '',
    isActive: true, memberIds: [], createdDate: new Date().toISOString().split('T')[0],
    ...initial,
  });

  const set = (field: keyof Group, val: any) => setForm(p => ({ ...p, [field]: val }));

  const handleLeader = (userId: string) => {
    const u = users.find(u => u.id === userId);
    set('leaderId', userId);
    if (u) set('leaderName', u.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.leaderName) return;
    onSave({ ...form, id: initial?.id || `g_${Date.now()}` } as Group);
  };

  const input = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 ring-turqui/40';
  const label = 'text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>Nombre del grupo *</label>
          <input className={input} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Célula Norte" />
        </div>
        <div>
          <label className={label}>Tipo *</label>
          <select className={input} value={form.type} onChange={e => set('type', e.target.value as GroupType)}>
            {Object.entries(GROUP_TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Líder</label>
          {users.length > 0 ? (
            <select className={input} value={form.leaderId} onChange={e => handleLeader(e.target.value)}>
              <option value="">— Seleccionar —</option>
              {users.filter(u => u.status === 'APPROVED').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          ) : (
            <input className={input} value={form.leaderName} onChange={e => set('leaderName', e.target.value)} placeholder="Nombre del líder" />
          )}
        </div>
        <div>
          <label className={label}>Día</label>
          <select className={input} value={form.day} onChange={e => set('day', e.target.value)}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Hora</label>
          <input className={input} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={label}>Lugar / Dirección</label>
          <input className={input} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ej: Barrio Oasis, calle 5" />
        </div>
        <div className="col-span-2">
          <label className={label}>Descripción (opcional)</label>
          <textarea className={`${input} resize-none`} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-[#004182] text-white font-bold py-2.5 rounded-xl hover:bg-turqui transition-colors text-sm">
          {initial?.id ? 'Guardar cambios' : 'Crear grupo'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ── GroupCard ───────────────────────────────────────────────────────────────

interface GroupCardProps {
  group: Group;
  allUsers: User[];
  onClick: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, allUsers, onClick }) => {
  const meta = GROUP_TYPE_META[group.type];
  const memberCount = group.memberIds.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-turqui/30 transition-all p-5 group"
    >
      <div className="flex justify-between items-start mb-3">
        <TypeBadge type={group.type} />
        <span className={`w-2 h-2 rounded-full mt-1 ${group.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
      </div>
      <h3 className="font-montserrat font-bold text-slate-800 text-base mb-1 group-hover:text-[#004182] transition-colors">
        {group.name}
      </h3>
      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{group.description || `Grupo de ${meta.label.toLowerCase()}`}</p>

      <div className="space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-slate-300" />
          <span>{group.day} — {group.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-slate-300" />
          <span className="truncate">{group.location || 'Sin ubicación'}</span>
        </div>
        <div className="flex items-center gap-2">
          <UsersRound size={12} className="text-slate-300" />
          <span>Líder: <span className="font-semibold text-slate-600">{group.leaderName || '—'}</span></span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {[...Array(Math.min(memberCount, 4))].map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-[#004182]/20 border border-white flex items-center justify-center text-[8px] font-bold text-[#004182]">
                {i + 1}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
          </span>
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-turqui transition-colors" />
      </div>
    </button>
  );
};

// ── GroupDetail ─────────────────────────────────────────────────────────────

interface GroupDetailProps {
  group: Group;
  allUsers: User[];
  canEdit: boolean;
  onClose: () => void;
  onUpdate: (g: Group) => void;
  onAddMember: (groupId: string, userId: string) => void;
  onRemoveMember: (groupId: string, userId: string) => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group, allUsers, canEdit, onClose, onUpdate, onAddMember, onRemoveMember,
}) => {
  const [editing, setEditing] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const members = allUsers.filter(u => group.memberIds.includes(u.id));
  const nonMembers = allUsers.filter(
    u => !group.memberIds.includes(u.id) && u.status === 'APPROVED' &&
    u.name.toLowerCase().includes(memberSearch.toLowerCase())
  );
  const meta = GROUP_TYPE_META[group.type];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#004182] text-white p-6 shrink-0">
          <div className="flex justify-between items-start mb-4">
            <TypeBadge type={group.type} />
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <h2 className="font-montserrat font-bold text-xl mb-1">{group.name}</h2>
          <p className="text-white/60 text-sm">{group.description || `Grupo de ${meta.label.toLowerCase()}`}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-turqui">{members.length}</p>
              <p className="text-[10px] text-white/60">Miembros</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-white">{group.day}</p>
              <p className="text-[10px] text-white/60">{group.time}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${group.isActive ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <p className="text-[10px] text-white/60">{group.isActive ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <UsersRound size={15} className="text-turqui shrink-0" />
              <span>Líder: <span className="font-semibold text-slate-800">{group.leaderName || '—'}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={15} className="text-turqui shrink-0" />
              <span>{group.location || 'Sin ubicación registrada'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={15} className="text-turqui shrink-0" />
              <span>Creado: {new Date(group.createdDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Editar */}
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm font-bold text-[#004182] hover:text-turqui transition-colors"
            >
              <Edit2 size={14} /> Editar información
            </button>
          )}

          {editing && (
            <div className="border border-slate-200 rounded-2xl p-4">
              <GroupForm
                initial={group}
                users={allUsers}
                onSave={g => { onUpdate(g); setEditing(false); }}
                onCancel={() => setEditing(false)}
              />
            </div>
          )}

          {/* Miembros */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-montserrat font-bold text-slate-700 text-sm">
                Miembros ({members.length})
              </h3>
              {canEdit && (
                <button
                  onClick={() => setAddingMember(!addingMember)}
                  className="flex items-center gap-1 text-xs font-bold text-[#004182] hover:text-turqui transition-colors"
                >
                  <Plus size={13} /> Agregar
                </button>
              )}
            </div>

            {/* Add member search */}
            {addingMember && (
              <div className="mb-4 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ring-turqui/40"
                    placeholder="Buscar miembro..."
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {nonMembers.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Sin resultados</p>
                  ) : nonMembers.slice(0, 8).map(u => (
                    <button
                      key={u.id}
                      onClick={() => { onAddMember(group.id, u.id); setMemberSearch(''); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-xs text-slate-700 font-medium">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.ministry || '—'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Member list */}
            {members.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Sin miembros registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#004182] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.ministry || 'Sin ministerio'}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => onRemoveMember(group.id, u.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────

interface GruposProps {
  currentRole: UserRole;
  users: User[];
  groups: Group[];
  onUpdateGroups: (groups: Group[]) => void;
}

const Grupos: React.FC<GruposProps> = ({ currentRole, users, groups, onUpdateGroups }) => {
  const [filter, setFilter] = useState<GroupType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canEdit = [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO].includes(currentRole);

  const filtered = groups.filter(g => {
    const matchType = filter === 'ALL' || g.type === filter;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.leaderName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const stats = {
    total: groups.length,
    active: groups.filter(g => g.isActive).length,
    totalMembers: [...new Set(groups.flatMap(g => g.memberIds))].length,
    celulas: groups.filter(g => g.type === 'CELULA').length,
  };

  const handleCreate = (g: Group) => {
    onUpdateGroups([g, ...groups]);
    setShowForm(false);
  };

  const handleUpdate = (updated: Group) => {
    onUpdateGroups(groups.map(g => g.id === updated.id ? updated : g));
    setSelectedGroup(updated);
  };

  const handleAddMember = (groupId: string, userId: string) => {
    onUpdateGroups(groups.map(g =>
      g.id === groupId ? { ...g, memberIds: [...g.memberIds, userId] } : g
    ));
    setSelectedGroup(prev => prev?.id === groupId
      ? { ...prev, memberIds: [...prev.memberIds, userId] }
      : prev
    );
  };

  const handleRemoveMember = (groupId: string, userId: string) => {
    onUpdateGroups(groups.map(g =>
      g.id === groupId ? { ...g, memberIds: g.memberIds.filter(id => id !== userId) } : g
    ));
    setSelectedGroup(prev => prev?.id === groupId
      ? { ...prev, memberIds: prev.memberIds.filter(id => id !== userId) }
      : prev
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-[#004182]">Grupos & Células</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestión de células, grupos de oración, jóvenes y estudio bíblico</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#004182] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-turqui transition-colors text-sm shadow-md"
          >
            <Plus size={16} /> Nuevo Grupo
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total grupos', value: stats.total, icon: <UsersRound size={18} />, color: 'text-[#004182]' },
          { label: 'Grupos activos', value: stats.active, icon: <Check size={18} />, color: 'text-emerald-500' },
          { label: 'Total células', value: stats.celulas, icon: <Flame size={18} />, color: 'text-turqui' },
          { label: 'Miembros asignados', value: stats.totalMembers, icon: <Users size={18} />, color: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-turqui/40"
            placeholder="Buscar por nombre o líder..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400 shrink-0" />
          {(['ALL', ...Object.keys(GROUP_TYPE_META)] as Array<GroupType | 'ALL'>).map(t => {
            const isAll = t === 'ALL';
            const meta = isAll ? null : GROUP_TYPE_META[t];
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  filter === t
                    ? 'bg-[#004182] text-white border-[#004182]'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isAll ? 'Todos' : meta?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <UsersRound size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No hay grupos que coincidan</p>
          <p className="text-sm mt-1">Prueba cambiando los filtros o crea un grupo nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(g => (
            <GroupCard
              key={g.id}
              group={g}
              allUsers={users}
              onClick={() => setSelectedGroup(g)}
            />
          ))}
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-montserrat font-bold text-[#004182] text-lg">Nuevo Grupo</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <GroupForm users={users} onSave={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedGroup && (
        <GroupDetail
          group={selectedGroup}
          allUsers={users}
          canEdit={canEdit}
          onClose={() => setSelectedGroup(null)}
          onUpdate={handleUpdate}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
};

export default Grupos;
