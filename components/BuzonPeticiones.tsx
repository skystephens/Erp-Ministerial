
import React, { useState, useMemo } from 'react';
import { User, PrayerRequest, UserRole } from '../types';
import {
  Inbox, Plus, X, Edit2, Check, ChevronDown,
  HeartHandshake, AlertTriangle, ShieldAlert, CheckCircle2,
  Clock, Filter, Search, User as UserIcon, Calendar,
} from 'lucide-react';

// ── meta ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<PrayerRequest['category'], { label: string; color: string; bg: string; icon: string }> = {
  ESPIRITUAL:  { label: 'Espiritual',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   icon: '🙏' },
  SALUD:       { label: 'Salud',       color: 'text-red-600',    bg: 'bg-red-50 border-red-200',     icon: '🏥' },
  FAMILIAR:    { label: 'Familiar',    color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200', icon: '👨‍👩‍👧' },
  FINANCIERO:  { label: 'Financiero',  color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200', icon: '💼' },
  CONFESION:   { label: 'Confesión',   color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200',icon: '🤍' },
};

const URGENCY_META: Record<PrayerRequest['urgency'], { label: string; color: string; bg: string; dot: string }> = {
  CRITICA: { label: 'Crítica',  color: 'text-red-700',    bg: 'bg-red-100 border-red-300',    dot: 'bg-red-500' },
  ALTA:    { label: 'Alta',     color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300', dot: 'bg-orange-500' },
  MEDIA:   { label: 'Media',    color: 'text-amber-700',  bg: 'bg-amber-100 border-amber-300', dot: 'bg-amber-400' },
  BAJA:    { label: 'Baja',     color: 'text-slate-600',  bg: 'bg-slate-100 border-slate-300', dot: 'bg-slate-400' },
};

const STATUS_META: Record<PrayerRequest['status'], { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PENDING:              { label: 'Pendiente',          icon: <Clock size={12} />,        color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  UNDER_PRAYER:         { label: 'En oración',         icon: <HeartHandshake size={12} />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  INTERVENTION_REQUIRED:{ label: 'Intervención',       icon: <ShieldAlert size={12} />,  color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  RESOLVED:             { label: 'Resuelta',           icon: <CheckCircle2 size={12} />, color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
};

const STATUS_FLOW: PrayerRequest['status'][] = ['PENDING', 'UNDER_PRAYER', 'INTERVENTION_REQUIRED', 'RESOLVED'];

const canEdit = (role: UserRole) =>
  [UserRole.SUPER_ADMIN, UserRole.SUPERVISORA, UserRole.LIDER_MINISTERIO].includes(role);

// ── form state ────────────────────────────────────────────────────────────

interface FormState {
  authorId: string;
  authorName: string;
  category: PrayerRequest['category'];
  urgency: PrayerRequest['urgency'];
  content: string;
}

const emptyForm = (user: User): FormState => ({
  authorId: user.id,
  authorName: user.name,
  category: 'ESPIRITUAL',
  urgency: 'MEDIA',
  content: '',
});

// ── PetitionForm ──────────────────────────────────────────────────────────

interface PetitionFormProps {
  initial: FormState;
  users: User[];
  isAdmin: boolean;
  onSave: (f: FormState) => void;
  onCancel: () => void;
}

const PetitionForm: React.FC<PetitionFormProps> = ({ initial, users, isAdmin, onSave, onCancel }) => {
  const [form, setForm] = useState<FormState>(initial);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleMember = (id: string) => {
    const u = users.find(u => u.id === id);
    set('authorId', id);
    if (u) set('authorName', u.name);
  };

  const input = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ring-turqui/40';
  const label = 'text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider';

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      {isAdmin && (
        <div>
          <label className={label}>Persona</label>
          <select className={input} value={form.authorId} onChange={e => handleMember(e.target.value)}>
            <option value="">— Seleccionar miembro —</option>
            {users.filter(u => u.status === 'APPROVED' || u.status === 'PENDING_APPROVAL').map(u => (
              <option key={u.id} value={u.id}>{u.name} {u.ministry ? `· ${u.ministry}` : ''}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Categoría</label>
          <select className={input} value={form.category} onChange={e => set('category', e.target.value as PrayerRequest['category'])}>
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Urgencia</label>
          <select className={input} value={form.urgency} onChange={e => set('urgency', e.target.value as PrayerRequest['urgency'])}>
            {Object.entries(URGENCY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Petición *</label>
        <textarea
          required
          className={`${input} resize-none`}
          rows={4}
          placeholder="Describe la petición de oración o necesidad..."
          value={form.content}
          onChange={e => set('content', e.target.value)}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" className="flex-1 bg-[#004182] text-white font-bold py-2.5 rounded-xl hover:bg-turqui transition-colors text-sm">
          Guardar petición
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ── PetitionCard ──────────────────────────────────────────────────────────

interface PetitionCardProps {
  req: PrayerRequest;
  member?: User;
  showAuthor: boolean;
  canManage: boolean;
  onUpdateStatus: (id: string, s: PrayerRequest['status']) => void;
  onEdit: (req: PrayerRequest) => void;
  onDelete: (id: string) => void;
}

const PetitionCard: React.FC<PetitionCardProps> = ({
  req, member, showAuthor, canManage, onUpdateStatus, onEdit, onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_META[req.category];
  const urg = URGENCY_META[req.urgency];
  const sta = STATUS_META[req.status];
  const currentIdx = STATUS_FLOW.indexOf(req.status);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${req.urgency === 'CRITICA' ? 'border-red-200 shadow-red-50' : 'border-slate-100'}`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#004182] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {req.authorName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 text-sm">{req.authorName}</span>
                {member?.ministry && (
                  <span className="text-[10px] text-slate-400">{member.ministry}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.color} ${cat.bg}`}>
                  {cat.icon} {cat.label}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${urg.color} ${urg.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                  {urg.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${sta.color} ${sta.bg}`}>
              {sta.icon} {sta.label}
            </span>
            <ChevronDown size={14} className={`text-slate-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Preview */}
        {!expanded && (
          <p className="text-xs text-slate-500 mt-2 ml-12 line-clamp-1 italic">"{req.content}"</p>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">
          <p className="text-sm text-slate-700 italic leading-relaxed">"{req.content}"</p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={11} />
            <span>{new Date(req.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {canManage && req.status !== 'RESOLVED' && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actualizar estado</p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_FLOW.filter((_, i) => i > currentIdx).map(s => {
                  const m = STATUS_META[s];
                  return (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus(req.id, s)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm ${m.color} ${m.bg}`}
                    >
                      {m.icon} {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {canManage && (
            <div className="flex gap-2 pt-1 border-t border-slate-50">
              <button
                onClick={() => onEdit(req)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#004182] hover:text-turqui transition-colors"
              >
                <Edit2 size={12} /> Editar
              </button>
              <span className="text-slate-200">·</span>
              <button
                onClick={() => onDelete(req.id)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={12} /> Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────

interface BuzonPeticionesProps {
  user: User;
  users: User[];
  initialRequests: PrayerRequest[];
  onUpdateRequests: (reqs: PrayerRequest[]) => void;
}

const BuzonPeticiones: React.FC<BuzonPeticionesProps> = ({
  user, users, initialRequests, onUpdateRequests,
}) => {
  const isAdmin = canEdit(user.role);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PrayerRequest['status'] | 'ALL'>('ALL');
  const [filterCat, setFilterCat] = useState<PrayerRequest['category'] | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PrayerRequest | null>(null);

  // Visible requests
  const visible = useMemo(() => {
    let list = isAdmin ? initialRequests : initialRequests.filter(r => r.authorId === user.id);
    if (filterStatus !== 'ALL') list = list.filter(r => r.status === filterStatus);
    if (filterCat !== 'ALL') list = list.filter(r => r.category === filterCat);
    if (search) list = list.filter(r =>
      r.authorName.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase())
    );
    // sort: críticas primero, luego por fecha desc
    return [...list].sort((a, b) => {
      const urgOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };
      if (urgOrder[a.urgency] !== urgOrder[b.urgency]) return urgOrder[a.urgency] - urgOrder[b.urgency];
      return b.date.localeCompare(a.date);
    });
  }, [initialRequests, isAdmin, user.id, filterStatus, filterCat, search]);

  const stats = useMemo(() => ({
    total: (isAdmin ? initialRequests : initialRequests.filter(r => r.authorId === user.id)).length,
    pending: initialRequests.filter(r => r.status === 'PENDING').length,
    critical: initialRequests.filter(r => r.urgency === 'CRITICA' && r.status !== 'RESOLVED').length,
    resolved: initialRequests.filter(r => r.status === 'RESOLVED').length,
  }), [initialRequests, isAdmin, user.id]);

  const handleCreate = (f: FormState) => {
    const req: PrayerRequest = {
      id: `pr_${Date.now()}`,
      authorId: f.authorId || user.id,
      authorName: f.authorName || user.name,
      category: f.category,
      urgency: f.urgency,
      content: f.content,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    };
    onUpdateRequests([req, ...initialRequests]);
    setShowForm(false);
  };

  const handleEdit = (f: FormState) => {
    if (!editTarget) return;
    onUpdateRequests(initialRequests.map(r =>
      r.id === editTarget.id
        ? { ...r, authorId: f.authorId, authorName: f.authorName, category: f.category, urgency: f.urgency, content: f.content }
        : r
    ));
    setEditTarget(null);
  };

  const handleUpdateStatus = (id: string, status: PrayerRequest['status']) => {
    onUpdateRequests(initialRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleDelete = (id: string) => {
    onUpdateRequests(initialRequests.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-[#004182]">
            {isAdmin ? 'Buzón Pastoral' : 'Mis Peticiones'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? 'Peticiones de oración y necesidades de la congregación' : 'Tus peticiones de oración enviadas al liderazgo'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#004182] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-turqui transition-colors text-sm shadow-md"
        >
          <Plus size={16} /> Nueva Petición
        </button>
      </div>

      {/* Stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',           value: stats.total,    color: 'text-[#004182]', icon: <Inbox size={16} /> },
            { label: 'Pendientes',      value: stats.pending,  color: 'text-amber-600', icon: <Clock size={16} /> },
            { label: 'Críticas activas',value: stats.critical, color: 'text-red-600',   icon: <AlertTriangle size={16} /> },
            { label: 'Resueltas',       value: stats.resolved, color: 'text-emerald-600',icon: <CheckCircle2 size={16} /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-turqui/40"
              placeholder="Buscar por nombre o contenido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 ring-turqui/40"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
          >
            <option value="ALL">Todos los estados</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 ring-turqui/40"
            value={filterCat}
            onChange={e => setFilterCat(e.target.value as any)}
          >
            <option value="ALL">Todas las categorías</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <HeartHandshake size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No hay peticiones</p>
          <p className="text-sm mt-1">
            {isAdmin ? 'No hay solicitudes que coincidan con los filtros' : 'Aún no has enviado peticiones de oración'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(req => (
            <PetitionCard
              key={req.id}
              req={req}
              member={users.find(u => u.id === req.authorId)}
              showAuthor={isAdmin}
              canManage={isAdmin}
              onUpdateStatus={handleUpdateStatus}
              onEdit={r => setEditTarget(r)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-montserrat font-bold text-[#004182] text-lg">Nueva Petición de Oración</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <PetitionForm
              initial={emptyForm(user)}
              users={users}
              isAdmin={isAdmin}
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-montserrat font-bold text-[#004182] text-lg">Editar Petición</h2>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <PetitionForm
              initial={{
                authorId: editTarget.authorId,
                authorName: editTarget.authorName,
                category: editTarget.category,
                urgency: editTarget.urgency,
                content: editTarget.content,
              }}
              users={users}
              isAdmin={isAdmin}
              onSave={handleEdit}
              onCancel={() => setEditTarget(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BuzonPeticiones;
