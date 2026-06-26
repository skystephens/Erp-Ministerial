import React, { useState } from 'react';
import { Edit2, Save, X, Users, Radio, UserPlus, Trash2, Settings } from 'lucide-react';

// ─── Static data ──────────────────────────────────────────────────────────────

const MEMBERS_KEY = 'tafe_turno_miembros';

const DEFAULT_MEMBERS = [
  'Jorge', 'Sky', 'Guillermo', 'Jeferson', 'Jhony', 'Shungú',
  'Heidy', 'Karen', 'Juan Diego', 'Jimmy', 'Emmanuel', 'Luis Carlos',
  'Janamy', 'Ares', 'Jordany',
];

const loadMembers = (): string[] => {
  try {
    const stored = localStorage.getItem(MEMBERS_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch { /* ignore */ }
  return DEFAULT_MEMBERS;
};

const saveMembers = (members: string[]) => {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

// ─── Manage Members Modal ─────────────────────────────────────────────────────

const ManageMembers: React.FC<{
  members: string[];
  onChange: (members: string[]) => void;
  onClose: () => void;
}> = ({ members, onChange, onClose }) => {
  const [list, setList] = useState<string[]>([...members]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newName, setNewName] = useState('');

  const startEdit = (idx: number) => { setEditingIdx(idx); setEditValue(list[idx]); };

  const confirmEdit = (idx: number) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setList(list.map((m, i) => (i === idx ? trimmed : m)));
    setEditingIdx(null);
  };

  const remove = (idx: number) => {
    setList(list.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const addNew = () => {
    const trimmed = newName.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] p-6 shadow-xl w-full max-w-sm space-y-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Configuración</p>
            <h4 className="font-montserrat font-bold text-slate-800 text-base">Miembros del equipo</h4>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {list.map((member, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {editingIdx === idx ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmEdit(idx); if (e.key === 'Escape') setEditingIdx(null); }}
                    className="flex-1 text-xs bg-white border border-turqui rounded-xl px-3 py-1.5 outline-none focus:ring-1 ring-turqui"
                  />
                  <button onClick={() => confirmEdit(idx)} className="p-1.5 bg-turqui text-white rounded-lg hover:bg-turqui/80 transition-all">
                    <Save size={12} />
                  </button>
                  <button onClick={() => setEditingIdx(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all">
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">{member}</span>
                  <button onClick={() => startEdit(idx)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:text-turqui border border-transparent transition-all">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => remove(idx)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 border border-transparent transition-all">
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1 border-t border-slate-100">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addNew(); }}
            placeholder="Nuevo miembro..."
            className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 ring-turqui"
          />
          <button
            onClick={addNew}
            disabled={!newName.trim() || list.includes(newName.trim())}
            className="p-2 bg-turqui text-white rounded-xl hover:bg-turqui/80 transition-all disabled:opacity-40"
          >
            <UserPlus size={14} />
          </button>
        </div>

        <button
          onClick={() => { onChange(list); onClose(); }}
          className="w-full py-2.5 bg-navy-tafe text-white text-xs font-bold rounded-xl hover:bg-navy-tafe/90 transition-all"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

const ROLES = [
  { id: 'pc1',    label: 'Pantalla PC 1',          color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'switch', label: 'Switch PC 2 — En Vivo',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'luces',  label: 'Luces',                  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'cam1',   label: 'Cámara 1',               color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'cam2',   label: 'Cámara 2',               color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'sonido', label: 'Sonido',                 color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const SERVICES = [
  { id: 'vie_8pm',  label: 'Viernes 8PM'  },
  { id: 'dom_8am',  label: 'Domingo 8AM'  },
  { id: 'dom_10am', label: 'Domingo 10AM' },
];

type TurnoGrid = Record<string, Record<string, string[]>>;

const DEFAULT_TURNO: TurnoGrid = {
  pc1:    { vie_8pm: ['Jorge'],     dom_8am: ['Heidy', 'Karen'], dom_10am: ['Janamy']      },
  switch: { vie_8pm: ['Sky'],       dom_8am: ['Juan Diego'],     dom_10am: []              },
  luces:  { vie_8pm: ['Guillermo'], dom_8am: ['Guillermo'],      dom_10am: ['Luis Carlos'] },
  cam1:   { vie_8pm: ['Jeferson'],  dom_8am: ['Jimmy'],          dom_10am: []              },
  cam2:   { vie_8pm: ['Jhony'],     dom_8am: ['Emmanuel'],       dom_10am: []              },
  sonido: { vie_8pm: ['Shungú'],    dom_8am: ['Shungú'],         dom_10am: []              },
};

const STORAGE_KEY = 'tafe_turno_csi';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TurnoCSIProps {
  canEdit?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const TurnoCSI: React.FC<TurnoCSIProps> = ({ canEdit = false }) => {
  const [turno, setTurno] = useState<TurnoGrid>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TURNO;
    } catch {
      return DEFAULT_TURNO;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TurnoGrid>(DEFAULT_TURNO);
  const [activeCell, setActiveCell] = useState<{ roleId: string; svcId: string } | null>(null);
  const [members, setMembers] = useState<string[]>(loadMembers);
  const [showManageMembers, setShowManageMembers] = useState(false);

  const handleMembersChange = (updated: string[]) => {
    setMembers(updated);
    saveMembers(updated);
  };

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(turno)));
    setIsEditing(true);
    setActiveCell(null);
  };

  const saveEdit = () => {
    setTurno(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setIsEditing(false);
    setActiveCell(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setActiveCell(null);
  };

  const toggleMember = (roleId: string, svcId: string, member: string) => {
    setDraft(prev => {
      const next = { ...prev, [roleId]: { ...prev[roleId] } };
      const cell = [...(next[roleId][svcId] ?? [])];
      const idx = cell.indexOf(member);
      if (idx >= 0) cell.splice(idx, 1);
      else cell.push(member);
      next[roleId][svcId] = cell;
      return next;
    });
  };

  const source = isEditing ? draft : turno;
  const isCellActive = (roleId: string, svcId: string) =>
    activeCell?.roleId === roleId && activeCell?.svcId === svcId;

  return (
    <div className="space-y-5 animate-fadeIn">
      {showManageMembers && (
        <ManageMembers
          members={members}
          onChange={handleMembersChange}
          onClose={() => setShowManageMembers(false)}
        />
      )}
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio size={18} className="text-turqui" />
          <div>
            <h3 className="font-montserrat font-bold text-slate-800">Turno de Servicio CSI</h3>
            <p className="text-[10px] text-slate-400">Asignación de roles por servicio semanal</p>
          </div>
        </div>

        {canEdit && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowManageMembers(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-turqui hover:text-turqui transition-all"
            >
              <Settings size={14} /> Equipo
            </button>
            <button
              onClick={startEdit}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-turqui hover:text-turqui transition-all"
            >
              <Edit2 size={14} /> Editar Turnos
            </button>
          </div>
        )}
        {canEdit && isEditing && (
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={saveEdit}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-turqui rounded-xl shadow-md shadow-turqui/20 hover:bg-turqui/90 transition-all"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[2rem] border border-slate-200 shadow-sm bg-white">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-44">
                Rol / Estación
              </th>
              {SERVICES.map(svc => (
                <th key={svc.id} className="px-4 py-4 text-center text-[10px] font-bold text-navy-tafe uppercase tracking-widest">
                  {svc.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, rIdx) => (
              <React.Fragment key={role.id}>
                <tr className={`border-b border-slate-50 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  {/* Role label */}
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[10px] font-bold px-3 py-1.5 rounded-xl border ${role.color}`}>
                      {role.label}
                    </span>
                  </td>

                  {/* Service cells */}
                  {SERVICES.map(svc => {
                    const members = source[role.id]?.[svc.id] ?? [];
                    const isActive = isCellActive(role.id, svc.id);

                    return (
                      <td key={svc.id} className="px-4 py-3 text-center align-top">
                        <div
                          onClick={() => {
                            if (!isEditing) return;
                            setActiveCell(isActive ? null : { roleId: role.id, svcId: svc.id });
                          }}
                          className={`inline-flex flex-wrap justify-center gap-1 min-h-[32px] min-w-[90px] px-2 py-1.5 rounded-xl transition-all ${
                            isEditing
                              ? isActive
                                ? 'bg-turqui/10 border-2 border-turqui cursor-pointer'
                                : 'bg-slate-100 border-2 border-dashed border-slate-200 cursor-pointer hover:border-turqui/40'
                              : ''
                          }`}
                        >
                          {members.length === 0 ? (
                            <span className="text-[10px] text-slate-300 font-medium self-center">—</span>
                          ) : (
                            members.map(m => (
                              <span
                                key={m}
                                className="text-[10px] font-bold text-navy-tafe bg-navy-tafe/5 border border-navy-tafe/10 px-2 py-0.5 rounded-lg"
                              >
                                {m}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Member picker row — appears below the active cell's row */}
                {isEditing && activeCell?.roleId === role.id && (
                  <tr className="bg-turqui/5 border-b border-turqui/10">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <p className="text-[9px] font-bold text-turqui uppercase tracking-widest flex items-center gap-1.5">
                          <Users size={10} />
                          {role.label} · {SERVICES.find(s => s.id === activeCell.svcId)?.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {members.map(m => {
                            const selected = (draft[role.id]?.[activeCell.svcId] ?? []).includes(m);
                            return (
                              <button
                                key={m}
                                onClick={() => toggleMember(role.id, activeCell.svcId, m)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                                  selected
                                    ? 'bg-turqui text-white border-turqui shadow-md shadow-turqui/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-turqui/50'
                                }`}
                              >
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <p className="text-[10px] text-slate-400 text-center">
          Toca una celda para asignar o quitar miembros · Los cambios se guardan localmente
        </p>
      )}
    </div>
  );
};

export default TurnoCSI;
